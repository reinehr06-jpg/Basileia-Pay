<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class UrlScraperService
{
    private int $timeout = 10;

    public function extract(string $url): array
    {
        $response = Http::timeout($this->timeout)
            ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; BasileiaBot/1.0)'])
            ->get($url);

        if (!$response->successful()) {
            throw new \RuntimeException("Não foi possível acessar a URL (HTTP {$response->status()})");
        }

        $html = $response->body();

        return [
            'url'            => $url,
            'colors'         => $this->extractColors($html),
            'logo_url'       => $this->extractLogo($html, $url),
            'favicon_url'    => $this->extractFavicon($html, $url),
            'fonts'          => $this->extractFonts($html),
            'title'          => $this->extractTitle($html),
            'border_radius'  => $this->guessBorderRadius($html),
            'button_text'    => $this->extractButtonText($html),
            'meta'           => $this->extractMeta($html),
        ];
    }

    private function extractColors(string $html): array
    {
        $colors = [];

        preg_match_all('/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/', $html, $hexMatches);
        foreach ($hexMatches[0] as $hex) {
            $normalized = $this->normalizeHex($hex);
            if ($this->isUsefulColor($normalized)) {
                $colors[$normalized] = ($colors[$normalized] ?? 0) + 1;
            }
        }

        preg_match_all('/rgb[a]?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i', $html, $rgbMatches, PREG_SET_ORDER);
        foreach ($rgbMatches as $m) {
            $hex = '#' . sprintf('%02x%02x%02x', $m[1], $m[2], $m[3]);
            if ($this->isUsefulColor($hex)) {
                $colors[$hex] = ($colors[$hex] ?? 0) + 1;
            }
        }

        arsort($colors);
        $sorted = array_keys($colors);

        return [
            'primary'    => $sorted[0]  ?? '#7c3aed',
            'secondary'  => $sorted[1]  ?? '#6366f1',
            'background' => $this->findBackground($sorted),
            'text'       => $this->findTextColor($sorted),
            'all'        => array_slice($sorted, 0, 12),
        ];
    }

    private function normalizeHex(string $hex): string
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }
        return '#' . strtolower($hex);
    }

    private function isUsefulColor(string $hex): bool
    {
        $skip = ['#ffffff','#000000','#fff','#000','#eeeeee','#f0f0f0','#cccccc','#e5e5e5','#333333','#666666'];
        return !in_array(strtolower($hex), $skip);
    }

    private function findBackground(array $colors): string
    {
        foreach ($colors as $c) {
            [$r, $g, $b] = sscanf($c, '#%02x%02x%02x');
            $luminance = ($r + $g + $b) / 3;
            if ($luminance > 200) return $c;
        }
        return '#ffffff';
    }

    private function findTextColor(array $colors): string
    {
        foreach (array_reverse($colors) as $c) {
            [$r, $g, $b] = sscanf($c, '#%02x%02x%02x');
            $luminance = ($r + $g + $b) / 3;
            if ($luminance < 80) return $c;
        }
        return '#1e293b';
    }

    private function extractLogo(string $html, string $baseUrl): ?string
    {
        $candidates = [];

        preg_match_all('/<img[^>]+>/i', $html, $imgs);
        foreach ($imgs[0] as $img) {
            if (preg_match('/logo|brand|header/i', $img)) {
                if (preg_match('/src=["\']([^"\']+)["\']/', $img, $src)) {
                    $candidates[] = ['url' => $this->absoluteUrl($src[1], $baseUrl), 'score' => 10];
                }
            }
        }

        preg_match_all('/<link[^>]+rel=["\'][^"\']*apple-touch-icon[^"\']*["\'][^>]+>/i', $html, $links);
        foreach ($links[0] as $link) {
            if (preg_match('/href=["\']([^"\']+)["\']/', $link, $href)) {
                $candidates[] = ['url' => $this->absoluteUrl($href[1], $baseUrl), 'score' => 8];
            }
        }

        if (empty($candidates)) return null;

        usort($candidates, fn($a,$b) => $b['score'] <=> $a['score']);
        return $candidates[0]['url'];
    }

    private function extractFavicon(string $html, string $baseUrl): ?string
    {
        preg_match_all('/<link[^>]+rel=["\'][^"\']*icon[^"\']*["\'][^>]+>/i', $html, $links);
        foreach ($links[0] as $link) {
            if (preg_match('/href=["\']([^"\']+)["\']/', $link, $href)) {
                return $this->absoluteUrl($href[1], $baseUrl);
            }
        }
        $parsed = parse_url($baseUrl);
        return ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '') . '/favicon.ico';
    }

    private function extractFonts(string $html): array
    {
        $fonts = [];

        preg_match_all('/fonts\.googleapis\.com\/css[^"\']+family=([^"\'&]+)/i', $html, $gf);
        foreach ($gf[1] as $family) {
            $name = urldecode(explode(':', $family)[0]);
            $name = str_replace('+', ' ', $name);
            $fonts[] = $name;
        }

        preg_match_all('/font-family\s*:\s*["\']?([A-Za-z\s]+)["\']?/i', $html, $ff);
        foreach ($ff[1] as $family) {
            $clean = trim($family, " \"',");
            if (!in_array($clean, ['sans-serif','serif','monospace','inherit','initial','unset'])
                && !in_array($clean, $fonts)) {
                $fonts[] = $clean;
            }
        }

        return array_unique(array_slice($fonts, 0, 5));
    }

    private function guessBorderRadius(string $html): int
    {
        preg_match_all('/border-radius\s*:\s*(\d+)px/i', $html, $matches);
        if (empty($matches[1])) return 12;

        $values = array_map('intval', $matches[1]);
        $avg    = (int) round(array_sum($values) / count($values));
        return min(max($avg, 0), 32);
    }

    private function extractTitle(string $html): string
    {
        if (preg_match('/<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']/', $html, $m)) {
            return strip_tags($m[1]);
        }
        if (preg_match('/<title>([^<]+)<\/title>/i', $html, $m)) {
            return strip_tags($m[1]);
        }
        return 'Finalize seu pagamento';
    }

    private function extractButtonText(string $html): string
    {
        preg_match_all('/<button[^>]*>(.*?)<\/button>/is', $html, $buttons);
        $ctas = ['comprar','pagar','contratar','assinar','confirmar','finalizar','checkout','buy','pay'];
        foreach ($buttons[1] as $text) {
            $clean = strip_tags(trim($text));
            foreach ($ctas as $cta) {
                if (stripos($clean, $cta) !== false) return $clean;
            }
        }
        return 'Pagar agora';
    }

    private function extractMeta(string $html): array
    {
        $meta = [];
        if (preg_match('/<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']/', $html, $m)) {
            $meta['description'] = strip_tags($m[1]);
        }
        if (preg_match('/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']/', $html, $m)) {
            $meta['og_image'] = $m[1];
        }
        return $meta;
    }

    private function absoluteUrl(string $url, string $baseUrl): string
    {
        if (str_starts_with($url, 'http')) return $url;
        $parsed = parse_url($baseUrl);
        $base   = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
        return $base . '/' . ltrim($url, '/');
    }
}
