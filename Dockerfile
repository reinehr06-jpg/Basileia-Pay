FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql pgsql opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --optimize-autoloader --no-interaction --no-scripts

COPY . .

    && mkdir -p storage/framework/sessions storage/framework/cache/data storage/framework/views storage/logs \
    && chmod -R 755 storage bootstrap/cache

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
