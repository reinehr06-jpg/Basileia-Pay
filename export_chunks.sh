#!/bin/bash

# Chunk 1: Core Payment & Gateway
OUTPUT1="chunk_1_payments.md"
echo "# Chunk 1: Core Payment & Gateway" > "$OUTPUT1"
find app/Services app/Helpers -type f -name "*.php" | while read -r file; do
    echo "### Arquivo: $file" >> "$OUTPUT1"
    echo '```php' >> "$OUTPUT1"
    cat "$file" >> "$OUTPUT1"
    echo '```' >> "$OUTPUT1"
done

# Chunk 2: Controllers & Routes
OUTPUT2="chunk_2_controllers_routes.md"
echo "# Chunk 2: Controllers & Routes" > "$OUTPUT2"
find app/Http/Controllers routes -type f -name "*.php" | while read -r file; do
    echo "### Arquivo: $file" >> "$OUTPUT2"
    echo '```php' >> "$OUTPUT2"
    cat "$file" >> "$OUTPUT2"
    echo '```' >> "$OUTPUT2"
done

# Chunk 3: Models & Config & Bootstrap
OUTPUT3="chunk_3_models_config.md"
echo "# Chunk 3: Models & Config" > "$OUTPUT3"
find app/Models config bootstrap -type f -name "*.php" | while read -r file; do
    echo "### Arquivo: $file" >> "$OUTPUT3"
    echo '```php' >> "$OUTPUT3"
    cat "$file" >> "$OUTPUT3"
    echo '```' >> "$OUTPUT3"
done

cp chunk_1_payments.md /Users/viniciusreinehr/.gemini/antigravity/brain/d4c5be4a-ba99-41cd-85c5-b223b07f2d53/
cp chunk_2_controllers_routes.md /Users/viniciusreinehr/.gemini/antigravity/brain/d4c5be4a-ba99-41cd-85c5-b223b07f2d53/
cp chunk_3_models_config.md /Users/viniciusreinehr/.gemini/antigravity/brain/d4c5be4a-ba99-41cd-85c5-b223b07f2d53/
