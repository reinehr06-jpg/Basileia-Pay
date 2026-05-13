#!/bin/bash
echo "Generating Comprehensive Project Dump..."

# Define directories and files to include
PATHS="app config database/migrations resources/views routes public/js public/css"
ROOT_FILES=".env.example composer.json"

# Find all relevant files
FILES=$(find $PATHS -type f \( -name "*.php" -o -name "*.blade.php" -o -name "*.js" -o -name "*.css" \) 2>/dev/null)

# Add root files if they exist
for f in $ROOT_FILES; do
    if [ -f "$f" ]; then
        FILES="$FILES $f"
    fi
done

# Output target
OUTPUT="scratch/project_source_code_final.txt"
rm -f "$OUTPUT"

for f in $FILES; do
    # Skip minified files or vendor-like assets if any
    if [[ "$f" == *".min."* ]]; then continue; fi
    
    echo "================================================================================" >> "$OUTPUT"
    echo "FILE: $f" >> "$OUTPUT"
    echo "================================================================================" >> "$OUTPUT"
    
    # Mask common secret patterns
    sed -E 's/(APP_KEY|DB_PASSWORD|ASAAS_API_KEY|STRIPE_SECRET|STRIPE_KEY|MAIL_PASSWORD|AWS_SECRET_ACCESS_KEY|JWT_SECRET|PUSHER_APP_SECRET|WEBHOOK_TOKEN)[[:space:]]*=[[:space:]]*.*/\1=[REDACTED]/g' "$f" | \
    sed -E "s/'(key|secret|password|token|api_key)'[[:space:]]*=>[[:space:]]*'.*'/'\1' => '[REDACTED]'/g" | \
    sed -E 's/"(key|secret|password|token|api_key)"[[:space:]]*:[[:space:]]*".*"/"\1": "[REDACTED]"/g' >> "$OUTPUT"
    
    echo -e "\n\n" >> "$OUTPUT"
done

echo "Dump complete: $OUTPUT"
