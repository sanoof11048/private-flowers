import fs from "fs";
import path from "path";
import heicConvert from "heic-convert";
import sharp from "sharp";

export const PRIVATE_GALLERY_DIR = path.join(process.cwd(), "private_gallery");
export const CACHE_DIR = path.join(PRIVATE_GALLERY_DIR, ".cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (err) {
    console.warn("Could not create cache directory:", err);
  }
}

export type MediaType = "image" | "video";

export interface MediaItem {
  id: string;
  filename: string;
  type: MediaType;
  format: string;
  sizeBytes: number;
  mtime: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".heic",
]);

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
]);

// In-memory metadata dimension cache
const dimensionsCache = new Map<string, { width: number; height: number; aspectRatio: number }>();

/**
 * Generate a safe URL-friendly identifier for a file
 */
export function encodeMediaId(filename: string): string {
  return Buffer.from(filename, "utf-8").toString("base64url");
}

/**
 * Decode and strictly validate that the requested file resides securely inside PRIVATE_GALLERY_DIR
 */
export function resolveSafeMediaPath(mediaId: string): { filePath: string; filename: string } | null {
  try {
    const filename = Buffer.from(mediaId, "base64url").toString("utf-8");
    // Normalize and prevent directory traversal
    const safeName = path.basename(filename);
    const resolvedPath = path.resolve(PRIVATE_GALLERY_DIR, safeName);

    if (!resolvedPath.startsWith(PRIVATE_GALLERY_DIR)) {
      return null;
    }

    if (!fs.existsSync(resolvedPath)) {
      return null;
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
      return null;
    }

    return { filePath: resolvedPath, filename: safeName };
  } catch {
    return null;
  }
}

/**
 * Scan private_gallery directory and return sorted metadata list
 */
export async function getPrivateMediaList(): Promise<MediaItem[]> {
  if (!fs.existsSync(PRIVATE_GALLERY_DIR)) {
    return [];
  }

  const entries = await fs.promises.readdir(PRIVATE_GALLERY_DIR);
  const items: MediaItem[] = [];

  for (const entry of entries) {
    // Ignore hidden files and .cache folder
    if (entry.startsWith(".") || entry === ".cache") {
      continue;
    }

    const filePath = path.join(PRIVATE_GALLERY_DIR, entry);
    try {
      const stat = await fs.promises.stat(filePath);
      if (!stat.isFile()) continue;

      const ext = path.extname(entry).toLowerCase();
      let type: MediaType | null = null;

      if (SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
        type = "image";
      } else if (SUPPORTED_VIDEO_EXTENSIONS.has(ext)) {
        type = "video";
      }

      if (!type) continue;

      let width = 720;
      let height = 960;
      let aspectRatio = 0.75;

      if (type === "video") {
        aspectRatio = 0.75;
      } else {
        if (dimensionsCache.has(entry)) {
          const cached = dimensionsCache.get(entry)!;
          width = cached.width;
          height = cached.height;
          aspectRatio = cached.aspectRatio;
        } else {
          const cachedThumb = path.join(CACHE_DIR, `thumb_${entry}.webp`);
          if (fs.existsSync(cachedThumb)) {
            try {
              const meta = await sharp(cachedThumb).metadata();
              if (meta.width && meta.height) {
                width = meta.width;
                height = meta.height;
                aspectRatio = Number((meta.width / meta.height).toFixed(3));
                dimensionsCache.set(entry, { width, height, aspectRatio });
              }
            } catch {
              // fallback
            }
          }
        }
      }

      items.push({
        id: encodeMediaId(entry),
        filename: entry,
        type,
        format: ext.replace(".", "").toUpperCase(),
        sizeBytes: stat.size,
        mtime: stat.mtimeMs,
        width,
        height,
        aspectRatio,
      });
    } catch {
      // Ignore unreadable entries
    }
  }

  // Sort by filename naturally (e.g. IMG_3332, IMG_6200, IMG_6201...)
  items.sort((a, b) =>
    a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: "base" })
  );

  return items;
}

/**
 * Get or convert web-friendly image buffer
 * Converts HEIC to JPEG/WebP and caches result for subsequent high-speed serving
 */
export async function getWebFriendlyImage(
  filePath: string,
  isThumbnail: boolean = false
): Promise<{ buffer: Buffer; contentType: string }> {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  const cacheKey = isThumbnail
    ? `thumb_${filename}.webp`
    : ext === ".heic"
    ? `full_${filename}.jpg`
    : null;

  if (cacheKey) {
    const cachedFilePath = path.join(CACHE_DIR, cacheKey);
    if (fs.existsSync(cachedFilePath)) {
      const buffer = await fs.promises.readFile(cachedFilePath);
      return {
        buffer,
        contentType: cacheKey.endsWith(".webp") ? "image/webp" : "image/jpeg",
      };
    }
  }

  let rawBuffer = await fs.promises.readFile(filePath);

  // If HEIC, convert to JPEG buffer first
  if (ext === ".heic") {
    const converted = await heicConvert({
      buffer: rawBuffer,
      format: "JPEG",
      quality: 0.9,
    });
    rawBuffer = Buffer.from(converted as ArrayBuffer);

    // Save full converted JPEG to cache
    if (!isThumbnail) {
      try {
        const fullCachedPath = path.join(CACHE_DIR, `full_${filename}.jpg`);
        await fs.promises.writeFile(fullCachedPath, rawBuffer);
      } catch (err) {
        console.warn("Could not write full cache:", err);
      }
      return { buffer: rawBuffer, contentType: "image/jpeg" };
    }
  }

  // If thumbnail requested, resize to 720px width webp using sharp
  if (isThumbnail) {
    const thumbBuffer = await sharp(rawBuffer)
      .rotate() // auto-orient based on EXIF
      .resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    try {
      const thumbCachedPath = path.join(CACHE_DIR, `thumb_${filename}.webp`);
      await fs.promises.writeFile(thumbCachedPath, thumbBuffer);
    } catch (err) {
      console.warn("Could not write thumb cache:", err);
    }

    return { buffer: thumbBuffer, contentType: "image/webp" };
  }

  // Determine MIME type
  let contentType = "application/octet-stream";
  if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".webp") contentType = "image/webp";
  else if (ext === ".gif") contentType = "image/gif";
  else if (ext === ".avif") contentType = "image/avif";

  return { buffer: rawBuffer, contentType };
}
