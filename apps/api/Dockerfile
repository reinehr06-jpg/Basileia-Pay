# Basileia Pay API — Production Dockerfile
# Single stage: php:8.4-fpm-alpine + nginx + supervisor, non-root, read-only

FROM php:8.5-fpm-alpine AS base

# Install system deps + PHP extensions + nginx + supervisor
RUN apk add --no-cache \
        nginx \
        supervisor \
        postgresql-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libwebp-dev \
        libzip-dev \
        icu-dev \
        curl \
        wget \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        pgsql \
        opcache \
        gd \
        bcmath \
        zip \
        intl \
    && rm -rf /var/cache/apk/* /tmp/*

WORKDIR /var/www/html

# Copy application
COPY --chown=www-data:www-data . .

# Install composer dependencies (before php.ini hardening to avoid open_basedir restriction)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --optimize-autoloader --no-interaction --no-dev --no-scripts \
    && rm -rf /usr/bin/composer ~/.composer

# Generate package discovery cache (may warn without .env, but harmless)
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php \
    && php artisan package:discover --ansi 2>/dev/null || true

# Copy PHP hardening config (after composer to avoid blocking phar execution)
COPY docker/php.ini /usr/local/etc/php/conf.d/basileia.ini

# Create storage structure
RUN mkdir -p \
        storage/framework/sessions \
        storage/framework/cache/data \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisor config (Alpine path)
COPY docker/supervisord.conf /etc/supervisord.conf

# Remove build-only artifacts
RUN rm -rf \
        docker/start.sh \
        docker/entrypoint.sh \
        docker/nginx.conf \
        docker/supervisord.conf \
        docker/php.ini \
        tests/ \
        phpunit.xml \
        .git/ \
        .github/

# Create runtime directories
RUN mkdir -p /var/log/php-fpm /var/log/nginx /var/log/supervisor /run/nginx \
    && chown -R www-data:www-data /var/log/php-fpm /var/log/nginx /var/log/supervisor /run/nginx \
    && chmod 755 /run /run/nginx

VOLUME ["/var/www/html/storage"]

EXPOSE 8000

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
