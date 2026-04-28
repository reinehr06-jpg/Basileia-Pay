FROM php:8.4-cli

# Install system dependencies and PHP extensions more efficiently
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    && install-php-extensions pdo pdo_pgsql pgsql opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Pin composer version for stability
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy only composer files first to leverage Docker cache
COPY composer.json composer.lock ./
RUN composer install --optimize-autoloader --no-interaction --no-scripts

# Copy the rest of the application
COPY . .

# Set permissions
RUN mkdir -p storage/framework/sessions storage/framework/cache/data storage/framework/views storage/logs \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www/html

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
