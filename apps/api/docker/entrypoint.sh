#!/bin/sh
set -e
set -x

php artisan migrate --force
php artisan config:cache
# NÃO rodar route:cache — há rotas com Closure (routes/api.php:12, routes/web.php)
exec "$@"
