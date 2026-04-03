#!/bin/bash
set -e

echo "=== Basileia Checkout Starting ==="
echo "DB_HOST=$DB_HOST"
echo "DB_DATABASE=$DB_DATABASE"
echo "APP_ENV=$APP_ENV"

echo "Clearing all caches..."
rm -rf bootstrap/cache/*.php 2>/dev/null || true

echo "Running migrations..."
php artisan migrate --force --no-interaction 2>&1 || {
    echo "WARNING: Migration failed, continuing anyway..."
}

echo "Starting Laravel on port 8000..."
exec "$@"
