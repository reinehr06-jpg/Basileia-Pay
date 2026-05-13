<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiCheckoutExtractorService
{
    private string $apiKey;
    private string $model = 'gpt-4o';  // gpt-4o tem Vision nativo

    public function __construct()
    {
        $this->apiKey = config('services.openai.key');
    }

    // ─── Modo 1: Imagem (print/screenshot) ────────────────────────────────────

    public function fromImage(string $base64Image, string $mimeType = 'image/png'): array
    {
        $prompt = $this->buildPrompt('image');

        $response = Http::withToken($this->apiKey)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'       => $this->model,
                'max_tokens'  => 2000,
                'messages'    => [
                    [
                        'role'    => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => $prompt,
                            ],
                            [
                                'type'      => 'image_url',
                                'image_url' => [
                                    'url'    => "data:{$mimeType};base64,{$base64Image}",
                                    'detail' => 'high',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

        return $this->parseResponse($response);
    }

    // ─── Modo 2: HTML bruto ────────────────────────────────────────────────────

    public function fromHtml(string $html): array
    {
        // Limpa o HTML antes de enviar — remove scripts, comentários, atributos irrelevantes
        $cleanHtml = $this->cleanHtml($html);

        // Trunca em 15k chars para não estourar o contexto
        $truncated = mb_substr($cleanHtml, 0, 15000);

        $prompt = $this->buildPrompt('html') . "\n\n```html\n{$truncated}\n```";

        $response = Http::withToken($this->apiKey)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'      => $this->model,
                'max_tokens' => 2000,
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

        return $this->parseResponse($response);
    }

    // ─── Modo 3: URL + Screenshot ─────────────────────────────────────────────

    public function fromUrlScreenshot(string $url, BrowsershotService $browsershot): array
    {
        $base64 = $browsershot->screenshot($url);
        return $this->fromImage($base64, 'image/png');
    }

    // ─── Prompt ───────────────────────────────────────────────────────────────

    private function buildPrompt(string $mode): string
    {
        $context = $mode === 'image'
            ? 'Você receberá uma imagem de um checkout de pagamento.'
            : 'Você receberá o código HTML de um checkout de pagamento.';

        return <<<PROMPT
{$context}

Analise e extraia as seguintes informações para montar uma configuração visual de checkout.
Retorne APENAS um JSON válido, sem markdown, sem explicações, sem ```json```.

O JSON deve seguir exatamente esta estrutura (use null para valores não encontrados):

{
  "primary_color": "#hex ou null",
  "secondary_color": "#hex ou null",
  "background_color": "#hex ou null",
  "text_color": "#hex ou null",
  "text_muted_color": "#hex ou null",
  "border_color": "#hex ou null",
  "success_color": "#hex ou null",
  "error_color": "#hex ou null",
  "border_radius": número inteiro em px (0-32) ou null,
  "shadow": true ou false,
  "logo_url": "url absoluta ou null",
  "title": "texto do título principal ou null",
  "description": "texto da descrição ou null",
  "button_text": "texto do botão de pagamento ou null",
  "success_title": "texto de sucesso ou null",
  "success_message": "mensagem de sucesso ou null",
  "show_timer": true ou false,
  "methods": {
    "pix": true ou false (detectou PIX?),
    "card": true ou false (detectou cartão?),
    "boleto": true ou false (detectou boleto?)
  },
  "fields": {
    "name": true ou false,
    "email": true ou false,
    "phone": true ou false,
    "document": true ou false,
    "address": true ou false
  },
  "card_installments": número máximo de parcelas detectado ou null,
  "confidence": número de 0 a 100 indicando sua confiança na extração,
  "notes": "observações relevantes em português ou null"
}

Regras:
- Cores devem estar em formato #rrggbb minúsculo
- border_radius deve ser o valor predominante dos elementos arredondados
- methods e fields devem refletir o que REALMENTE aparece na tela
- Se não encontrar uma informação, use null — NUNCA invente dados
- confidence: 90+ = tudo claro, 70-89 = maioria clara, 50-69 = parcial, <50 = muito incerto
PROMPT;
    }

    // ─── Parse e validação da resposta ────────────────────────────────────────

    private function parseResponse($response): array
    {
        if (!$response->successful()) {
            Log::error('OpenAI API error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new \RuntimeException('Erro na API de IA. Tente novamente.');
        }

        $content = $response->json('choices.0.message.content', '');

        // Remove possíveis markdown code fences caso o modelo insista
        $content = preg_replace('/^```[a-z]*\n?/', '', trim($content));
        $content = preg_replace('/\n?```$/', '', $content);

        $decoded = json_decode(trim($content), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('OpenAI returned invalid JSON', ['content' => $content]);
            throw new \RuntimeException('A IA retornou uma resposta inválida. Tente com outra imagem.');
        }

        return $this->sanitize($decoded);
    }

    // ─── Sanitização dos dados retornados ─────────────────────────────────────

    private function sanitize(array $data): array
    {
        $hexFields = ['primary_color','secondary_color','background_color','text_color',
                      'text_muted_color','border_color','success_color','error_color'];

        foreach ($hexFields as $field) {
            if (isset($data[$field]) && !preg_match('/^#[0-9a-f]{6}$/i', $data[$field])) {
                $data[$field] = null;
            }
        }

        if (isset($data['border_radius'])) {
            $data['border_radius'] = max(0, min(32, (int) $data['border_radius']));
        }

        if (isset($data['card_installments'])) {
            $data['card_installments'] = max(1, min(24, (int) $data['card_installments']));
        }

        $data['confidence'] = isset($data['confidence'])
            ? max(0, min(100, (int) $data['confidence']))
            : 50;

        return $data;
    }

    // ─── Limpeza do HTML ──────────────────────────────────────────────────────

    private function cleanHtml(string $html): string
    {
        // Remove scripts e estilos de terceiros grandes
        $html = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $html);
        $html = preg_replace('/<!--.*?-->/s', '', $html);

        // Mantém style tags (contêm as cores)
        // Remove atributos irrelevantes para reduzir tokens
        $html = preg_replace('/\s+(data-[a-z-]+|aria-[a-z-]+|tabindex|autocomplete)="[^"]*"/', '', $html);

        return trim($html);
    }
}
