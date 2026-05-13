<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventCheckoutController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (! $event->is_active) {
            return response()->json(['message' => 'Evento inativo.', 'esgotado' => true], 410);
        }

        return response()->json([
            'id'          => $event->id,
            'title'       => $event->title ?? $event->name,
            'description' => $event->description,
            'slug'        => $event->slug,
            'amount'      => $event->amount ?? $event->price,
            'currency'    => 'BRL',
            'image_url'   => $event->image_url,
            'date'        => $event->event_date ?? $event->date,
            'location'    => $event->location,
            'max_slots'   => $event->max_slots,
            'sold_slots'  => $event->sold_slots ?? 0,
            'whatsapp'    => $event->whatsapp_vendedor ?? null,
        ]);
    }

    public function process(Request $request, string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email',
            'document' => 'required|string',
            'phone'    => 'nullable|string',
            'method'   => 'required|in:pix,creditcard,boleto',
        ]);

        // Reutiliza a lógica existente via serviço se disponível
        // Por enquanto retorna estrutura padrão
        return response()->json([
            'message' => 'Processando pagamento do evento.',
            'event'   => $event->slug,
            'method'  => $data['method'],
        ]);
    }

    public function status(string $slug): JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        return response()->json(['active' => $event->is_active, 'slug' => $slug]);
    }
}
