# Local Testing Guide - Daily Reminder Functionality

## Overview
Complete step-by-step guide for testing the daily reminder functionality locally during development.

## Prerequisites
- [ ] Environment variables configured (VAPID keys, CRON_SECRET, etc.)
- [ ] Database migrated with ReminderPreferences table
- [ ] Dependencies installed (`npm install`)

---

## 🚀 Quick Start Testing (Easiest Method)

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Test via UI (Recommended)
1. **Open** http://localhost:3000
2. **Sign in** to your account (notifications require authentication)
3. **Go to Settings** > **Notifications**
4. **Enable "Daily Reminder"** toggle
   - Browser will request notification permission
   - Accept the permission
5. **Click "Send Test Notification"**
   - Should immediately send a notification with random ayah
   - Check your browser/desktop for the notification

✅ **If you receive the test notification, everything is working!**

---

## 🔧 API Endpoint Testing

### Test Each Endpoint Manually

```bash
# 1. Test VAPID Key Endpoint
curl http://localhost:3000/api/notifications/vapid
# Expected: {"success":true,"publicKey":"your-vapid-key"}

# 2. Test Random Ayah (via cron endpoint with force)
curl -X POST "http://localhost:3000/api/cron/send-reminders?force=true" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
# Expected: JSON response with reminder stats and ayah info

# 3. Test User Preferences (requires authentication)
curl http://localhost:3000/api/notifications/preferences \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
# Expected: User's current reminder preferences

# 4. Test Notification (requires authentication & subscription)
curl http://localhost:3000/api/notifications/test \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
# Expected: Test notification sent to user's device
```

**How to get your session token:**
1. Sign in to your app
2. Open DevTools > Application > Cookies
3. Find `better-auth.session_token` value
4. Use in curl commands above

---

## ⏱️ Cron Service Testing

### Method 1: Run Cron Service Directly
```bash
# In a separate terminal
node services/reminder-cron.js
```

**Expected Output:**
```
📢 Daily Reminder Cron Service
==============================
🚀 Starting daily reminder cron service...
✅ Daily reminder cron started with pattern: */5 * * * *
🔄 Checking for reminders every 5 minutes
⏰ Cron job triggered at 2024-01-09T10:00:00.000Z
🔍 Checking for users who need daily reminders...
ℹ️ No users eligible for reminders at this time
```

### Method 2: Force Test All Users
```bash
# Trigger reminders for ALL users (bypasses time checks)
curl -X POST "http://localhost:3000/api/cron/send-reminders?force=true" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reminders sent successfully",
  "stats": {
    "eligible": 1,
    "sent": 1,
    "failed": 0,
    "expired": 0
  },
  "ayah": {
    "verseKey": "2:255",
    "translation": "Allah - there is no deity except Him, the Ever-Living..."
  }
}
```

---

## 🌐 Browser DevTools Testing

### Test Service Worker Registration
```javascript
// Open DevTools Console (F12) and run:

// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length);
  regs.forEach(reg => console.log('SW:', reg.scope));
});

// Check notification permission
console.log('Notification Permission:', Notification.permission);

// Request notification permission manually
Notification.requestPermission().then(permission => {
  console.log('Permission granted:', permission === 'granted');
});
```

### Test Push Subscription
```javascript
// Check if user has push subscription
navigator.serviceWorker.ready.then(registration => {
  return registration.pushManager.getSubscription();
}).then(subscription => {
  console.log('Push Subscription:', !!subscription);
  if(subscription) {
    console.log('Endpoint:', subscription.endpoint.substring(0, 50) + '...');
  }
});
```

### Send Test Notification Directly
```javascript
// Send browser notification directly (bypasses push service)
if (Notification.permission === 'granted') {
  new Notification('Test Daily Ayah: 2:255', {
    body: 'Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'test-notification'
  });
}
```

---

## 🗄️ Database Testing

### Use Prisma Studio
```bash
npx prisma studio
```

**What to Check:**
1. **User table** - Ensure you have a test user
2. **ReminderPreferences table** - Should exist after migration
3. **User's reminder settings** - Check reminderEnabled, reminderTime, timezone

### Manual Database Queries
```bash
# Connect to your database
npx prisma db push

# Or use raw SQL (if using PostgreSQL locally)
psql YOUR_DATABASE_URL -c "SELECT * FROM \"ReminderPreferences\";"
```

### Test Data Creation
Create a test user with reminder preferences:

1. **Sign up/Sign in** to your local app
2. **Enable notifications** in Settings
3. **Check Prisma Studio** - should see:
   - User entry in User table
   - ReminderPreferences entry with your userId
   - pushSubscription JSON data

---

## 🔍 Advanced Testing Scenarios

### Test Different Timezones
```javascript
// Test timezone detection in browser console
console.log('User Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

// Test time formatting for different timezones
const testTime = new Date();
console.log('UTC:', testTime.toISOString());
console.log('User TZ:', testTime.toLocaleTimeString('en-US', {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}));
```

### Test With Different Reminder Times
1. **Set reminder time** to current time + 1 minute
2. **Run cron service** (`node services/reminder-cron.js`)
3. **Wait for the time** to match
4. **Check logs** for reminder execution

### Test Random Ayah Fetching
Create a test script `test-ayah.js`:
```javascript
// test-ayah.js
require('dotenv').config();

// Import the function (adjust path as needed)
async function testRandomAyah() {
  try {
    // You'll need to implement getRandomAyah for testing
    console.log('Testing random ayah fetch...');
    
    const response = await fetch('http://localhost:3000/api/cron/send-reminders?force=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });
    
    const result = await response.json();
    console.log('Ayah Result:', result.ayah);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testRandomAyah();
```

Run: `node test-ayah.js`

---

## 🚨 Troubleshooting Common Issues

### Issue 1: "Send Test Notification" Button Does Nothing
**Possible Causes:**
- [ ] Not signed in
- [ ] Notification permission denied
- [ ] Service worker not registered
- [ ] VAPID keys missing/invalid

**Solutions:**
```bash
# Check environment variables
cat .env | grep VAPID

# Restart dev server
npm run dev

# Hard refresh browser (Ctrl+Shift+R)
# Check DevTools > Console for errors
```

### Issue 2: Cron Service Fails to Start
**Check:**
```bash
# Verify file exists
ls -la services/reminder-cron.js

# Check for syntax errors
node --check services/reminder-cron.js

# Run with verbose logging
DEBUG=* node services/reminder-cron.js
```

### Issue 3: Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Check if ReminderPreferences table exists
npx prisma studio
```

### Issue 4: API Endpoints Return 401/403
**Solutions:**
- Ensure you're signed in for authenticated endpoints
- Check CRON_SECRET matches between .env and curl command
- Verify session cookies are being sent

### Issue 5: No Notifications Appear
**Check:**
1. **Browser Settings** - Ensure notifications enabled for localhost
2. **Focus/Do Not Disturb** - Notifications might be suppressed
3. **DevTools Console** - Look for service worker errors
4. **Network Tab** - Check if API calls are succeeding

---

## ✅ Complete Test Checklist

Before considering the feature "working":

### Environment Setup
- [ ] `.env` file has all required variables
- [ ] VAPID keys generated and added
- [ ] CRON_SECRET set to a random string
- [ ] Database migrated (`npx prisma migrate dev`)

### Basic Functionality  
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Can sign in to the application
- [ ] Settings page loads and shows notification section
- [ ] Can enable "Daily Reminder" toggle
- [ ] Browser requests notification permission
- [ ] Can set preferred reminder time

### Notification Testing
- [ ] "Send Test Notification" button works
- [ ] Notification appears in browser/desktop
- [ ] Notification has correct title and ayah text
- [ ] Clicking notification opens the app

### API Testing
- [ ] `/api/notifications/vapid` returns public key
- [ ] `/api/notifications/test` sends notification (when signed in)
- [ ] `/api/cron/send-reminders` works with correct secret
- [ ] All API responses have expected JSON format

### Database Testing
- [ ] ReminderPreferences table exists in database
- [ ] User record created when enabling notifications
- [ ] Push subscription data saved correctly
- [ ] Can view data in Prisma Studio

### Advanced Testing
- [ ] Cron service runs without errors (`node services/reminder-cron.js`)
- [ ] Force trigger sends notifications to all eligible users
- [ ] Different timezones handled correctly
- [ ] Service worker registered properly

---

## 📝 Testing Notes

**Recommended Testing Flow:**
1. **Start with UI testing** - Use the "Send Test Notification" button first
2. **Then test APIs** - Verify each endpoint works independently  
3. **Test cron service** - Run the background service
4. **Check database** - Ensure data is stored correctly
5. **Test edge cases** - Different timezones, permissions, etc.

**Performance Notes:**
- Cron service checks every 5 minutes (configurable)
- Notifications are batched to avoid rate limits
- Failed subscriptions are automatically cleaned up

**Security Notes:**
- All notification endpoints require authentication (except VAPID key)
- Cron endpoint protected by CRON_SECRET
- Push subscriptions are encrypted with VAPID keys

---

## 🎯 Next Steps After Local Testing

Once everything works locally:
1. **Deploy to staging/production**
2. **Test on actual mobile devices**
3. **Test across different browsers**
4. **Set up monitoring for the cron service**
5. **Configure proper logging for production**

---

*Happy Testing! 🧪📱*