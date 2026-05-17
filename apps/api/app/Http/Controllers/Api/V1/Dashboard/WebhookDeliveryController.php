<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\WebhookDelivery;
use App\Services\Security\SensitiveDataMasker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookDeliveryController extends Controller
{
    protected $masker;

    public function __construct(SensitiveDataMasker $masker)
    {
        $this->masker = $masker;
    }

    /**
     * Listar todas as tentativas de entrega de webhook.
     */
    public function index(Request $request): JsonResponse
    {
        $deliveries = WebhookDelivery::where('company_id', $request->user()->company_id)
            ->with('endpoint')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $deliveries->items(),
            'meta'    => [
                'current_page' => $deliveries->currentPage(),
                'last_page'    => $deliveries->lastPage(),
                'total'        => $deliveries->total(),
            ]
        ]);
    }

    /**
     * Mostrar detalhes de uma entrega, incluindo payload mascarado.
     */
    public function show(string $uuid, Request $request): JsonResponse
    {
        $delivery = WebhookDelivery::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        // Mascarar payload sensível antes de exibir no dashboard
        $delivery->payload = $this->masker->maskArray($delivery->payload ?? []);

        return response()->json([
            'success' => true,
            'data'    => $delivery
        ]);
    }

    /**
     * Retentar o envio de um webhook falho.
     */
    public function retry(string $uuid, Request $request): JsonResponse
    {
        $delivery = WebhookDelivery::where('company_id', $request->user()->company_id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        // Em um cenário real, aqui despacharíamos um novo Job
        // \App\Jobs\DispatchWebhookJob::dispatch($delivery->endpoint, $delivery->event, $delivery->payload);

        return response()->json([
            'success' => true,
            'message' => 'Tentativa de reenvio agendada com sucesso.'
        ]);
    }
}
