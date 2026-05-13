#!/bin/bash
# Script para dump completo do sistema 100% sem omissões
OUTPUT="codigo_completo_sistema.txt"

echo "GERANDO DUMP 100% COMPLETO DO PROJETO..."
echo "--- INICIO DO SISTEMA ---" > "$OUTPUT"
echo "DATA: $(date)" >> "$OUTPUT"
echo "DIRETORIO: $(pwd)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Lista de extensões e arquivos permitidos (quase tudo que é texto)
EXTENSIONS="php blade.php js ts jsx tsx css scss sass json md txt yml yaml sh html xml sql dockerignore Dockerfile Procfile artisan"

# Encontrar todos os arquivos ignorando pastas de dependências e caches pesados
find . -type f \
    -not -path "*/vendor/*" \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/storage/framework/views/*" \
    -not -path "*/storage/logs/*" \
    -not -path "*/bootstrap/cache/*" \
    -not -path "*/public/storage/*" \
    -not -name ".DS_Store" \
    -not -name "composer.lock" \
    -not -name "package-lock.json" \
    -not -name "*.png" -not -name "*.jpg" -not -name "*.jpeg" -not -name "*.gif" -not -name "*.ico" \
    -not -name "*.pdf" -not -name "*.zip" -not -name "*.sqlite" -not -name "*.sqlite-journal" \
    -not -name "*.ttf" -not -name "*.woff" -not -name "*.woff2" \
    -not -name "$OUTPUT" \
    | sort | while read -r file; do
    
    echo "--------------------------------------------------------------------------------" >> "$OUTPUT"
    echo "ARQUIVO: $file" >> "$OUTPUT"
    echo "--------------------------------------------------------------------------------" >> "$OUTPUT"
    
    # Adicionar o conteúdo bruto sem NENHUMA redação conforme pedido "100%"
    cat "$file" >> "$OUTPUT"
    
    echo -e "\n\n" >> "$OUTPUT"
done

echo "--- FIM DO SISTEMA ---" >> "$OUTPUT"
echo "Dump finalizado em $OUTPUT"
