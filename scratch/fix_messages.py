import os
import re

base_dir = "apps/api/app/Http/Controllers"

for root, _, files in os.walk(base_dir):
    for file in files:
        if not file.endswith('.php'):
            continue
            
        filepath = os.path.join(root, file)
        with open(filepath, 'r') as f:
            content = f.read()
            
        if '$e->getMessage()' not in content:
            continue
            
        content = re.sub(
            r"['\"]error['\"]\s*=>\s*\$e->getMessage\(\)",
            r"'error' => app()->environment('production') ? 'Erro interno do servidor.' : $e->getMessage()",
            content
        )
        content = re.sub(
            r"['\"]message['\"]\s*=>\s*\$e->getMessage\(\)",
            r"'message' => app()->environment('production') ? 'Erro interno do servidor.' : $e->getMessage()",
            content
        )
        content = re.sub(
            r"['\"]error['\"]\s*=>\s*['\"](.*?)['\"]\s*\.\s*\$e->getMessage\(\)",
            r"'error' => app()->environment('production') ? '\1' : '\1' . $e->getMessage()",
            content
        )
        content = re.sub(
            r"['\"]message['\"]\s*=>\s*['\"](.*?)['\"]\s*\.\s*\$e->getMessage\(\)",
            r"'message' => app()->environment('production') ? '\1' : '\1' . $e->getMessage()",
            content
        )
        
        content = re.sub(
            r"['\"]error_message['\"]\s*=>\s*\$e->getMessage\(\)",
            r"'error_message' => app()->environment('production') ? 'Erro interno.' : $e->getMessage()",
            content
        )
        
        content = re.sub(
            r"['\"]payment['\"]\s*=>\s*['\"](.*?)['\"]\s*\.\s*\$e->getMessage\(\)",
            r"'payment' => app()->environment('production') ? '\1' : '\1' . $e->getMessage()",
            content
        )
        
        with open(filepath, 'w') as f:
            f.write(content)
