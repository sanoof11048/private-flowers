const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'public', 'flowers');
const outputDir = path.join(__dirname, 'public', 'flowers_transparent');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function removeBlackBackground(inputPath, outputPath, tolerance = 15) {
  try {
    const image = sharp(inputPath);
    const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels; // 4 (RGBA)
    
    // Find flower center area to protect flower core
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.hypot(cx, cy);

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const px = (i / channels) % width;
      const py = Math.floor((i / channels) / width);
      const distFromCenter = Math.hypot(px - cx, py - cy) / maxDist; // 0 to 1

      // Brightness / Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxCol = Math.max(r, g, b);

      // Edge fade
      if (maxCol < tolerance) {
        data[i + 3] = 0; // Pure transparent
      } else if (maxCol < tolerance + 35) {
        // Soft feathering
        const factor = (maxCol - tolerance) / 35;
        data[i + 3] = Math.round(factor * 255);
      } else if (distFromCenter > 0.45 && maxCol < 45) {
        const factor = Math.max(0, (maxCol - 15) / 30);
        data[i + 3] = Math.round(factor * 255);
      }
    }

    await sharp(data, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outputPath);

    console.log(`Processed: ${path.basename(outputPath)}`);
  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err);
  }
}

async function main() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.jpg') && !f.includes('_bloom_') && !f.includes('_sprig_') && !f.includes('_branch_'));
  
  for (const file of files) {
    const inPath = path.join(inputDir, file);
    const outName = file.replace('.jpg', '.png');
    const outPath = path.join(outputDir, outName);
    await removeBlackBackground(inPath, outPath);
  }
  console.log('All flower images converted to transparent PNGs!');
}

main();
