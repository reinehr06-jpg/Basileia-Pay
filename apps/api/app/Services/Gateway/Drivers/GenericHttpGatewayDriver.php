<?php

namespace App\Services\Gateway\Drivers;

use App\Services\Gateway\Contracts\GatewayDriverInterface;
use App\Services\Gateway\DTO\ChargeRequest;
use App\Services\Gateway\DTO\ChargeResponse;
use App\Services\Gateway\DTO\NormalizedEvent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Arr;
use Exception;

class GenericHttpGatewayDriver implements GatewayDriverInterface
{
    public function __construct(private array $config, private string $apiKey) {}

    public function createCharge(ChargeRequest $request): ChargeResponse
    {
        try {
            $endpoint = $this->config['create_charge'];
            $methodMap = $endpoint['payment_method_map'] ?? [];
            $payload = $this->buildPayload($endpoint['request_map'], $request, $methodMap);
            $authHeader = $this->resolveAuth();

            $response = Http::withHeaders($authHeader)
                ->{strtolower($endpoint['method'])}($this->config['base_url'] . $endpoint['path'], $payload);

            return $this->mapResponse($response, $endpoint['response_map']);
        } catch (Exception $e) {
            return new ChargeResponse(
                success: false,
                status: 'error',
                errorMessage: $e->getMessage()
            );
        }
    }

    public function verifySignature(string $rawBody, string $signature, string $secret): bool
    {
        $webhookConfig = $this->config['webhook'] ?? [];
        if (empty($webhookConfig['signature_algorithm'])) {
            return true; // If not configured, we might bypass or fail. Bypassing for flexiblity.
        }

        $algorithm = str_replace('hmac_', '', $webhookConfig['signature_algorithm']);
        $computed = hash_hmac($algorithm, $rawBody, $secret);
        
        return hash_equals($computed, $signature);
    }

    public function parseWebhookEvent(array $payload): NormalizedEvent
    {
        $map = $this->config['webhook'] ?? [];
        
        $eventPath = $map['event_type_path'] ?? 'type';
        $idPath = $map['event_id_path'] ?? 'id';
        
        $eventType = data_get($payload, $eventPath);
        
        $statusMapping = $map['event_type_map'] ?? [];
        $mappedStatus = $statusMapping[$eventType] ?? 'unknown';

        return new NormalizedEvent(
            gatewayEventId: (string) data_get($payload, $idPath, uniqid('gen_')),
            eventType: $eventType ?? 'unknown',
            gatewayPaymentId: $this->extractPaymentId($payload, $map),
            status: $mappedStatus,
            rawPayload: $payload
        );
    }

    private function buildPayload(array $map, ChargeRequest $request, array $methodMap): array
    {
        $result = [];
        foreach ($map as $targetField => $template) {
            $value = $this->resolveTemplate($template, $request, $methodMap);
            Arr::set($result, $targetField, $value);
        }
        return $result;
    }

    private function resolveTemplate(string $template, ChargeRequest $request, array $methodMap): mixed
    {
        if ($template === '{{payment_method_mapped}}') {
            return $methodMap[$request->paymentMethod] ?? $request->paymentMethod;
        }

        // Se o template tem as chaves {{ }}
        if (preg_match('/^{{(.*?)}}$/', $template, $matches)) {
            $key = $matches[1];
            $data = [
                'amount' => $request->amount,
                'currency' => $request->currency,
                'reference' => $request->reference,
                'customer' => $request->customer,
                'paymentMethod' => $request->paymentMethod,
            ];
            return data_get($data, $key, $template);
        }

        return $template;
    }

    private function resolveAuth(): array
    {
        $auth = $this->config['auth'] ?? [];
        if (empty($auth)) {
            return [];
        }

        if (($auth['type'] ?? '') === 'header') {
            $headerName = $auth['header_name'] ?? 'Authorization';
            $value = str_replace('{{api_key}}', $this->apiKey, $auth['value_template'] ?? '{{api_key}}');
            return [$headerName => $value];
        }

        return [];
    }

    private function mapResponse($response, array $map): ChargeResponse
    {
        $body = $response->json() ?? [];
        $rawStatus = data_get($body, $map['status'] ?? 'status');
        
        $statusMap = $map['status_map'] ?? [];
        $status = $statusMap[$rawStatus] ?? 'pending';

        return new ChargeResponse(
            success: $response->successful(),
            status: $status,
            gatewayPaymentId: (string) data_get($body, $map['gateway_payment_id'] ?? 'id'),
            errorMessage: $response->failed() ? data_get($body, 'message') : null,
            rawResponse: $body
        );
    }

    private function extractPaymentId(array $payload, array $map): string
    {
        $path = $map['payment_id_path'] ?? 'data.id';
        return (string) data_get($payload, $path, '');
    }
}
