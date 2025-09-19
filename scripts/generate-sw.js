#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Get git hash for versioning (fallback to timestamp)
function getVersion() {
  try {
    const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const timestamp = Date.now();
    return `${gitHash}-${timestamp}`;
  } catch {
    return Date.now().toString();
  }
}

// Generate content hash for cache busting
function getContentHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

// Read the service worker template
const swTemplatePath = path.join(__dirname, '..', 'public', 'sw-template.js');
const swOutputPath = path.join(__dirname, '..', 'public', 'sw.js');

// Generate the service worker with version
function generateServiceWorker() {
  const version = getVersion();
  const buildTime = new Date().toISOString();

  // Read template or existing sw.js
  let swContent;
  if (fs.existsSync(swTemplatePath)) {
    swContent = fs.readFileSync(swTemplatePath, 'utf-8');
  } else {
    swContent = fs.readFileSync(swOutputPath, 'utf-8');
  }

  // Replace version placeholders
  swContent = swContent.replace(/const SW_VERSION = .*?;/, `const SW_VERSION = "${version}";`);
  swContent = swContent.replace(/const BUILD_TIME = .*?;/, `const BUILD_TIME = "${buildTime}";`);

  // Calculate content hash
  const contentHash = getContentHash(swContent);

  // Write the generated service worker
  fs.writeFileSync(swOutputPath, swContent);

  console.log(`✅ Service Worker generated successfully!`);
  console.log(`   Version: ${version}`);
  console.log(`   Build Time: ${buildTime}`);
  console.log(`   Content Hash: ${contentHash}`);

  // Also update a version file for reference
  const versionInfo = {
    version,
    buildTime,
    contentHash,
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'sw-version.json'),
    JSON.stringify(versionInfo, null, 2)
  );
}

// Run the generation
generateServiceWorker();