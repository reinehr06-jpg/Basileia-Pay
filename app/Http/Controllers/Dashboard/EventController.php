<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\Gateway\GatewayFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::where('company_id', Auth::user()->company_id)
            ->orderByDesc('created_at')
            ->paginate(15);

        return view('dashboard.events.index', compact('events'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string|max:1000',
            'valor' => 'required|numeric|min:0.01',
            'vagas_total' => 'required|integer|min:1|max:10000',
            'whatsapp_vendedor' => 'required|string|max:20',
            'metodo_pagamento' => 'required|in:pix,boleto,credit_card,all',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date|after_or_equal:data_inicio',
        ]);

        $event = Event::create([
            'company_id' => Auth::user()->company_id,
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'valor' => $request->valor,
            'moeda' => 'BRL',
            'vagas_total' => $request->vagas_total,
            'whatsapp_vendedor' => preg_replace('/\D/', '', $request->whatsapp_vendedor),
            'metodo_pagamento' => $request->metodo_pagamento,
            'data_inicio' => $request->data_inicio,
            'data_fim' => $request->data_fim,
            'status' => 'ativo',
        ]);

        $link = url("/evento/{$event->slug}");

        return redirect()->route('dashboard.events.index')
            ->with('success', "Evento criado! Link: {$link}");
    }

    public function toggle(Event $event)
    {
        $this->authorizeCompany($event);

        if ($event->status === 'ativo') {
            $event->update(['status' => 'expirado']);
        } elseif ($event->status === 'expirado' && $event->vagasRestantes() > 0) {
            $event->update(['status' => 'ativo']);
        }

        return redirect()->route('dashboard.events.index')->with('success', 'Status atualizado.');
    }

    public function destroy(Event $event)
    {
        $this->authorizeCompany($event);
        $event->delete();

        return redirect()->route('dashboard.events.index')->with('success', 'Evento removido.');
    }

    private function authorizeCompany(Event $event): void
    {
        if ($event->company_id !== Auth::user()->company_id) {
            abort(403);
        }
    }
}
