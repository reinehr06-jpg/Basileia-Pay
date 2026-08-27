#!/bin/sh
set -e
until php artisan db:monitor >/dev/null 2>&1 || php artisan migrate:status >/dev/null 2>&1; do
  echo "aguardando o banco..."; sleep 2
done
php artisan migrate --force
php artisan config:cache
# NÃO rodar route:cache — há rotas com Closure (routes/api.php:12, routes/web.php)
exec "$@"
