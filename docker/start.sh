#!/bin/bash

# Force DB_HOST to postgres if localhost
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    export DB_HOST="postgres"
fi

echo "=== Starting Basileia Checkout ==="
echo "DB_HOST=$DB_HOST"
echo "DB_DATABASE=${DB_DATABASE:-checkout}"

# Write .env file
cat > .env << EOF
APP_NAME=Basileia
APP_ENV=production
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

# Generate key
php artisan key:generate --force 2>&1

# Create dirs
mkdir -p storage/framework/sessions storage/framework/cache/data storage/framework/views storage/logs
chmod -R 755 storage bootstrap/cache

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

# Create admin user
echo "Creating admin user..."
php artisan tinker --execute='App\Models\User::firstOrCreate(["email"=>"admin@checkout.com"],["name"=>"Admin","password"=>bcrypt("Admin@123"),"role"=>"super_admin","status"=>"active","email_verified_at"=>now()]);' 2>&1 || true

# Start server
echo "Starting server on port 8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
