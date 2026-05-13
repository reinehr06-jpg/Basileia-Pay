#!/bin/bash
FILES=$(find app resources/views routes -name "*.php" -o -name "*.blade.php" | grep -v "vendor/" | grep -v "storage/")
for f in $FILES; do
    echo "================================================================================"
    echo "FILE: $f"
    echo "================================================================================"
    # Mask common secret patterns
    sed -E 's/(APP_KEY|DB_PASSWORD|ASAAS_API_KEY|STRIPE_SECRET|MAIL_PASSWORD|AWS_SECRET_ACCESS_KEY|JWT_SECRET|PUSHER_APP_SECRET)[[:space:]]*=[[:space:]]*.*/\1=[REDACTED]/g' "$f" | \
    sed -E "s/'(key|secret|password|token)'[[:space:]]*=>[[:space:]]*'.*'/'\1' => '[REDACTED]'/g"
    echo -e "\n"
done
