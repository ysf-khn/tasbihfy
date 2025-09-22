# Critical Server Configuration Fix for PWA Updates

## Problem
The production server is serving the static `/public/sw.js` file directly, bypassing Next.js's dynamic service worker generation. This causes the PWA to never update.

## Immediate Actions Required

### 1. SSH into your production server
```bash
ssh root@your-server
cd /var/www/tasbihfy
```

### 2. Verify the static sw.js is deleted
```bash
# Check if sw.js exists in public directory
ls -la public/sw.js

# If it exists, delete it immediately
rm -f public/sw.js
```

### 3. Update Nginx Configuration
Add this to your nginx site configuration to ensure `/sw.js` is ALWAYS proxied to Next.js:

```nginx
# In /etc/nginx/sites-available/tasbihfy
server {
    # ... existing configuration ...

    # CRITICAL: Force /sw.js to be handled by Next.js, not served statically
    # Use regex to match with or without query parameters
    location ~ ^/sw\.js {
        proxy_pass http://localhost:3000$request_uri;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Disable all caching for service worker
        add_header Cache-Control "no-cache, no-store, max-age=0, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header Service-Worker-Allowed "/";
        proxy_cache off;
    }

    # Also handle the API route directly
    location = /api/service-worker {
        proxy_pass http://localhost:3000/api/service-worker;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Disable all caching
        add_header Cache-Control "no-cache, no-store, max-age=0, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        proxy_cache off;
    }

    # Existing location block for Next.js
    location / {
        proxy_pass http://localhost:3000;
        # ... rest of your config ...
    }
}
```

### 4. Reload Nginx
```bash
# Test the configuration first
nginx -t

# If successful, reload nginx
systemctl reload nginx
```

### 5. Clear Cloudflare Cache (if using Cloudflare)
1. Log into Cloudflare Dashboard
2. Go to Caching → Configuration
3. Click "Purge Everything"
4. Also create a Page Rule to BYPASS cache for `/sw.js`:
   - URL: `tasbihfy.com/sw.js`
   - Setting: Cache Level → Bypass

### 6. Deploy the Updated Code
```bash
cd /var/www/tasbihfy

# Pull the latest changes
git pull origin main

# Install dependencies
npm install --production=false

# Build the application (without sw.js generation)
npm run build

# Restart PM2
pm2 restart tasbihfy --update-env
```

### 7. Test the Fix
1. Open Chrome DevTools → Application → Service Workers
2. Check "Update on reload"
3. Hard refresh (Ctrl+Shift+R)
4. You should see a new service worker with a fresh timestamp

## Monitoring After Deployment

### Check Service Worker Version
```bash
# From your local machine
curl -I https://tasbihfy.com/sw.js

# Should show no-cache headers:
# Cache-Control: no-cache, no-store, max-age=0, must-revalidate
```

### Monitor PM2 Logs
```bash
pm2 logs tasbihfy --lines 50
```

### Force Clear User Caches
The unregister script will automatically:
1. Detect old service workers (version starting with "018849a")
2. Unregister them
3. Clear old caches
4. Reload the page

## After Users Update (in 1-2 weeks)

Remove the temporary unregister script:
1. Delete `/public/unregister-old-sw.js`
2. Remove the script tag from `app/layout.tsx`
3. Deploy again

## Emergency Rollback

If something goes wrong:
```bash
# Restore the old sw.js temporarily
cd /var/www/tasbihfy
git checkout HEAD~1 -- public/sw.js

# Restart PM2
pm2 restart tasbihfy
```

## Success Indicators

✅ Service worker version changes on every page load
✅ No more "018849a" version in DevTools
✅ Users see update notifications
✅ PWA content updates immediately after deployment

## Prevention

Never commit `public/sw.js` to git again. Add to `.gitignore`:
```
public/sw.js
public/sw-version.json
```