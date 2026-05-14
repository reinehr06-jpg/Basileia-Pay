#!/bin/bash
composer install --no-interaction
php artisan key:generate
php artisan serve --host=0.0.0.0 --port=8000
