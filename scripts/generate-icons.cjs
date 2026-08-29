const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure directories exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const publicDir = path.join(__dirname, '..', 'public');

// Source images
const faviconSource = path.join(publicDir, 'tasbihfy_favicon.png');
const logoSource = path.join(publicDir, 'tasbihfy_logo.png');

// Icon sizes for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Favicon sizes
const faviconSizes = [16, 32, 48];

async function generateIcons() {
  console.log('Starting icon generation...');

  try {
    // Generate PWA icons from logo
    console.log('Generating PWA icons...');
    for (const size of iconSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await sharp(logoSource)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`Generated: icon-${size}x${size}.png`);
    }

    // Generate Apple Touch Icon (180x180)
    console.log('Generating Apple Touch Icon...');
    await sharp(logoSource)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated: apple-touch-icon.png');

    // Generate favicon files
    console.log('Generating favicon files...');

    // Create individual favicon sizes first
    const faviconFiles = [];
    for (const size of faviconSizes) {
      const tempPath = path.join(publicDir, `favicon-${size}.png`);
      await sharp(faviconSource)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 87, g: 197, b: 182, alpha: 1 }
        })
        .png()
        .toFile(tempPath);
      faviconFiles.push(tempPath);
      console.log(`Generated temporary: favicon-${size}.png`);
    }

    // For now, just use the 32x32 as favicon.ico (we'll convert to ICO manually if needed)
    await sharp(faviconSource)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 87, g: 197, b: 182, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));

    // Copy 32x32 as favicon.ico for now (browsers can handle PNG with .ico extension)
    fs.copyFileSync(
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon.ico')
    );

    // Cleanup temporary files
    faviconFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    console.log('✅ All icons generated successfully!');
    console.log('\nGenerated files:');
    console.log('- favicon.ico');
    console.log('- apple-touch-icon.png');
    iconSizes.forEach(size => console.log(`- icons/icon-${size}x${size}.png`));

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();