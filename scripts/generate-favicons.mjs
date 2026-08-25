import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourcePath = 'C:/Users/fab5k/.gemini/antigravity-ide/brain/cf44e883-5b6e-4116-82f6-1cb70ad0953c/.user_uploaded/media_1787683469378.png';
const rootDir = 'd:/VS Code/Qubtic';

async function generate() {
  console.log('Generating favicons and app icons from:', sourcePath);

  // Trim transparent padding if any, and make square with high quality
  const image = sharp(sourcePath).trim();

  // 1. Icon 512x512
  const icon512 = await sharp(sourcePath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 2. Apple Icon 180x180
  const apple180 = await sharp(sourcePath)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 3. Favicon 32x32 / 64x64
  const favicon64 = await sharp(sourcePath)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const favicon32 = await sharp(sourcePath)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Write to public
  fs.writeFileSync(path.join(rootDir, 'public/favicon.png'), favicon64);
  fs.writeFileSync(path.join(rootDir, 'public/icon.png'), icon512);
  fs.writeFileSync(path.join(rootDir, 'public/apple-icon.png'), apple180);
  fs.writeFileSync(path.join(rootDir, 'public/favicon.ico'), favicon32);

  // Write to src/app for Next.js App Router automatic metadata resolution
  fs.writeFileSync(path.join(rootDir, 'src/app/icon.png'), icon512);
  fs.writeFileSync(path.join(rootDir, 'src/app/apple-icon.png'), apple180);
  fs.writeFileSync(path.join(rootDir, 'src/app/favicon.ico'), favicon32);

  // Write brand icon
  fs.writeFileSync(path.join(rootDir, 'public/images/brand/qubtic-icon.png'), icon512);

  console.log('Successfully generated all favicons and icons!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
