import fs from "fs";
import path from "path";
import heicConvert from "heic-convert";
import sharp from "sharp";
import galleryManifest from "@/data/gallery-manifest.json";

export const PUBLIC_GALLERY_DIR = path.join(process.cwd(), "public", "Our Gallery");
export const PRIVATE_GALLERY_DIR = path.join(process.cwd(), "private_gallery");
export const THUMBS_DIR = path.join(process.cwd(), "public", "_gallery_thumbs");
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
  relativePath?: string;
  type: MediaType;
  format: string;
  sizeBytes: number;
  mtime: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  mediaUrl?: string;
  thumbUrl?: string | null;
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

/**
 * Generate a safe URL-friendly identifier for a file
 */
export function encodeMediaId(filename: string): string {
  return Buffer.from(filename, "utf-8").toString("base64url");
}

/**
 * Decode and strictly validate that the requested file resides securely
 */
export function resolveSafeMediaPath(mediaId: string): { filePath: string; filename: string } | null {
  try {
    const rawName = Buffer.from(mediaId, "base64url").toString("utf-8");
    const safeName = path.basename(rawName);

    // 1. Try public/Our Gallery (preferred in production / Vercel)
    const publicPath = path.resolve(PUBLIC_GALLERY_DIR, safeName);
    if (publicPath.startsWith(PUBLIC_GALLERY_DIR) && fs.existsSync(publicPath)) {
      const stat = fs.statSync(publicPath);
      if (stat.isFile()) {
        return { filePath: publicPath, filename: safeName };
      }
    }

    // 2. Try private_gallery fallback (if present locally)
    if (fs.existsSync(PRIVATE_GALLERY_DIR)) {
      const privatePath = path.resolve(PRIVATE_GALLERY_DIR, safeName);
      if (privatePath.startsWith(PRIVATE_GALLERY_DIR) && fs.existsSync(privatePath)) {
        const stat = fs.statSync(privatePath);
        if (stat.isFile()) {
          return { filePath: privatePath, filename: safeName };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieve the media list:
 * Uses pre-computed build-time manifest in production for guaranteed 100% Vercel reliability.
 */
export async function getPrivateMediaList(): Promise<MediaItem[]> {
  // 1. Always use build-time manifest if available (guarantees all 49 items on Vercel)
  if (Array.isArray(galleryManifest) && galleryManifest.length > 0) {
    return galleryManifest as MediaItem[];
  }

  // 2. Dynamic fallback scanning
  const searchDir = fs.existsSync(PUBLIC_GALLERY_DIR)
    ? PUBLIC_GALLERY_DIR
    : fs.existsSync(PRIVATE_GALLERY_DIR)
    ? PRIVATE_GALLERY_DIR
    : null;

  if (!searchDir) {
    console.warn("No gallery directory found on server.");
    return [];
  }

  const entries = await fs.promises.readdir(searchDir);
  const items: MediaItem[] = [];

  for (const entry of entries) {
    if (entry.startsWith(".") || entry === ".cache" || entry === "_gallery_thumbs") {
      continue;
    }

    const filePath = path.join(searchDir, entry);
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

      const id = encodeMediaId(entry);
      items.push({
        id,
        filename: entry,
        relativePath: entry,
        type,
        format: ext.replace(".", "").toUpperCase(),
        sizeBytes: stat.size,
        mtime: stat.mtimeMs,
        width: 720,
        height: 960,
        aspectRatio: 0.75,
        mediaUrl: `/Our%20Gallery/${encodeURIComponent(entry)}`,
        thumbUrl: type === "image" ? `/_gallery_thumbs/thumb_${encodeURIComponent(entry)}.webp` : null,
      });
    } catch {
      // Ignore unreadable entries
    }
  }

  items.sort((a, b) =>
    a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: "base" })
  );

  return items;
}

/**
 * Get or convert web-friendly image buffer
 */
export async function getWebFriendlyImage(
  filePath: string,
  isThumbnail: boolean = false
): Promise<{ buffer: Buffer; contentType: string }> {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  // Check pre-generated public thumbnails first
  if (isThumbnail) {
    const publicThumb = path.join(THUMBS_DIR, `thumb_${filename}.webp`);
    if (fs.existsSync(publicThumb)) {
      const buffer = await fs.promises.readFile(publicThumb);
      return { buffer, contentType: "image/webp" };
    }
  }

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
      .rotate()
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
