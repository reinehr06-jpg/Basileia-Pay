#!/bin/bash

# Force DB_HOST to postgres if localhost
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    export DB_HOST="postgres"
fi

echo "=== Starting Basileia Checkout ==="
echo "DB_HOST=$DB_HOST"

# Respect the APP_KEY from environment, or use a valid 32-byte fallback (AES-256)
if [ -z "$APP_KEY" ]; then
    export APP_KEY="base64:YmFzaWxlaWEtY2hlY2tvdXQtc2VjcmV0LWtleS0yMDI="
fi

# Write .env file
cat > .env << EOF
APP_NAME=Basileia
APP_ENV=production
APP_KEY=$APP_KEY
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_HOST=$DB_HOST
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE:-checkout}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-secret}
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
DEFAULT_GATEWAY=asaas
ASAAS_API_KEY=${ASAAS_API_KEY}
ASAAS_ENVIRONMENT=${ASAAS_ENVIRONMENT:-production}
ASAAS_WEBHOOK_TOKEN=${ASAAS_WEBHOOK_TOKEN}
EOF

echo "APP_KEY set"

# Clear config cache and set total permissions
find storage -type d -exec chmod 777 {} +
find storage -type f -exec chmod 666 {} +
echo "Permissions set"
rm -rf bootstrap/cache/*.php 2>/dev/null || true

# Wait for DB and run migrations
echo "Running migrations..."
for i in $(seq 1 30); do
    if php artisan migrate --force --no-interaction 2>&1; then
        echo "Migrations OK!"
        break
    fi
    echo "DB not ready, waiting... ($i/30)"
    sleep 2
done

# Create admin user via direct SQL to avoid tinker issues
echo "Creating admin user..."
php artisan db:table users 2>&1 | head -1
ADMIN_PASS=$(php -r "echo password_hash('BasileiaCheck@2026!99[]09', PASSWORD_BCRYPT);")
php artisan tinker --execute="
    DB::table('users')->updateOrInsert(
        ['email' => 'admin@checkout.com'],
        [
            'name' => 'Admin',
            'password' => '$ADMIN_PASS',
            'role' => 'super_admin',
            'status' => 'active',
            'email_verified_at' => now(),
            'failed_login_attempts' => 0,
            'locked_until' => null,
            'must_change_password' => false,
            'password_changed_at' => now(),
            'updated_at' => now(),
        ]
    );
    echo 'Admin user created/updated' . PHP_EOL;
" 2>&1 || echo "WARNING: Could not create admin user"

# Start server
echo ""
echo "=== SINAL DE VIDA ATIVADO - Servidor na porta 8000 ==="
echo ""
exec php -S 0.0.0.0:8000 -t public
