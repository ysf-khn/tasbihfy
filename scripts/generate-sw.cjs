#!/usr/bin/env node

/**
 * Stamps public/sw.js with a build-specific CACHE_NAME.
 *
 * The service worker's activate handler deletes every cache whose name does
 * not match CACHE_NAME, so changing it on each build is what guarantees users
 * get fresh assets instead of a stale shell. Doing that by hand is easy to
 * forget, which is the bug this prevents.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SW_PATH = path.join(__dirname, "..", "public", "sw.js");
const VERSION_PATH = path.join(__dirname, "..", "public", "sw-version.json");

// Prefer the commit hash: deterministic, so rebuilding the same commit does
// not churn the file. Fall back to a timestamp outside a git checkout.
function getVersion() {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return String(Date.now());
  }
}

function generateServiceWorker() {
  if (!fs.existsSync(SW_PATH)) {
    console.error(`❌ Service worker not found at ${SW_PATH}`);
    process.exit(1);
  }

  const version = getVersion();
  const cacheName = `tasbihfy-${version}`;
  const source = fs.readFileSync(SW_PATH, "utf-8");

  const pattern = /const CACHE_NAME = "[^"]*";/;
  if (!pattern.test(source)) {
    // Fail loudly rather than silently shipping an unbumped cache name.
    console.error("❌ Could not find a CACHE_NAME declaration in public/sw.js");
    process.exit(1);
  }

  const updated = source.replace(pattern, `const CACHE_NAME = "${cacheName}";`);

  if (updated !== source) {
    fs.writeFileSync(SW_PATH, updated);
  }

  fs.writeFileSync(
    VERSION_PATH,
    JSON.stringify({ cacheName, version, buildTime: new Date().toISOString() }, null, 2) + "\n"
  );

  console.log(`✅ Service worker cache name set to ${cacheName}`);
}

generateServiceWorker();
