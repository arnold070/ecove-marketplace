#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Ecove — Fresh VPS Server Setup Script
# Run ONCE on a brand-new Ubuntu 22.04 server as root:
#   bash scripts/server-setup.sh
# ═══════════════════════════════════════════════════════════
set -e

DOMAIN="ecove.com.ng"
APP_DIR="/var/www/ecove"
LOG_DIR="/var/log/ecove"
DB_NAME="ecove_db"
DB_USER="ecove_user"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     Ecove — VPS Server Setup         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. System update ────────────────────────────────────────
echo "▶ [1/10] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Install Node.js 20 ───────────────────────────────────
echo "▶ [2/10] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>/dev/null
apt-get install -y nodejs -qq
echo "   Node.js $(node -v) installed"

# ── 3. Install PostgreSQL 15 ────────────────────────────────
echo "▶ [3/10] Installing PostgreSQL 15..."
apt-get install -y postgresql postgresql-contrib -qq
systemctl enable postgresql
systemctl start postgresql
echo "   PostgreSQL $(psql --version) installed"

# ── 4. Install Redis ────────────────────────────────────────
echo "▶ [4/10] Installing Redis..."
apt-get install -y redis-server -qq
systemctl enable redis-server
systemctl start redis-server
redis-cli ping > /dev/null && echo "   Redis: PONG ✅"

# ── 5. Install Nginx ────────────────────────────────────────
echo "▶ [5/10] Installing Nginx..."
apt-get install -y nginx -qq
systemctl enable nginx
systemctl start nginx
echo "   Nginx installed"

# ── 6. Install Certbot for SSL ──────────────────────────────
echo "▶ [6/10] Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx -qq
echo "   Certbot installed"

# ── 7. Install PM2 ──────────────────────────────────────────
echo "▶ [7/10] Installing PM2..."
npm install -g pm2 -q
echo "   PM2 $(pm2 -v) installed"

# ── 8. Create PostgreSQL database ───────────────────────────
echo "▶ [8/10] Creating database..."
DB_PASS=$(openssl rand -base64 24 | tr -d '=/+' | head -c 32)
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

# Write the DATABASE_URL to a temp file for reference
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME" > /root/db-credentials.txt
echo "   Database created. Credentials saved to /root/db-credentials.txt"

# ── 9. Create app directory and log directory ────────────────
echo "▶ [9/10] Creating directories..."
mkdir -p $APP_DIR $LOG_DIR
echo "   Directories created: $APP_DIR and $LOG_DIR"

# ── 10. Configure firewall ───────────────────────────────────
echo "▶ [10/10] Configuring firewall..."
ufw allow OpenSSH    2>/dev/null || true
ufw allow 'Nginx Full' 2>/dev/null || true
ufw --force enable   2>/dev/null || true
echo "   Firewall configured (SSH + HTTP + HTTPS allowed)"

# ── Setup backup directory and first backup cron ────────────────────────────
echo "▶ Configuring automated backups..."
mkdir -p /var/backups/ecove /var/log/ecove

# Schedule daily backup at 2am
CRON_LINE="0 2 * * * $APP_DIR/scripts/backup.sh >> /var/log/ecove/backup.log 2>&1"
(crontab -l 2>/dev/null | grep -qF "backup.sh") || \
  (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
echo "   Daily backup at 2:00 AM configured ✅"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              ✅ Server Setup Complete                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Database credentials saved to: /root/db-credentials.txt"
cat /root/db-credentials.txt
echo ""
echo "  Next step: Upload your app files and run:"
echo "  bash $APP_DIR/scripts/deploy.sh"
echo ""
