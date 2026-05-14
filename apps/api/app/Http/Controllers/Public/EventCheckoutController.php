<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Transaction;
use App\Services\CustomerService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EventCheckoutController extends Controller
{
    public function show(string $slug): mixed
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (! $event->isDisponivel()) {
            return view('checkout.evento.esgotado', compact('event'));
        }

        return view('checkout.evento.index', compact('event'));
    }

    public function process(Request $request, string $slug, CustomerService $customerService, PaymentService $paymentService): mixed
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        if (! $event->isDisponivel()) {
            return back()->withErrors(['error' => 'Este evento não está mais disponível.'])->withInput();
        }

        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email',
            'document'     => 'required|string|max:20',
            'phone'        => 'nullable|string|max:20',
            'billingtype'  => 'required|in:PIX,BOLETO,CREDITCARD',
        ]);

        // [BUG-04] company_id vem do evento, não de Company::first()
        $companyId = $event->company_id;

        $customer = $customerService->findOrCreate([
            'company_id' => $companyId,
            'name'       => $request->name,
            'email'      => $request->email,
            'document'   => preg_replace('/\D/', '', $request->document),
            'phone'      => $request->phone,
        ], $event->company);

        $transaction = Transaction::create([
            'uuid'              => (string) Str::uuid(),
            'company_id'        => $companyId, // ← do evento, nunca hardcoded
            'event_id'          => $event->id,
            'amount'            => $event->valor,
            'description'       => 'Ingresso: ' . $event->titulo,
            'status'            => 'pending',
            'payment_method'    => strtolower($request->billingtype),
            'customer_name'     => $request->name,
            'customer_email'    => $request->email,
            'customer_document' => preg_replace('/\D/', '', $request->document),
        ]);

        try {
            $payment = $paymentService->processPayment([
                'transaction_uuid' => $transaction->uuid,
                'billingtype'      => $request->billingtype,
                'amount'           => $event->valor,
                'customer'         => [
                    'name'     => $request->name,
                    'email'    => $request->email,
                    'document' => preg_replace('/\D/', '', $request->document),
                ],
            ]);

            $event->incrementarVaga();

            if ($request->billingtype === 'PIX' && isset($payment['pixQrCode'])) {
                return view('checkout.evento.pagamento', compact('event', 'payment', 'transaction') + ['billingtype' => $request->billingtype]);
            }

            if ($request->billingtype === 'BOLETO' && isset($payment['bankSlipUrl'])) {
                return view('checkout.evento.pagamento', compact('event', 'payment', 'transaction') + ['billingtype' => $request->billingtype]);
            }

            return redirect(route('evento.success', ['slug' => $slug]));
        } catch (\Throwable $e) {
            Log::error('EventCheckoutController: erro', ['error' => $e->getMessage(), 'slug' => $slug]);
            return back()->withErrors(['payment' => 'Erro ao processar pagamento.'])->withInput();
        }
    }

    public function success(string $slug): mixed
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        return view('checkout.card.front.sucesso', compact('event'));
    }
}