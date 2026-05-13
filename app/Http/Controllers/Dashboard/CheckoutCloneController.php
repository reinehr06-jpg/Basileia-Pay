<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckoutCloneController extends Controller
{
    private string $aiUrl;
    private string $aiModel;

    private const SYSTEM_PROMPT = <<<'PROMPT'
You are a checkout layout analyzer.
When given a description of a payment checkout page, you must return ONLY a valid JSON object.
No explanations. No markdown. No text before or after. Only raw JSON.

Required format:
{
  "backgroundColor": "#ffffff",
  "canvasWidth": 600,
  "canvasHeight": 900,
  "elements": [
    {
      "type": "rect|text|button|input|image|circle|pix|card-form",
      "x": 0,
      "y": 0,
      "width": 200,
      "height": 50,
      "props": {
        "text": "visible text if any",
        "backgroundColor": "#hex",
        "color": "#hex",
        "fontSize": 16,
        "fontWeight": "400",
        "borderRadius": 8,
        "borderColor": "#hex",
        "borderWidth": 1,
        "placeholder": "placeholder if input",
        "opacity": 1
      }
    }
  ]
}

Rules:
- type "pix" = QR code or Pix payment block
- type "card-form" = credit card form block
- type "button" = action buttons
- type "input" = form fields
- type "text" = titles, labels, paragraphs
- type "rect" = cards, containers, dividers
- type "image" = logos or images
- All x/y/width/height in pixels inside a 600x900 canvas
- Generate realistic positions so elements don't overlap
- Return between 8 and 25 elements for a complete checkout page
PROMPT;

    public function __construct()
    {
        $this->aiUrl   = env('LOCAL_AI_URL', 'https://longish-quaggy-carmen.ngrok-free.dev/v1');
        $this->aiModel = env('LOCAL_AI_MODEL', 'hf.co/s3dev-ai/Falcon3-10B-Instruct-gguf:Q6_K');
    }

    /**
     * POST /dashboard/lab/clone — recebe URL ou imagem, retorna JSON de elementos.
     */
    public function clone(Request $request)
    {
        try {
            $userMessage = '';

            if ($request->has('url')) {
                $url = $request->input('url');
                $userMessage = "Analyze the payment checkout page at this URL: {$url}\n"
                    . "Generate a complete layout JSON representing a modern checkout page with all typical elements: "
                    . "header with logo, title, customer form fields (name, email, phone, CPF), "
                    . "payment method tabs (PIX and credit card), a card form block or pix block, "
                    . "price display, and a submit button. Use a clean modern design with appropriate colors.";

            } elseif ($request->hasFile('image')) {
                $file = $request->file('image');
                $userMessage = "Analyze this payment checkout screenshot and generate the complete layout JSON. "
                    . "The image is a checkout page. Generate elements for all visible components: "
                    . "header, titles, form fields, payment blocks, buttons, etc. "
                    . "Use realistic positions within a 600x900 canvas.";

            } else {
                return response()->json(['error' => 'Envie uma URL ou imagem'], 400);
            }

            // Chama o Falcon3 via ngrok
            $response = Http::timeout(120)
                ->withHeaders(['ngrok-skip-browser-warning' => 'true'])
                ->post("{$this->aiUrl}/chat/completions", [
                    'model'       => $this->aiModel,
                    'messages'    => [
                        ['role' => 'system', 'content' => self::SYSTEM_PROMPT],
                        ['role' => 'user',   'content' => $userMessage],
                    ],
                    'temperature' => 0.1,
                    'max_tokens'  => 4096,
                ]);

            if (!$response->ok()) {
                Log::error('[clone] AI error', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json(['error' => 'Erro na IA: ' . $response->status()], 502);
            }

            $raw = $response->json('choices.0.message.content', '');
            $result = $this->extractJson($raw);

            if (!isset($result['elements']) || !is_array($result['elements'])) {
                throw new \Exception('IA não retornou "elements" válido');
            }

            // Adiciona IDs únicos em cada elemento
            foreach ($result['elements'] as &$el) {
                $el['id']       = 'el_' . time() . '_' . substr(md5(rand()), 0, 5);
                $el['rotation'] = $el['rotation'] ?? 0;
                $el['locked']   = false;
                $el['visible']  = true;
                $el['name']     = $el['type'] ?? 'rect';
            }

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('[clone] Exception', ['msg' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Fallback — gera layout padrão se IA estiver offline.
     */
    public function fallback(Request $request)
    {
        $result = [
            'backgroundColor' => '#f8fafc',
            'canvasWidth'     => 600,
            'canvasHeight'    => 900,
            'elements'        => $this->defaultCheckoutElements(),
        ];

        return response()->json($result);
    }

    private function extractJson(string $raw): array
    {
        $clean = preg_replace('/```json|```/', '', $raw);
        $clean = trim($clean);

        $start = strpos($clean, '{');
        $end   = strrpos($clean, '}');

        if ($start === false || $end === false) {
            throw new \Exception('IA não retornou JSON válido');
        }

        $json = substr($clean, $start, $end - $start + 1);
        $data = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('JSON inválido: ' . json_last_error_msg());
        }

        return $data;
    }

    private function defaultCheckoutElements(): array
    {
        $id = fn() => 'el_' . time() . '_' . substr(md5(rand()), 0, 5);
        return [
            ['id'=>$id(),'type'=>'rect','x'=>0,'y'=>0,'width'=>600,'height'=>900,'rotation'=>0,'props'=>['backgroundColor'=>'#f8fafc','borderRadius'=>0],'locked'=>false,'visible'=>true,'name'=>'bg'],
            ['id'=>$id(),'type'=>'rect','x'=>50,'y'=>30,'width'=>500,'height'=>840,'rotation'=>0,'props'=>['backgroundColor'=>'#ffffff','borderRadius'=>16,'borderWidth'=>1,'borderColor'=>'#e2e8f0'],'locked'=>false,'visible'=>true,'name'=>'card'],
            ['id'=>$id(),'type'=>'text','x'=>80,'y'=>60,'width'=>440,'height'=>36,'rotation'=>0,'props'=>['text'=>'Finalize seu pagamento','color'=>'#1e293b','fontSize'=>22,'fontWeight'=>'700'],'locked'=>false,'visible'=>true,'name'=>'title'],
            ['id'=>$id(),'type'=>'input','x'=>80,'y'=>120,'width'=>440,'height'=>48,'rotation'=>0,'props'=>['placeholder'=>'Seu nome completo','backgroundColor'=>'#ffffff','borderColor'=>'#e2e8f0','borderWidth'=>1,'borderRadius'=>8,'fontSize'=>14,'color'=>'#1e293b'],'locked'=>false,'visible'=>true,'name'=>'input'],
            ['id'=>$id(),'type'=>'input','x'=>80,'y'=>180,'width'=>440,'height'=>48,'rotation'=>0,'props'=>['placeholder'=>'email@exemplo.com','backgroundColor'=>'#ffffff','borderColor'=>'#e2e8f0','borderWidth'=>1,'borderRadius'=>8,'fontSize'=>14,'color'=>'#1e293b'],'locked'=>false,'visible'=>true,'name'=>'input'],
            ['id'=>$id(),'type'=>'input','x'=>80,'y'=>240,'width'=>440,'height'=>48,'rotation'=>0,'props'=>['placeholder'=>'(00) 00000-0000','backgroundColor'=>'#ffffff','borderColor'=>'#e2e8f0','borderWidth'=>1,'borderRadius'=>8,'fontSize'=>14,'color'=>'#1e293b'],'locked'=>false,'visible'=>true,'name'=>'input'],
            ['id'=>$id(),'type'=>'input','x'=>80,'y'=>300,'width'=>440,'height'=>48,'rotation'=>0,'props'=>['placeholder'=>'CPF','backgroundColor'=>'#ffffff','borderColor'=>'#e2e8f0','borderWidth'=>1,'borderRadius'=>8,'fontSize'=>14,'color'=>'#1e293b'],'locked'=>false,'visible'=>true,'name'=>'input'],
            ['id'=>$id(),'type'=>'text','x'=>80,'y'=>375,'width'=>440,'height'=>28,'rotation'=>0,'props'=>['text'=>'Método de pagamento','color'=>'#64748b','fontSize'=>14,'fontWeight'=>'600'],'locked'=>false,'visible'=>true,'name'=>'label'],
            ['id'=>$id(),'type'=>'pix','x'=>80,'y'=>415,'width'=>440,'height'=>280,'rotation'=>0,'props'=>['backgroundColor'=>'#ffffff','borderRadius'=>16,'borderWidth'=>1,'borderColor'=>'#e2e8f0'],'locked'=>false,'visible'=>true,'name'=>'pix'],
            ['id'=>$id(),'type'=>'button','x'=>80,'y'=>720,'width'=>440,'height'=>52,'rotation'=>0,'props'=>['text'=>'Pagar agora','backgroundColor'=>'#7c3aed','color'=>'#ffffff','fontSize'=>16,'fontWeight'=>'600','borderRadius'=>10],'locked'=>false,'visible'=>true,'name'=>'button'],
            ['id'=>$id(),'type'=>'text','x'=>80,'y'=>790,'width'=>440,'height'=>20,'rotation'=>0,'props'=>['text'=>'Pagamento seguro via SSL 🔒','color'=>'#94a3b8','fontSize'=>12,'fontWeight'=>'400'],'locked'=>false,'visible'=>true,'name'=>'footer'],
        ];
    }
}
