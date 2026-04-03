#!/bin/bash

echo "=== Basileia Checkout Starting ==="

# Use 'postgres' as default (docker-compose service name)
REAL_DB_HOST=${DB_HOST:-postgres}
if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    REAL_DB_HOST="postgres"
fi

echo "DB_HOST=$REAL_DB_HOST"
echo "DB_PORT=${DB_PORT:-5432}"
echo "DB_DATABASE=${DB_DATABASE:-checkout}"

# Generate .env
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

echo "Generating APP_KEY..."
php artisan key:generate --force 2>&1

echo "Creating storage directories..."
mkdir -p storage/framework/sessions
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/views
mkdir -p storage/logs
chmod -R 755 storage bootstrap/cache

echo "Waiting for database connection..."
for i in $(seq 1 60); do
    if php artisan migrate --force --no-interaction 2>&1; then
        echo "Migrations completed!"
        break
    fi
    echo "Database not ready, retrying in 2s... ($i/60)"
    sleep 2
done

echo "Creating default admin user..."
php artisan tinker --execute="
    \$user = \App\Models\User::firstOrCreate(
        ['email' => 'admin@checkout.com'],
        [
            'name' => 'Admin',
            'password' => bcrypt('Admin@123'),
            'role' => 'super_admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]
    );
    echo 'Admin: ' . \$user->email . PHP_EOL;
" 2>&1 || echo "WARNING: Could not create admin user"

echo "Starting Laravel on port 8000..."
exec "$@"
