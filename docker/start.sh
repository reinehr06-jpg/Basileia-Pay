#!/bin/bash

# Force DB_HOST to postgres if localhost
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    export DB_HOST="postgres"
fi

echo "=== Starting Basileia Checkout ==="
echo "DB_HOST=$DB_HOST"

# Ensure .env exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo ".env created from .env.example"
    else
        touch .env
        echo "Empty .env created"
    fi
fi

# Function to safely update .env values
# Usage: update_env KEY VALUE
update_env() {
    local key=$1
    local value=$2
    if [ -n "$value" ]; then
        # Remove any existing line for this key
        sed -i "/^${key}=/d" .env
        # Append the new value safely quoted
        echo "${key}='${value}'" >> .env
    fi
}

# Respect the APP_KEY from environment, or use a valid fallback if missing from both env and .env
if [ -z "$APP_KEY" ] && ! grep -q "^APP_KEY=" .env; then
    export APP_KEY="base64:YmFzaWxlaWEtY2hlY2tvdXQtc2VjcmV0LWtleS0yMDI="
fi

# Update .env with environment variables (if provided)
update_env "APP_NAME" "${APP_NAME:-Basileia}"
update_env "APP_ENV" "${APP_ENV:-production}"
update_env "APP_KEY" "$APP_KEY"
update_env "APP_DEBUG" "true"
update_env "APP_URL" "${APP_URL:-http://localhost:8000}"
update_env "DB_CONNECTION" "pgsql"
update_env "DB_HOST" "$DB_HOST"
update_env "DB_PORT" "${DB_PORT:-5432}"
update_env "DB_DATABASE" "${DB_DATABASE:-checkout}"
update_env "DB_USERNAME" "${DB_USERNAME:-postgres}"
update_env "DB_PASSWORD" "${DB_PASSWORD:-secret}"
update_env "SESSION_DRIVER" "file"
update_env "CACHE_STORE" "file"
update_env "QUEUE_CONNECTION" "sync"

# Gateway settings - Only update if provided in environment
update_env "DEFAULT_GATEWAY" "$DEFAULT_GATEWAY"
update_env "ASAAS_API_KEY" "$ASAAS_API_KEY"
update_env "ASAAS_ENVIRONMENT" "$ASAAS_ENVIRONMENT"
update_env "ASAAS_WEBHOOK_TOKEN" "$ASAAS_WEBHOOK_TOKEN"

# Additional Gateways
update_env "STRIPE_KEY" "$STRIPE_KEY"
update_env "STRIPE_SECRET" "$STRIPE_SECRET"
update_env "MERCADOPAGO_ACCESS_TOKEN" "$MERCADOPAGO_ACCESS_TOKEN"
update_env "SQUARE_ACCESS_TOKEN" "$SQUARE_ACCESS_TOKEN"
update_env "SQUARE_LOCATION_ID" "$SQUARE_LOCATION_ID"

echo "Environment configuration updated"

# Clear config cache and set total permissions
find storage -type d -exec chmod 777 {} + 2>/dev/null || true
find storage -type f -exec chmod 666 {} + 2>/dev/null || true
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

# Create admin user safely
echo "Creating admin user..."
# Generate hash first
ADMIN_PASS_HASH=$(php -r "echo password_hash('BasileiaCheck@2026!99[]09', PASSWORD_BCRYPT);")
export ADMIN_PASS_HASH

# Use tinker to update or insert admin user, using environment variable to avoid bash expansion issues
php artisan tinker --execute="
    \$hash = getenv('ADMIN_PASS_HASH');
    \DB::table('users')->updateOrInsert(
        ['email' => 'admin@checkout.com'],
        [
            'name' => 'Admin',
            'password' => \$hash,
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
" 2>&1 || echo "WARNING: Could not create admin user"

# Start server
echo ""
echo "=== SINAL DE VIDA ATIVADO - Servidor na porta 8000 ==="
echo ""
exec php -S 0.0.0.0:8000 -t public
