#!/bin/bash

echo "=== Basileia Checkout Starting ==="

REAL_DB_HOST=${DB_HOST:-postgres}
if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    REAL_DB_HOST="postgres"
fi

echo "DB_HOST=$REAL_DB_HOST"

cat > .env << ENVEOF
APP_NAME=Basileia
APP_ENV=production
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_HOST=$REAL_DB_HOST
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE:-checkout}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-secret}
SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
DEFAULT_GATEWAY=asaas
ENVEOF

php artisan key:generate --force 2>&1

mkdir -p storage/framework/sessions storage/framework/cache/data storage/framework/views storage/logs
chmod -R 755 storage bootstrap/cache

echo "Running migrations..."
php artisan migrate --force --no-interaction 2>&1 || echo "Migration warning"

php artisan tinker --execute="
    \App\Models\User::firstOrCreate(
        ['email' => 'admin@checkout.com'],
        ['name' => 'Admin', 'password' => bcrypt('Admin@123'), 'role' => 'super_admin', 'status' => 'active', 'email_verified_at' => now()]
    );
" 2>&1 || true

echo "Starting Laravel on port 8000..."
exec "$@"
