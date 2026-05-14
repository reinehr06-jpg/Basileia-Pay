<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Events\PaymentApproved;
use App\Events\PaymentCancelled;
use App\Events\PaymentPending;
use App\Events\PaymentRefused;
use App\Events\PaymentRefunded;
use App\Models\Customer;
use App\Models\Gateway;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\Integration;
use App\Services\Gateway\GatewayFactory;
use App\Helpers\PaymentStatusMapper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class PaymentService
{
    use \App\Traits\EmitsPaymentEvents;

    public function __construct(
        private GatewayFactory $gatewayFactory,
        private CustomerService $customerService,
        private TransactionService $transactionService,
    ) {}

    /**
     * Alinhado com Api\V1\PaymentController@process
     */
    public function process(array $data, ?Integration $integration = null): array
    {
        return DB::transaction(function () use ($data, $integration) {
            $transaction = Transaction::where('uuid', $data['transaction_uuid'])->firstOrFail();
            
            // Resolve gateway (se não passado, pega o da integração da transação)
            $integration = $integration ?? $transaction->integration;
            $gateway = $this->gatewayFactory->make($integration->gateway->type);
            
            // Mapeia credit_card para o que o gateway/asaas espera (CREDITCARD)
            $billingTypeMap = [
                'credit_card' => 'CREDIT_CARD',
                'pix' => 'PIX',
                'boleto' => 'BOLETO'
            ];
            $billingType = $billingTypeMap[$data['payment_method']] ?? 'CREDIT_CARD';

            // Se for cartão, resolve os dados através do Vault interno
            $cardToken = $data['card_token'] ?? ($data['card']['number'] ?? null); // fallback pra payload antigo se vier
            $resolvedCard = null;

            if ($billingType === 'CREDIT_CARD' && $cardToken) {
                // Tentamos resolver via VaultService
                // transaction->integration->company_id seria ideal. Vamos assumir que integration->company_id existe.
                $companyId = $integration->company_id ?? $transaction->integration->company_id;
                
                $resolvedCard = \App\Services\Vault\VaultService::resolveToken($companyId, $cardToken);
                
                if (!$resolvedCard && !str_contains($cardToken, '-')) {
                    // Se não achou e não tem formato de UUID, vamos assumir que mandaram PAN direto (legado)
                    $resolvedCard = [
                        'number' => $data['card']['number'] ?? $cardToken,
                        'expiry' => isset($data['card']['expiry_month']) ? "{$data['card']['expiry_month']}/{$data['card']['expiry_year']}" : null,
                        'cvv'    => $data['card']['cvv'] ?? null,
                    ];
                } elseif (!$resolvedCard) {
                    throw new \RuntimeException('Falha ao resolver token do cartão de crédito.');
                }
            }

            // Prepara dados para o gateway
            $gatewayInput = [
                'amountBRL' => (float) $transaction->amount,
                'description' => $transaction->description ?? "Pagamento #{$transaction->uuid}",
                'installments' => (int) ($data['installments'] ?? $data['card']['installments'] ?? 1),
                
                // Dados do cartão resolvido
                'cardToken' => $resolvedCard ? $resolvedCard['number'] : null, // O driver espera 'cardToken' como number ou o payload do cartão
                'cardHolderName' => $data['card_holder_name'] ?? $data['card']['holder_name'] ?? null,
                'cardExpiry' => $resolvedCard ? $resolvedCard['expiry'] : null,
                'cardCvv' => $resolvedCard ? $resolvedCard['cvv'] : null,
                
                'remoteIp' => request()->ip(),
                
                // Holder info real (BUG-02)
                'holder_email' => $data['card']['email'] ?? $transaction->customer_email,
                'card_document' => $data['card']['document'] ?? $transaction->customer_document,
            ];

            // Executa a cobrança no gateway
            $customerId = $this->resolveGatewayCustomerId($transaction, $gateway);
            
            $this->emitPaymentEvent([
                'transaction_uuid' => $transaction->uuid,
                'company_id'       => $integration->company_id,
                'integration_id'   => $integration->id,
                'gateway_id'       => $integration->gateway_id,
                'gateway_type'     => $integration->gateway->type,
                'event_type'       => 'gateway_request',
                'status_normalized'=> $transaction->status,
                'payment_method'   => $data['payment_method'],
                'amount'           => $transaction->amount,
            ]);
            
            try {
                $gatewayResponse = match($billingType) {
                    'PIX' => $gateway->chargeViaPix($gatewayInput, $customerId),
                    'BOLETO' => $gateway->chargeViaBoleto($gatewayInput, $customerId),
                    default => $gateway->charge($gatewayInput, $customerId),
                };
            } catch (\Throwable $e) {
                $fallbackIds = $transaction->metadata['fallback_gateway_ids'] ?? [];
                $successFallback = false;

                foreach ($fallbackIds as $fallbackGatewayId) {
                    $fallbackGateway = \App\Models\Gateway::where('company_id', $integration->company_id)
                        ->where('id', $fallbackGatewayId)
                        ->where('status', 'active')
                        ->first();

                    if (!$fallbackGateway) continue;

                    $this->emitPaymentEvent([
                        'transaction_uuid' => $transaction->uuid,
                        'company_id'       => $integration->company_id,
                        'gateway_id'       => $fallbackGateway->id,
                        'gateway_type'     => $fallbackGateway->type,
                        'event_type'       => 'retry_gateway',
                        'status_normalized'=> $transaction->status,
                    ]);

                    $driver = $this->gatewayFactory->make($fallbackGateway->type);

                    try {
                        $gatewayResponse = match($billingType) {
                            'PIX' => $driver->chargeViaPix($gatewayInput, $customerId),
                            'BOLETO' => $driver->chargeViaBoleto($gatewayInput, $customerId),
                            default => $driver->charge($gatewayInput, $customerId),
                        };
                        
                        // Atualizar gateway da transação
                        $transaction->gateway_id = $fallbackGateway->id;
                        $transaction->save();
                        $integration->gateway_id = $fallbackGateway->id; // Para logs abaixo
                        
                        $successFallback = true;
                        break;
                    } catch (\Throwable $e2) {
                        \Illuminate\Support\Facades\Log::error('gateway.retry_failed', [
                            'tx'      => $transaction->uuid,
                            'gateway' => $fallbackGateway->type,
                            'error'   => $e2->getMessage(),
                        ]);
                    }
                }

                if (!$successFallback) {
                    throw $e;
                }
            }

            // Cria o registro de pagamento alinhado com o schema real
            $payment = Payment::create([
                'uuid' => Str::uuid(),
                'transaction_id' => $transaction->id,
                'gateway_id' => $integration->gateway_id,
                'gateway_transaction_id' => $gatewayResponse['gatewayId'],
                'amount' => $transaction->amount,
                'payment_method' => $data['payment_method'],
                'status' => PaymentStatusMapper::mapStatus($gatewayResponse['status']),
                'pix_qrcode' => $gatewayResponse['qrCodeBase64'] ?? null,
                'pix_expires_at' => $gatewayResponse['expiresAt'] ?? null,
                'boleto_url' => $gatewayResponse['bankSlipUrl'] ?? null,
                'boleto_barcode' => $gatewayResponse['barcode'] ?? null,
                'gateway_response' => $gatewayResponse['raw'] ?? [],
                'paid_at' => PaymentStatusMapper::isPaid($gatewayResponse['status']) ? now() : null,
            ]);

            // Atualiza a transação
            $transaction->update([
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'asaas_payment_id' => $payment->gateway_transaction_id
            ]);

            $this->emitPaymentEvent([
                'transaction_uuid' => $transaction->uuid,
                'company_id'       => $integration->company_id,
                'integration_id'   => $integration->id,
                'gateway_id'       => $integration->gateway_id,
                'gateway_type'     => $integration->gateway->type,
                'event_type'       => 'payment_status_update',
                'status_normalized'=> $payment->status,
                'payment_method'   => $payment->payment_method,
                'amount'           => $transaction->amount,
                'gateway_status'   => $gatewayResponse['status'] ?? null,
                'gateway_code'     => $gatewayResponse['errorCode'] ?? null,
            ]);

            return $payment->toArray();
        });
    }

    public function findByUuid(string $uuid, ?Integration $integration = null): ?Payment
    {
        $query = Payment::where('uuid', $uuid);
        if ($integration) {
            $query->where('gateway_id', $integration->gateway_id);
        }
        return $query->first();
    }

    public function getPixData(string $uuid, ?Integration $integration = null): ?array
    {
        $payment = $this->findByUuid($uuid, $integration);
        if (!$payment || $payment->payment_method !== 'pix') return null;

        return [
            'qrcode' => $payment->pix_qrcode,
            'expires_at' => $payment->pix_expires_at,
            'status' => $payment->status
        ];
    }

    public function getBoletoData(string $uuid, ?Integration $integration = null): ?array
    {
        $payment = $this->findByUuid($uuid, $integration);
        if (!$payment || $payment->payment_method !== 'boleto') return null;

        return [
            'url' => $payment->boleto_url,
            'barcode' => $payment->boleto_barcode,
            'status' => $payment->status
        ];
    }

    private function resolveGatewayCustomerId(Transaction $transaction, $gateway): string
    {
        // Se a transação já tem cliente no gateway, usa ele
        if ($transaction->customer_gateway_id) {
            return $transaction->customer_gateway_id;
        }

        // Caso contrário, cria um novo no gateway
        return $gateway->createCustomer([
            'name' => $transaction->customer_name,
            'email' => $transaction->customer_email,
            'document' => $transaction->customer_document,
            'phone' => $transaction->customer_phone,
        ]);
    }
}
