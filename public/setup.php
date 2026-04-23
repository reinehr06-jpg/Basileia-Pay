<?php
header('Content-Type: text/html; charset=utf-8');
echo "<h1>CheckOut - Auto Setup</h1>";

$basePath = dirname(__DIR__);
$envPath = $basePath . '/.env';
$examplePath = $basePath . '/.env.example';

// 1. Check if .env exists
echo "<h2>1. Verificando .env...</h2>";
if (file_exists($envPath)) {
    echo "✅ .env já existe<br>";
} else {
    echo "⚠️ .env não encontrado. Criando a partir de .env.example...<br>";
    if (file_exists($examplePath)) {
        copy($examplePath, $envPath);
        echo "✅ .env criado com sucesso!<br>";
    } else {
        echo "❌ .env.example não encontrado!<br>";
    }
}

// 2. Fix database path
echo "<h2>2. Configurando banco de dados...</h2>";
if (file_exists($envPath)) {
    $env = file_get_contents($envPath);
    
    // Fix SQLite path
    $newPath = $basePath . '/database/database.sqlite';
    if (!file_exists($newPath)) {
        touch($newPath);
        echo "✅ Arquivo database.sqlite criado em: $newPath<br>";
    }
    
    $env = preg_replace('/DB_DATABASE=.*/', 'DB_DATABASE=' . $newPath, $env);
    file_put_contents($envPath, $env);
    echo "✅ Caminho do banco corrigido<br>";
}

// 3. Check vendor
echo "<h2>3. Verificando vendor...</h2>";
if (is_dir($basePath . '/vendor')) {
    echo "✅ Pasta vendor existe<br>";
} else {
    echo "❌ Pasta vendor NÃO existe. Execute: composer install<br>";
}

// 4. Permissions
echo "<h2>4. Verificando permissões...</h2>";
$storage = $basePath . '/storage';
if (is_writable($storage)) {
    echo "✅ Storage é gravável<br>";
} else {
    echo "⚠️ Storage não é gravável. Execute: chmod -R 755 storage<br>";
}

echo "<hr><h2>Status Final</h2>";
echo "Acesse: <a href='index.php'>Página Principal</a><br>";
echo "Ou: <a href='health.php'>Health Check</a><br>";
