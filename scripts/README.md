# Scripts Directory

## deploy.sh
Enhanced deployment script with:
- Database backups before deployment
- Health checks after deployment  
- Colored output and logging
- Error handling and rollback capability

### Usage
```bash
# On server
cd /var/www/tasbihfy
./scripts/deploy.sh
```

### Features
- 💾 Automatic database backups
- 🩺 Health checks
- 🔄 PM2 process management
- 📋 Deployment logging
- 🧹 Backup cleanup (7-day retention)

This script is used by both manual deployments and the GitHub Actions workflow.