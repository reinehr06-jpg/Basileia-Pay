#!/bin/bash

OUTPUT_FILE="codigo_final_corrigido.md"
echo "# Código Fonte Corrigido - Basileia Checkout" > "$OUTPUT_FILE"
echo "Gerado em: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Lista de diretórios para incluir
DIRS=("app" "bootstrap" "config" "database/migrations" "resources/views" "routes")

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "## Diretório: $dir" >> "$OUTPUT_FILE"
        find "$dir" -type f \( -name "*.php" -o -name "*.blade.php" -o -name "*.js" -o -name "*.css" -o -name "*.json" \) ! -path "*/node_modules/*" ! -path "*/vendor/*" | while read -r file; do
            echo "### Arquivo: $file" >> "$OUTPUT_FILE"
            echo '```'${file##*.} >> "$OUTPUT_FILE"
            cat "$file" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
            echo '```' >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
        done
    fi
done

echo "Código exportado para $OUTPUT_FILE"
