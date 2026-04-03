#!/bin/bash

# Force DB_HOST to postgres if localhost
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    export DB_HOST="postgres"
fi

echo "=== Starting Basileia Checkout ==="
echo "DB_HOST=$DB_HOST"

# Fixed APP_KEY (deterministic)
APP_KEY="base64:YmFzaWxlaWEtY2hlY2tvdXQtc2VjcmV0LWtleS0yMDI2"

# Write .env file
cat > .env << EOF
APP_NAME=Basileia
APP_ENV=production
APP_KEY=$APP_KEY
APP_DEBUG=true
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
EOF

echo "APP_KEY set"

# Create dirs
mkdir -p storage/framework/sessions storage/framework/cache/data storage/framework/views storage/logs
chmod -R 755 storage bootstrap/cache

# Clear config cache
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
echo "Starting server on port 8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
