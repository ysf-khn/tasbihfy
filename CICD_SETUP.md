# 🚀 CI/CD Setup Guide: GitHub Actions Auto-Deployment

## Overview
This guide sets up automatic deployment to your Hetzner server whenever you push code to the `main` branch.

## Prerequisites
- ✅ Hetzner server running with app deployed
- ✅ PM2 managing your app
- ✅ SSH access to your server
- ✅ GitHub repository with your code

## Setup Steps

### Step 1: Generate SSH Key for Deployment

On your **local machine**, generate a dedicated SSH key for deployments:

```bash
# Generate a new SSH key specifically for deployments
ssh-keygen -t ed25519 -C "deployment@tasbihfy" -f ~/.ssh/tasbihfy_deploy

# This creates two files:
# ~/.ssh/tasbihfy_deploy (private key) - for GitHub Secrets
# ~/.ssh/tasbihfy_deploy.pub (public key) - for server
```

### Step 2: Add Public Key to Server

Copy the public key to your Hetzner server:

```bash
# Copy public key to clipboard
cat ~/.ssh/tasbihfy_deploy.pub

# Then SSH to your server and add it
ssh root@YOUR_SERVER_IP

# On the server:
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Step 3: Test SSH Connection

Test the new key works:

```bash
# From your local machine
ssh -i ~/.ssh/tasbihfy_deploy root@YOUR_SERVER_IP
```

### Step 4: Configure GitHub Secrets

Go to your GitHub repository: `https://github.com/ysf-khn/tasbihfy`

1. Click **Settings** (repository settings, not your account)
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these 4 secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `SSH_HOST` | `YOUR_SERVER_IP` | Your Hetzner server IP |
| `SSH_USERNAME` | `root` | SSH username (usually root) |
| `SSH_KEY` | `PRIVATE_KEY_CONTENT` | Content of `~/.ssh/tasbihfy_deploy` file |
| `SSH_PORT` | `22` | SSH port (usually 22) |

**To get private key content:**
```bash
# Copy private key content (the entire file)
cat ~/.ssh/tasbihfy_deploy
```

### Step 5: Make Deploy Script Executable (On Server)

SSH to your server and make the deploy script executable:

```bash
ssh root@YOUR_SERVER_IP
cd /var/www/tasbihfy
chmod +x scripts/deploy.sh

# Test the script manually
./scripts/deploy.sh
```

### Step 6: Test Automated Deployment

1. Make a small change to your project locally
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "test: trigger deployment"
   git push origin main
   ```
3. Go to GitHub → Actions tab to watch the deployment
4. Check your website: https://tasbihfy.com

## How It Works

### Deployment Trigger
- **Automatic**: Pushes to `main` branch
- **Manual**: GitHub Actions tab → "Deploy to Production" → "Run workflow"

### Deployment Process
1. GitHub detects push to main
2. GitHub Actions runner starts
3. SSH into your Hetzner server
4. Pull latest code
5. Install dependencies
6. Run database migrations
7. Build application
8. Restart PM2
9. Health check
10. Report success/failure

### Deployment Time
- **Average**: ~2-3 minutes
- **Range**: 1-5 minutes depending on changes

## Monitoring Deployments

### GitHub Actions
- **URL**: `https://github.com/ysf-khn/tasbihfy/actions`
- **View logs**: Click on any deployment run
- **Manual trigger**: "Run workflow" button

### Server Logs
```bash
# SSH to server
ssh root@YOUR_SERVER_IP

# Check PM2 status
pm2 status

# View app logs
pm2 logs tasbihfy --lines 50

# Check deployment backups
ls -la /root/backups/
```

## Troubleshooting

### Common Issues

**1. SSH Connection Failed**
```
Error: ssh: connect to host XX.XX.XX.XX port 22: Connection refused
```
**Solution**: Check SSH_HOST, SSH_PORT, and firewall settings

**2. Permission Denied**
```
Error: git@github.com: Permission denied (publickey)
```
**Solution**: Verify SSH_KEY secret contains the full private key

**3. Build Failed**
```
Error: npm run build failed
```
**Solution**: Check dependencies and build process locally first

**4. PM2 Restart Failed**
```
Error: pm2 restart failed
```
**Solution**: SSH to server and check PM2 status manually

### Manual Deployment
If automated deployment fails, you can always deploy manually:

```bash
# SSH to server
ssh root@YOUR_SERVER_IP

# Run deployment script
cd /var/www/tasbihfy
./scripts/deploy.sh
```

### Rollback Strategy
If deployment breaks your app:

```bash
# SSH to server
ssh root@YOUR_SERVER_IP
cd /var/www/tasbihfy

# Go back to previous commit
git log --oneline -5  # See recent commits
git reset --hard PREVIOUS_COMMIT_HASH

# Rebuild and restart
npm run build
pm2 restart tasbihfy
```

## Advanced Features

### Database Backups
The deploy script automatically:
- Creates backup before each deployment
- Keeps backups for 7 days
- Can restore from backup if migration fails

### Health Checks
After deployment, the system checks:
- PM2 process is online
- HTTP response returns 200
- App is accessible

### Notifications (Optional)
You can add Discord/Telegram notifications by modifying the GitHub Actions workflow.

## Security Best Practices

1. **Dedicated SSH Key**: Use deployment-specific SSH key
2. **Limited Permissions**: SSH key only has access needed for deployment
3. **GitHub Secrets**: Never commit SSH keys to repository
4. **Regular Rotation**: Rotate SSH keys periodically
5. **Backup Strategy**: Always backup before deployment

## Next Steps

After setup works:
1. ✅ Test a few deployments
2. ✅ Set up monitoring (UptimeRobot)
3. ✅ Consider staging environment
4. ✅ Add database backup automation
5. ✅ Set up Discord/Slack notifications

---

## The Indie Hacker Workflow

Your new workflow:
1. **Code** locally
2. **Push** to main branch
3. **✨ Magic happens** (auto-deployment)
4. **Check** https://tasbihfy.com
5. **Ship** features faster!

No more SSH, no more manual deployments, no more "it works on my machine" issues.

**Happy shipping! 🚀**