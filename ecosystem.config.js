// PM2 Ecosystem Configuration for Dhikr App
// Optimized for Hetzner VPS deployment with daily reminder functionality

module.exports = {
  apps: [
    {
      // Main Next.js Application
      name: 'dhikr-app',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1, // Can be increased based on server specs
      exec_mode: 'fork', // Use 'cluster' for multiple instances
      autorestart: true,
      watch: false, // Set to true only in development
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Production environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Advanced process management
      min_uptime: '10s', // Minimum uptime before considering app as online
      max_restarts: 10, // Max restarts within restart_delay
      restart_delay: 4000, // Delay between restarts
      
      // Health monitoring
      kill_timeout: 5000, // Time to wait before force killing
      listen_timeout: 3000, // Time to wait for listen event
      
      // Graceful shutdown
      shutdown_with_message: true,
    },
    
    {
      // Daily Reminder Cron Service
      name: 'dhikr-reminder-cron',
      script: './services/reminder-cron.js',
      interpreter: 'node',
      cwd: './',
      instances: 1, // Only one instance needed for cron
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '100M', // Cron service should use minimal memory
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
      },
      
      env_production: {
        NODE_ENV: 'production',
      },
      
      // Cron-specific logging
      log_file: './logs/reminder-cron-combined.log',
      out_file: './logs/reminder-cron-out.log',
      error_file: './logs/reminder-cron-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Cron service should be more resilient
      min_uptime: '30s',
      max_restarts: 5,
      restart_delay: 10000, // 10 seconds between restarts
      
      // Kill timeout for graceful shutdown
      kill_timeout: 10000,
    }
  ],

  // Deployment configuration for VPS
  deploy: {
    production: {
      user: 'deploy', // VPS username
      host: ['your-server-ip'], // Replace with actual server IP
      ref: 'origin/main', // Git branch to deploy
      repo: 'https://github.com/yourusername/dhikr-app.git', // Replace with actual repo
      path: '/var/www/dhikr', // Deployment path on server
      
      // Pre-deployment commands (run on server before deployment)
      'pre-deploy': 'git fetch --all',
      
      // Post-deployment commands (run on server after deployment)
      'post-deploy': 
        'npm install && ' +
        'npm run build && ' +
        'npx prisma generate && ' +
        'npx prisma migrate deploy && ' +
        'mkdir -p logs && ' +
        'pm2 reload ecosystem.config.js --env production',
        
      // Pre-setup commands (run once on new server)
      'pre-setup': 
        'mkdir -p /var/www && ' +
        'sudo chown -R deploy:deploy /var/www',
        
      // Post-setup commands (run once on new server)  
      'post-setup': 
        'npm install && ' +
        'npm run build && ' +
        'npx prisma generate && ' +
        'mkdir -p logs && ' +
        'pm2 startup',
        
      env: {
        NODE_ENV: 'production',
      }
    }
  }
};