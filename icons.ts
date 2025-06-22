import sharp from 'sharp';
import path from 'path';

interface IconConfig {
  size: number;
  prefixes: string[];
}

const icons: IconConfig[] = [
  { size: 192, prefixes: ['icon-', 'android-chrome-'] },
  { size: 384, prefixes: ['icon-', 'android-chrome-'] },
  { size: 512, prefixes: ['icon-'] }
];

const sourceImage = path.join(process.cwd(), 'public', 'coin.png');
const outputDir = path.join(process.cwd(), 'public', 'icons');

async function generateIcons() {
  try {
    for (const icon of icons) {
      for (const prefix of icon.prefixes) {
        await sharp(sourceImage)
          .resize(icon.size, icon.size)
          .png()
          .toFile(path.join(outputDir, `${prefix}${icon.size}x${icon.size}.png`));
        
        console.log(`Generated ${prefix}${icon.size}x${icon.size}.png`);
      }
    }
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();