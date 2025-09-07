#!/bin/bash

# Tasbihfy Production Deployment Script
# Usage: ./deploy.sh
# Location on server: /var/www/tasbihfy/scripts/deploy.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/tasbihfy"
APP_NAME="tasbihfy"
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log_info "🚀 Starting deployment at $(date)"

# Change to app directory
if [ ! -d "$APP_DIR" ]; then
    log_error "Application directory $APP_DIR does not exist!"
    exit 1
fi

cd "$APP_DIR"

# Create database backup before deployment
log_info "💾 Creating database backup..."
if pg_dump -h localhost -U tasbihfy dhikr_db > "$BACKUP_DIR/pre_deploy_backup_$TIMESTAMP.sql" 2>/dev/null; then
    log_success "Database backup created: pre_deploy_backup_$TIMESTAMP.sql"
else
    log_warning "Database backup failed, continuing deployment..."
fi

# Stop PM2 process temporarily (optional, for zero-downtime we skip this)
# log_info "⏸️ Stopping application..."
# pm2 stop "$APP_NAME" || true

# Pull latest code
log_info "📥 Pulling latest code from GitHub..."
if ! git pull origin main; then
    log_error "Failed to pull latest code!"
    exit 1
fi

# Show what changed
log_info "📋 Recent changes:"
git log --oneline -5

# Install/update dependencies
log_info "📦 Installing dependencies..."
if ! npm install --production=false; then
    log_error "Failed to install dependencies!"
    exit 1
fi

# Run database migrations
log_info "🗄️ Running database migrations..."
if ! npx prisma migrate deploy; then
    log_error "Database migration failed!"
    log_info "🔄 Attempting to restore from backup..."
    if [ -f "$BACKUP_DIR/pre_deploy_backup_$TIMESTAMP.sql" ]; then
        psql -h localhost -U tasbihfy dhikr_db < "$BACKUP_DIR/pre_deploy_backup_$TIMESTAMP.sql"
        log_warning "Database restored from backup"
    fi
    exit 1
fi

# Build application
log_info "🏗️ Building application..."
if ! npm run build; then
    log_error "Build failed!"
    exit 1
fi

# Restart PM2 process
log_info "🔄 Restarting application..."
if ! pm2 restart "$APP_NAME" --update-env; then
    log_error "Failed to restart application!"
    exit 1
fi

# Restart/start reminder cron service
log_info "📅 Managing reminder cron service..."
if ! pm2 restart tasbihfy-push-cron --update-env; then
    log_info "Starting reminder cron service for the first time..."
    if ! pm2 start services/reminder-cron.js --name tasbihfy-push-cron; then
        log_error "Failed to start reminder cron service!"
        exit 1
    fi
fi

# Wait for app to start
log_info "⏳ Waiting for application to start..."
sleep 5

# Health check
log_info "🩺 Performing health check..."
if pm2 status "$APP_NAME" | grep -q "online" && pm2 status tasbihfy-push-cron | grep -q "online"; then
    log_success "✅ Application and cron service are running!"
else
    log_error "❌ Services failed to start!"
    log_info "📋 PM2 status:"
    pm2 status
    log_info "📋 Recent logs:"
    pm2 logs "$APP_NAME" --lines 10
    pm2 logs tasbihfy-push-cron --lines 10
    exit 1
fi

# Test HTTP response
log_info "🌐 Testing HTTP response..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    log_success "✅ HTTP health check passed!"
else
    log_warning "⚠️ HTTP health check failed, but PM2 shows app is running"
fi

# Clean up old backups (keep last 7 days)
log_info "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "pre_deploy_backup_*.sql" -mtime +7 -delete 2>/dev/null || true

# Display deployment summary
log_success "🎉 Deployment completed successfully!"
log_info "📊 Deployment Summary:"
log_info "   Time: $(date)"
log_info "   Server: $(hostname)"
log_info "   Main App Status: $(pm2 status "$APP_NAME" --no-colors | grep "$APP_NAME" | awk '{print $10}')"
log_info "   Cron Service Status: $(pm2 status tasbihfy-push-cron --no-colors | grep tasbihfy-push-cron | awk '{print $10}')"
log_info "   URL: https://tasbihfy.com"

log_success "🚀 Deployment completed at $(date)"