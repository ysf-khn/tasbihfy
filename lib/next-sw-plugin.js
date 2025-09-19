// Next.js plugin for service worker build optimization
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class NextServiceWorkerPlugin {
  constructor(options = {}) {
    this.options = {
      swSrc: path.join(process.cwd(), 'public', 'sw-template.js'),
      swDest: path.join(process.cwd(), 'public', 'sw.js'),
      generateVersionFile: true,
      ...options,
    };
  }

  apply(nextConfig) {
    return {
      ...nextConfig,
      webpack: (config, options) => {
        // Apply any existing webpack config
        if (typeof nextConfig.webpack === 'function') {
          config = nextConfig.webpack(config, options);
        }

        // Only run on client build
        if (!options.isServer) {
          // Add plugin to generate service worker on build
          config.plugins.push({
            apply: (compiler) => {
              compiler.hooks.emit.tapAsync(
                'NextServiceWorkerPlugin',
                async (compilation, callback) => {
                  try {
                    // Generate service worker
                    await this.generateServiceWorker(compilation);
                    callback();
                  } catch (error) {
                    callback(error);
                  }
                }
              );
            },
          });
        }

        return config;
      },

      // Add headers for service worker
      async headers() {
        const headers = await (nextConfig.headers ? nextConfig.headers() : []);

        // Ensure service worker has correct headers
        const swHeadersIndex = headers.findIndex(h => h.source === '/sw.js');
        if (swHeadersIndex === -1) {
          headers.push({
            source: '/sw.js',
            headers: [
              {
                key: 'Content-Type',
                value: 'application/javascript; charset=utf-8',
              },
              {
                key: 'Cache-Control',
                value: 'max-age=0, must-revalidate',
              },
              {
                key: 'Service-Worker-Allowed',
                value: '/',
              },
            ],
          });
        }

        return headers;
      },
    };
  }

  async generateServiceWorker(compilation) {
    // Get build hash from webpack compilation
    const buildHash = compilation.hash || crypto.randomBytes(8).toString('hex');
    const buildTime = new Date().toISOString();

    // Get list of static assets from compilation
    const staticAssets = this.getStaticAssets(compilation);

    // Read template
    let swContent = fs.readFileSync(this.options.swSrc, 'utf-8');

    // Replace version placeholders
    swContent = swContent.replace(
      /const SW_VERSION = .*?;/,
      `const SW_VERSION = "${buildHash}-${Date.now()}";`
    );
    swContent = swContent.replace(
      /const BUILD_TIME = .*?;/,
      `const BUILD_TIME = "${buildTime}";`
    );

    // Add precache manifest
    const precacheManifest = this.generatePrecacheManifest(staticAssets);
    swContent = swContent.replace(
      /\/\/ PRECACHE_MANIFEST_PLACEHOLDER/,
      `const PRECACHE_MANIFEST = ${JSON.stringify(precacheManifest, null, 2)};`
    );

    // Write service worker
    fs.writeFileSync(this.options.swDest, swContent);

    // Generate version file
    if (this.options.generateVersionFile) {
      const versionInfo = {
        version: `${buildHash}-${Date.now()}`,
        buildTime,
        buildHash,
        assetsCount: staticAssets.length,
        precacheSize: precacheManifest.reduce((acc, item) => acc + (item.size || 0), 0),
      };

      fs.writeFileSync(
        path.join(path.dirname(this.options.swDest), 'sw-version.json'),
        JSON.stringify(versionInfo, null, 2)
      );
    }

    console.log(`[SW Plugin] Service Worker generated: v${buildHash}`);
  }

  getStaticAssets(compilation) {
    const assets = [];
    const publicPath = compilation.options.output.publicPath || '/';

    for (const [filename, asset] of Object.entries(compilation.assets)) {
      // Only include certain file types
      if (
        filename.match(/\.(js|css|png|jpg|jpeg|svg|ico|webp|avif)$/i) &&
        !filename.includes('sw.js') &&
        !filename.includes('.map')
      ) {
        assets.push({
          url: publicPath + filename,
          revision: this.getFileHash(asset.source()),
          size: asset.size(),
        });
      }
    }

    return assets;
  }

  generatePrecacheManifest(assets) {
    // Sort by size and take only essential assets
    const sortedAssets = assets.sort((a, b) => a.size - b.size);

    // Include only critical assets in precache
    const criticalAssets = sortedAssets.filter(asset => {
      return (
        asset.url.includes('/_next/static/') ||
        asset.url.includes('/icons/') ||
        asset.url.match(/\.(css|ico)$/i)
      );
    });

    return criticalAssets.slice(0, 50); // Limit precache size
  }

  getFileHash(content) {
    return crypto
      .createHash('md5')
      .update(content)
      .digest('hex')
      .slice(0, 8);
  }
}

module.exports = NextServiceWorkerPlugin;