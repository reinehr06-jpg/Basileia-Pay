<?php

namespace App\Services;

use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

class BrowsershotService
{
    // Requer: npm install -g puppeteer  OU  composer require spatie/browsershot

    public function screenshot(string $url): string
    {
        // Opção A — Spatie Browsershot (recomendado se já usa Composer)
        if (class_exists(\Spatie\Browsershot\Browsershot::class)) {
            return $this->screenshotViaBrowsershot($url);
        }

        // Opção B — Node script via Process
        return $this->screenshotViaNode($url);
    }

    private function screenshotViaBrowsershot(string $url): string
    {
        $path = storage_path('app/tmp/' . Str::random(16) . '.png');
        
        // Ensure directory exists
        @mkdir(dirname($path), 0777, true);

        \Spatie\Browsershot\Browsershot::url($url)
            ->windowSize(1440, 900)
            ->waitUntilNetworkIdle()
            ->setDelay(1500)          // aguarda animações
            ->fullPage()
            ->save($path);

        $base64 = base64_encode(file_get_contents($path));
        @unlink($path);
        return $base64;
    }

    private function screenshotViaNode(string $url): string
    {
        $path   = storage_path('app/tmp/' . Str::random(16) . '.png');
        $script = base_path('scripts/screenshot.js');

        // Ensure directory exists
        @mkdir(dirname($path), 0777, true);

        $result = Process::run("node {$script} " . escapeshellarg($url) . " " . escapeshellarg($path));

        if ($result->failed()) {
            throw new \RuntimeException('Falha ao capturar screenshot: ' . $result->errorOutput());
        }

        $base64 = base64_encode(file_get_contents($path));
        @unlink($path);
        return $base64;
    }
}
