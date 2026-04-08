module.exports = {
  apps: [
    {
      name: 'ecove',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: '/var/www/ecove',

      // Cluster mode — one process per CPU core for maximum throughput
      instances: 'max',
      exec_mode: 'cluster',

      // Memory management
      max_memory_restart: '512M',

      // Environment
      env_production: {
        NODE_ENV:  'production',
        PORT:      3000,
        HOSTNAME:  '0.0.0.0',
        // Enable background jobs in production
        ENABLE_JOBS: 'true',
      },

      // Log configuration
      error_file:      '/var/log/ecove/error.log',
      out_file:        '/var/log/ecove/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:      true,

      // Crash recovery — restart with backoff
      autorestart:   true,
      restart_delay: 1000,
      max_restarts:  10,
      min_uptime:    '10s',

      // Watch mode (disabled in production)
      watch: false,

      // Graceful shutdown — wait for in-flight requests
      kill_timeout:      5000,
      wait_ready:        true,
      listen_timeout:    10000,

      // Source map support for better error stack traces
      source_map_support: true,
    },
  ],
}
