#!/bin/sh
set -e

echo "=== Basileia Pay API Starting ==="

# 1. Configurar variáveis de banco
REAL_DB_HOST=${DB_HOST:-postgres}
if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
    REAL_DB_HOST="postgres"
fi

# 2. Gerar .env de produção (se não existir ou for dinâmico)
# NOTA: Em produção real, as variáveis devem ser passadas via Container Environment.
# Este script apenas garante que valores básicos existam para o container subir.
if [ ! -f .env ]; then
    touch .env
fi

# 3. Garantir APP_KEY
if ! grep -q "APP_KEY=" .env || [ -z "$(grep APP_KEY= .env | cut -d'=' -f2)" ]; then
    echo "Generating new APP_KEY..."
    php artisan key:generate --force
fi

# 4. Ajustar permissões
mkdir -p storage/framework/sessions storage/framework/cache/data storage/framework/views storage/logs
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 5. Executar Migrações
echo "Running migrations..."
php artisan migrate --force --no-interaction

# 6. Criar Admin Inicial (Somente se as variáveis estiverem presentes)
if [ ! -z "$ADMIN_EMAIL" ] && [ ! -z "$ADMIN_PASSWORD" ]; then
    echo "Ensuring initial admin user..."
    php artisan tinker --execute="
        \App\Models\User::firstOrCreate(
            ['email' => '$ADMIN_EMAIL'],
            ['name' => 'Basileia Admin', 'password' => bcrypt('$ADMIN_PASSWORD'), 'role' => 'super_admin', 'status' => 'active', 'email_verified_at' => now()]
        );
    "
fi

echo "Basileia Pay is ready. Starting PHP-FPM/Octane..."
exec "$@"
