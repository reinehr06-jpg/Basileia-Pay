#!/bin/sh
set -e
set -x

php artisan migrate --force
php artisan config:cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
# NÃO rodar route:cache — há rotas com Closure (routes/api.php:12, routes/web.php)
exec "$@"
