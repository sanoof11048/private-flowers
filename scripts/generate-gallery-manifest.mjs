import fs from "fs";
import path from "path";
import sharp from "sharp";
import heicConvert from "heic-convert";

const ROOT_DIR = process.cwd();
const GALLERY_SOURCE_DIR = path.join(ROOT_DIR, "public", "Our Gallery");
const THUMBS_DIR = path.join(ROOT_DIR, "public", "_gallery_thumbs");
const DATA_DIR = path.join(ROOT_DIR, "src", "data");
const MANIFEST_PATH = path.join(DATA_DIR, "gallery-manifest.json");
const PREV_CACHE_DIR = path.join(ROOT_DIR, "private_gallery", ".cache");

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

// Ensure destination directories exist
if (!fs.existsSync(THUMBS_DIR)) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Scan directory recursively for all media files
 */
function scanDirectory(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "_gallery_thumbs" || entry.name === ".cache") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_IMAGE_EXTENSIONS.has(ext) || SUPPORTED_VIDEO_EXTENSIONS.has(ext)) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        files.push({ fullPath, relativePath, name: entry.name, ext });
      }
    }
  }

  return files;
}

async function generateManifest() {
  console.log("Discovering memories from:", GALLERY_SOURCE_DIR);
  const discovered = scanDirectory(GALLERY_SOURCE_DIR);
  console.log(`Found ${discovered.length} media files.`);

  // Sort naturally (IMG_3332, IMG_6200, etc.)
  discovered.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );

  const manifest = [];

  for (const item of discovered) {
    const isImage = SUPPORTED_IMAGE_EXTENSIONS.has(item.ext);
    const isVideo = SUPPORTED_VIDEO_EXTENSIONS.has(item.ext);
    const stat = fs.statSync(item.fullPath);
    const id = Buffer.from(item.relativePath, "utf-8").toString("base64url");
    const safeThumbName = `thumb_${item.name}.webp`;
    const destThumbPath = path.join(THUMBS_DIR, safeThumbName);

    let width = 720;
    let height = 960;
    let aspectRatio = 0.75;
    let thumbUrl = null;

    if (isImage) {
      thumbUrl = `/_gallery_thumbs/${encodeURIComponent(safeThumbName)}`;

      // 1. Check if thumbnail already in destination
      if (!fs.existsSync(destThumbPath)) {
        // 2. Check if already generated in previous cache
        const prevCachedThumb = path.join(PREV_CACHE_DIR, safeThumbName);
        if (fs.existsSync(prevCachedThumb)) {
          fs.copyFileSync(prevCachedThumb, destThumbPath);
        } else {
          // 3. Generate thumbnail now
          try {
            let buffer = fs.readFileSync(item.fullPath);
            if (item.ext === ".heic") {
              const converted = await heicConvert({
                buffer,
                format: "JPEG",
                quality: 0.88,
              });
              buffer = Buffer.from(converted);
            }

            const thumbBuffer = await sharp(buffer)
              .rotate()
              .resize({ width: 720, withoutEnlargement: true })
              .webp({ quality: 82 })
              .toBuffer();

            fs.writeFileSync(destThumbPath, thumbBuffer);
          } catch (err) {
            console.warn(`Could not generate thumbnail for ${item.name}:`, err.message);
          }
        }
      }

      // Read dimensions from thumbnail
      if (fs.existsSync(destThumbPath)) {
        try {
          const meta = await sharp(destThumbPath).metadata();
          if (meta.width && meta.height) {
            width = meta.width;
            height = meta.height;
            aspectRatio = Number((meta.width / meta.height).toFixed(3));
          }
        } catch {
          // Keep defaults
        }
      }
    }

    // Encoded URL path for public serving
    const encodedRelativePath = item.relativePath
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    manifest.push({
      id,
      filename: item.name,
      relativePath: item.relativePath,
      type: isVideo ? "video" : "image",
      format: item.ext.replace(".", "").toUpperCase(),
      sizeBytes: stat.size,
      mtime: stat.mtimeMs,
      width,
      height,
      aspectRatio,
      mediaUrl: `/Our%20Gallery/${encodedRelativePath}`,
      thumbUrl,
    });
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Successfully generated gallery manifest with ${manifest.length} items at:`);
  console.log(MANIFEST_PATH);
}

generateManifest().catch((err) => {
  console.error("Error generating gallery manifest:", err);
  process.exit(1);
});
