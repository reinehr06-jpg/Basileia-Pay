#!/bin/bash
OUTPUT="codigo_lab_editor_completo.md"

echo "# 💻 Código Completo — Lab Editor de Checkout (Fases 1 e 2)" > $OUTPUT
echo "Este arquivo contém todo o código 100% revisado do backend Laravel e do frontend Next.js (App Router) do editor visual de checkout." >> $OUTPUT

add_file() {
    if [ -f "$1" ]; then
        echo -e "\n***\n\n## 📁 \`$1\`\n" >> $OUTPUT
        echo "\`\`\`$2" >> $OUTPUT
        cat "$1" >> $OUTPUT
        echo -e "\n\`\`\`" >> $OUTPUT
    else
        echo -e "\n***\n\n## ⚠️ Arquivo não encontrado: \`$1\`" >> $OUTPUT
    fi
}

echo -e "\n# 1. Backend Laravel" >> $OUTPUT
add_file "routes/api.php" "php"
add_file "app/Models/CheckoutConfig.php" "php"
add_file "app/Models/CheckoutVersion.php" "php"
add_file "app/Models/CheckoutAbTest.php" "php"
add_file "database/migrations/2026_05_13_000001_create_checkout_versions_table.php" "php"
add_file "database/migrations/2026_05_13_000002_create_checkout_ab_tests_table.php" "php"
add_file "app/Http/Controllers/Dashboard/CheckoutConfigController.php" "php"
add_file "app/Http/Controllers/Dashboard/CheckoutVersionController.php" "php"
add_file "app/Http/Controllers/Dashboard/CheckoutAbTestController.php" "php"

echo -e "\n# 2. Frontend Next.js (apps/checkout-builder)" >> $OUTPUT
add_file "apps/checkout-builder/types/checkout-config.ts" "typescript"
add_file "apps/checkout-builder/stores/EditorContext.tsx" "tsx"
add_file "apps/checkout-builder/hooks/useCheckoutSave.ts" "typescript"

echo -e "\n## 2.1 Componentes Base (Core)" >> $OUTPUT
add_file "apps/checkout-builder/components/lab/ThemeList.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/ThemeCard.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/CheckoutEditor.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/CheckoutPreview.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/ConfigNameInput.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/EditorSidebar.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/EditorPanel.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/VersionHistory.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/TestLinkBanner.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/AbTestPanel.tsx" "tsx"

echo -e "\n## 2.2 Componentes de Controle (UI)" >> $OUTPUT
add_file "apps/checkout-builder/components/lab/controls/ColorPicker.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/controls/DragList.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/controls/ImageUpload.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/controls/NumberInput.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/controls/SelectInput.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/controls/SliderInput.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/controls/TextInput.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/controls/ToggleInput.tsx" "tsx"

echo -e "\n## 2.3 Painéis do Editor" >> $OUTPUT
add_file "apps/checkout-builder/components/lab/panels/PanelBrand.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/panels/PanelCss.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/panels/PanelFields.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/panels/PanelLayout.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/panels/PanelMethods.tsx" "tsx"
add_file "apps/checkout-builder/components/lab/panels/PanelTexts.tsx" "tsx"

echo -e "\n## 2.4 Páginas (App Router)" >> $OUTPUT
add_file "apps/checkout-builder/app/(dashboard)/lab/page.tsx" "tsx"
add_file "apps/checkout-builder/app/(dashboard)/lab/[id]/page.tsx" "tsx"
add_file "apps/checkout-builder/app/(dashboard)/lab/ab-test/page.tsx" "tsx"
add_file "apps/checkout-builder/app/checkout/preview/[token]/page.tsx" "tsx"

echo "Done!"
