@extends('dashboard.layouts.app')
@section('title', '⚡ Checkouts')

@section('content')
<style>
.lab-container { padding: 32px; background: #0f0f1a; min-height: 100vh; color: #e2e8f0; font-family: 'Inter', sans-serif; }
.lab-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; }
.lab-header h1 { font-size: 26px; font-weight: 800; color: #e2e8f0; margin-bottom: 4px; }
.lab-header p { color: #64748b; font-size: 14px; margin: 0; }

.btn { border: none; border-radius: 10px; font-size: 14px; font-weight: 600; padding: 10px 22px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
.btn-primary { background: #7c3aed; color: #fff; }
.btn-primary:hover { background: #6d28d9; }
.btn-secondary { background: #1e1e3a; color: #94a3b8; border: 1px solid #2d2d5a; }
.btn-secondary:hover { background: #2d2d5a; color: #e2e8f0; }

.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.metric-card { background: #1e1e3a; border-radius: 14px; padding: 20px 24px; border: 1px solid #2d2d5a; }
.metric-lbl { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
.metric-val { font-size: 28px; font-weight: 800; margin: 4px 0 0; }

.filters { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
.search-input { background: #1e1e3a; border: 1px solid #2d2d5a; border-radius: 8px; padding: 9px 14px; color: #e2e8f0; font-size: 14px; outline: none; flex: 1; max-width: 320px; }

.checkout-card { background: #1e1e3a; border-radius: 14px; border: 1px solid #2d2d5a; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 12px; transition: all 0.2s; }
.checkout-card:hover { border-color: #3b82f6; }

.chk-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.chk-active { background: #10b981; }
.chk-inactive { background: #64748b; }

.chk-name { font-size: 16px; font-weight: 700; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chk-meta { margin: 0; font-size: 12px; color: #64748b; }

.chk-metric-group { display: flex; gap: 24px; flex-shrink: 0; }
.chk-m-val { margin: 0; font-size: 15px; font-weight: 700; color: #e2e8f0; text-align: center; }
.chk-m-lbl { margin: 0; font-size: 11px; color: #64748b; text-align: center; }

.chk-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-sm { font-size: 13px; padding: 8px 14px; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
.modal-overlay.open { display: flex; }
.modal { background: #0f0f1a; border: 1px solid #2d2d5a; border-radius: 20px; padding: 32px; width: 100%; max-width: 820px; max-height: 90vh; overflow: auto; }
.tpl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.tpl-card { background: #1e1e3a; border: 2px solid #2d2d5a; border-radius: 14px; padding: 24px; cursor: pointer; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: border-color 0.2s; }
.tpl-card:hover { border-color: #7c3aed; }
.tpl-tag { background: #2d2d5a; border-radius: 20px; padding: 3px 10px; font-size: 11px; color: #a78bfa; }
</style>

<div class="lab-container">
    @if(session('success'))
        <div style="background: #064e3b; color: #34d399; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #059669; font-size: 14px; font-weight: 600;">
            ✅ {{ session('success') }}
        </div>
    @endif

    <div class="lab-header">
        <div>
            <h1>⚡ Checkouts</h1>
            <p>{{ $configs->count() }} checkouts criados</p>
        </div>
        <div style="display: flex; gap: 10px;">
            <form method="POST" action="{{ route('dashboard.lab.checkout.create') }}">
                @csrf
                <button type="submit" class="btn btn-secondary">+ Em branco</button>
            </form>
            <button class="btn btn-primary" onclick="openTemplates()">🎨 Usar template</button>
        </div>
    </div>

    <!-- METRICS (Placeholder values for now) -->
    <div class="metrics-grid">
        <div class="metric-card">
            <p class="metric-lbl">Receita Total</p>
            <p class="metric-val" style="color:#10b981">R$ 0,00</p>
        </div>
        <div class="metric-card">
            <p class="metric-lbl">Pagamentos</p>
            <p class="metric-val" style="color:#6366f1">0</p>
        </div>
        <div class="metric-card">
            <p class="metric-lbl">Visitas</p>
            <p class="metric-val" style="color:#f59e0b">0</p>
        </div>
        <div class="metric-card">
            <p class="metric-lbl">Conversão Média</p>
            <p class="metric-val" style="color:#ec4899">0.0%</p>
        </div>
    </div>

    <!-- FILTERS -->
    <div class="filters">
        <input type="text" class="search-input" id="search" placeholder="🔍 Buscar checkout..." onkeyup="filterCheckouts()">
        <button class="btn btn-secondary active-filter" style="background:#2d2d5a;color:#e2e8f0;border-color:#7c3aed" onclick="setFilter('all', this)">Todos</button>
        <button class="btn btn-secondary" onclick="setFilter('active', this)">🟢 Ativos</button>
        <button class="btn btn-secondary" onclick="setFilter('inactive', this)">🔴 Inativos</button>
    </div>

    <!-- LIST -->
    @if($configs->isEmpty())
        <div style="text-align:center;padding:64px;color:#64748b">
            <p style="font-size:48px;margin:0">📋</p>
            <p style="font-size:18px;font-weight:600;margin:8px 0 4px">Nenhum checkout encontrado</p>
            <p style="font-size:14px;margin:0">Crie seu primeiro checkout usando um template</p>
        </div>
    @else
        <div id="checkoutList">
            @foreach($configs as $config)
            <div class="checkout-card" data-name="{{ strtolower($config->name) }}" data-status="{{ $config->is_active ? 'active' : 'inactive' }}">
                <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
                        <span class="chk-status {{ $config->is_active ? 'chk-active' : 'chk-inactive' }}"></span>
                        <span class="chk-name">{{ $config->name }}</span>
                    </div>
                    <p class="chk-meta">/ck/{{ $config->slug }} · Criado {{ $config->created_at->format('d/m/Y') }}</p>
                </div>

                <div class="chk-metric-group">
                    <div><p class="chk-m-val">0</p><p class="chk-m-lbl">Visitas</p></div>
                    <div><p class="chk-m-val">0</p><p class="chk-m-lbl">Pagamentos</p></div>
                    <div><p class="chk-m-val">0%</p><p class="chk-m-lbl">Conversão</p></div>
                    <div><p class="chk-m-val">R$ 0,00</p><p class="chk-m-lbl">Receita</p></div>
                </div>

                <div class="chk-actions">
                    <a href="{{ route('dashboard.lab.builder', $config->id) }}" class="btn btn-secondary btn-sm">✏️ Editar</a>
                    <a href="{{ route('checkout.builder.show', $config->slug) }}" target="_blank" class="btn btn-secondary btn-sm">👁 Ver</a>
                    <button onclick="togglePublish({{ $config->id }}, this)" class="btn btn-secondary btn-sm" style="color:{{ $config->is_active ? '#f87171' : '#4ade80' }};border-color:{{ $config->is_active ? '#7f1d1d' : '#14532d' }}">
                        {{ $config->is_active ? 'Pausar' : 'Publicar' }}
                    </button>
                    <form method="POST" action="{{ route('dashboard.lab.checkout.duplicate', $config->id) }}" style="display:inline">
                        @csrf
                        <button type="submit" class="btn btn-secondary btn-sm">📋 Duplicar</button>
                    </form>
                    <form method="POST" action="{{ route('dashboard.lab.checkout.destroy', $config->id) }}" style="display:inline" onsubmit="return confirm('Tem certeza? Esta ação não pode ser desfeita.')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-secondary btn-sm" style="color:#f87171;border-color:#7f1d1d">🗑</button>
                    </form>
                </div>
            </div>
            @endforeach
        </div>
    @endif
</div>

<!-- TEMPLATES MODAL -->
<div class="modal-overlay" id="tplModal" onclick="closeTemplates()">
    <div class="modal" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
            <h2 style="margin:0;font-size:20px;font-weight:700;color:#e2e8f0">🎨 Escolha um template</h2>
            <button onclick="closeTemplates()" style="background:none;border:none;color:#64748b;font-size:22px;cursor:pointer">✕</button>
        </div>

        <div class="tpl-grid">
            <form method="POST" action="{{ route('dashboard.lab.checkout.create') }}">
                @csrf
                <button type="submit" class="tpl-card" style="border-style:dashed;background:#1e1e3a;width:100%;height:100%">
                    <span style="font-size:40px">➕</span>
                    <p style="margin:0;font-weight:700;color:#e2e8f0;font-size:15px">Em branco</p>
                    <p style="margin:0;font-size:12px;color:#64748b">Canvas vazio para criar do zero</p>
                </button>
            </form>

            <form method="POST" action="{{ route('dashboard.lab.checkout.template') }}" id="formTpl1">
                @csrf
                <input type="hidden" name="template_name" value="Pix Simples">
                <input type="hidden" name="config" id="cfgTpl1">
                <input type="hidden" name="canvas_elements" id="elTpl1">
                <div class="tpl-card" onclick="document.getElementById('formTpl1').submit()">
                    <span style="font-size:40px">⚡</span>
                    <p style="margin:0;font-weight:700;color:#e2e8f0;font-size:15px">Pix Simples</p>
                    <p style="margin:0;font-size:12px;color:#64748b">Checkout minimalista focado em Pix. Alta conversão.</p>
                    <span class="tpl-tag">pix</span>
                </div>
            </form>

            <form method="POST" action="{{ route('dashboard.lab.checkout.template') }}" id="formTpl2">
                @csrf
                <input type="hidden" name="template_name" value="Cartão Premium">
                <input type="hidden" name="config" id="cfgTpl2">
                <input type="hidden" name="canvas_elements" id="elTpl2">
                <div class="tpl-card" onclick="document.getElementById('formTpl2').submit()">
                    <span style="font-size:40px">💳</span>
                    <p style="margin:0;font-weight:700;color:#e2e8f0;font-size:15px">Cartão Premium</p>
                    <p style="margin:0;font-size:12px;color:#64748b">Design premium dark com foco em cartão de crédito.</p>
                    <span class="tpl-tag">cartao</span>
                </div>
            </form>

            <form method="POST" action="{{ route('dashboard.lab.checkout.template') }}" id="formTpl3">
                @csrf
                <input type="hidden" name="template_name" value="Completo">
                <input type="hidden" name="config" id="cfgTpl3">
                <input type="hidden" name="canvas_elements" id="elTpl3">
                <div class="tpl-card" onclick="document.getElementById('formTpl3').submit()">
                    <span style="font-size:40px">⬛</span>
                    <p style="margin:0;font-weight:700;color:#e2e8f0;font-size:15px">Completo</p>
                    <p style="margin:0;font-size:12px;color:#64748b">Pix e cartão com seletor de método. Layout equilibrado.</p>
                    <span class="tpl-tag">completo</span>
                </div>
            </form>

            <form method="POST" action="{{ route('dashboard.lab.checkout.template') }}" id="formTpl4">
                @csrf
                <input type="hidden" name="template_name" value="Minimalista">
                <input type="hidden" name="config" id="cfgTpl4">
                <input type="hidden" name="canvas_elements" id="elTpl4">
                <div class="tpl-card" onclick="document.getElementById('formTpl4').submit()">
                    <span style="font-size:40px">◻️</span>
                    <p style="margin:0;font-weight:700;color:#e2e8f0;font-size:15px">Minimalista</p>
                    <p style="margin:0;font-size:12px;color:#64748b">Ultra limpo, sem distrações. Máxima simplicidade.</p>
                    <span class="tpl-tag">simples</span>
                </div>
            </form>

            <form method="POST" action="{{ route('dashboard.lab.checkout.template') }}" id="formTpl5">
                @csrf
                <input type="hidden" name="template_name" value="Corporativo">
                <input type="hidden" name="config" id="cfgTpl5">
                <input type="hidden" name="canvas_elements" id="elTpl5">
                <div class="tpl-card" onclick="document.getElementById('formTpl5').submit()">
                    <span style="font-size:40px">🏢</span>
                    <p style="margin:0;font-weight:700;color:#e2e8f0;font-size:15px">Corporativo</p>
                    <p style="margin:0;font-size:12px;color:#64748b">Sóbrio e profissional. Ideal para B2B e serviços.</p>
                    <span class="tpl-tag">premium</span>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
// JSON DOS TEMPLATES
const TPL = [
  // 1: Pix Simples
  {
    cfg: {primary_color:"#10b981",background_color:"#ffffff",container_max_width:"520",title:"Finalize seu pagamento"},
    els: [
      { id:"t1_bg", type:"rect", x:0, y:0, width:520, height:900, rotation:0, props:{backgroundColor:"#ffffff"} },
      { id:"t1_ttl", type:"text", x:32, y:32, width:456, height:40, rotation:0, props:{text:"Finalize seu pagamento", color:"#1e293b", fontSize:24, fontWeight:"700"} },
      { id:"t1_sub", type:"text", x:32, y:78, width:456, height:28, rotation:0, props:{text:"Preencha os dados e pague via Pix", color:"#64748b", fontSize:14} },
      { id:"t1_n", type:"input", x:32, y:132, width:456, height:48, rotation:0, props:{placeholder:"Nome completo", backgroundColor:"#f8fafc", borderColor:"#e2e8f0", borderWidth:1, borderRadius:8, fontSize:14} },
      { id:"t1_e", type:"input", x:32, y:192, width:456, height:48, rotation:0, props:{placeholder:"E-mail", backgroundColor:"#f8fafc", borderColor:"#e2e8f0", borderWidth:1, borderRadius:8, fontSize:14} },
      { id:"t1_c", type:"input", x:32, y:252, width:456, height:48, rotation:0, props:{placeholder:"CPF / CNPJ", backgroundColor:"#f8fafc", borderColor:"#e2e8f0", borderWidth:1, borderRadius:8, fontSize:14} },
      { id:"t1_pix", type:"pix", x:32, y:320, width:456, height:340, rotation:0, props:{backgroundColor:"#f0fdf4", borderRadius:12, borderWidth:1, borderColor:"#bbf7d0"} },
      { id:"t1_btn", type:"button", x:32, y:676, width:456, height:52, rotation:0, props:{text:"Pagar com Pix", backgroundColor:"#10b981", color:"#ffffff", fontSize:16, fontWeight:"700", borderRadius:10} }
    ]
  },
  // 2: Cartão Premium
  {
    cfg: {primary_color:"#7c3aed",background_color:"#0f0f1a",container_max_width:"560",title:"Acesso Premium"},
    els: [
      { id:"t2_bg", type:"rect", x:0, y:0, width:560, height:920, rotation:0, props:{backgroundColor:"#0f0f1a"} },
      { id:"t2_card", type:"rect", x:20, y:20, width:520, height:880, rotation:0, props:{backgroundColor:"#1e1e3a", borderRadius:20, borderWidth:1, borderColor:"#2d2d5a"} },
      { id:"t2_ttl", type:"text", x:40, y:54, width:400, height:36, rotation:0, props:{text:"Acesso Premium", color:"#e2e8f0", fontSize:22, fontWeight:"700"} },
      { id:"t2_n", type:"input", x:40, y:120, width:480, height:48, rotation:0, props:{placeholder:"Nome completo", backgroundColor:"#2d2d5a", borderColor:"#3d3d7a", borderWidth:1, borderRadius:10, color:"#e2e8f0"} },
      { id:"t2_e", type:"input", x:40, y:180, width:480, height:48, rotation:0, props:{placeholder:"E-mail", backgroundColor:"#2d2d5a", borderColor:"#3d3d7a", borderWidth:1, borderRadius:10, color:"#e2e8f0"} },
      { id:"t2_cf", type:"card-form", x:40, y:244, width:480, height:380, rotation:0, props:{backgroundColor:"#2d2d5a", borderRadius:14, borderWidth:1, borderColor:"#3d3d7a"} },
      { id:"t2_btn", type:"button", x:40, y:640, width:480, height:56, rotation:0, props:{text:"Garantir acesso agora", backgroundColor:"#7c3aed", color:"#ffffff", fontSize:16, fontWeight:"700", borderRadius:12} }
    ]
  },
  // 3: Completo
  {
    cfg: {primary_color:"#6366f1",background_color:"#ffffff",container_max_width:"600",title:"Finalize sua compra"},
    els: [
      { id:"t3_bg", type:"rect", x:0, y:0, width:600, height:960, rotation:0, props:{backgroundColor:"#f8fafc"} },
      { id:"t3_card", type:"rect", x:24, y:24, width:552, height:912, rotation:0, props:{backgroundColor:"#ffffff", borderRadius:16, borderWidth:1, borderColor:"#e2e8f0", shadow:true} },
      { id:"t3_ttl", type:"text", x:48, y:48, width:400, height:36, rotation:0, props:{text:"Finalize sua compra", color:"#1e293b", fontSize:22, fontWeight:"700"} },
      { id:"t3_n", type:"input", x:48, y:100, width:504, height:48, rotation:0, props:{placeholder:"Nome completo", backgroundColor:"#f8fafc", borderColor:"#e2e8f0", borderWidth:1, borderRadius:8} },
      { id:"t3_e", type:"input", x:48, y:160, width:504, height:48, rotation:0, props:{placeholder:"E-mail", backgroundColor:"#f8fafc", borderColor:"#e2e8f0", borderWidth:1, borderRadius:8} },
      { id:"t3_pix", type:"pix", x:48, y:220, width:504, height:300, rotation:0, props:{backgroundColor:"#f0fdf4", borderRadius:12, borderWidth:1, borderColor:"#bbf7d0"} },
      { id:"t3_cf", type:"card-form", x:48, y:540, width:504, height:360, rotation:0, props:{backgroundColor:"#ffffff", borderRadius:12, borderWidth:1, borderColor:"#e2e8f0"} },
      { id:"t3_btn", type:"button", x:48, y:920, width:504, height:52, rotation:0, props:{text:"Pagar agora", backgroundColor:"#6366f1", color:"#ffffff", fontSize:16, fontWeight:"700", borderRadius:10} }
    ]
  },
  // 4: Minimalista
  {
    cfg: {primary_color:"#0f172a",background_color:"#ffffff",container_max_width:"480",title:"Pagamento"},
    els: [
      { id:"t4_ttl", type:"text", x:0, y:0, width:480, height:44, rotation:0, props:{text:"Pagamento", color:"#0f172a", fontSize:28, fontWeight:"700"} },
      { id:"t4_div", type:"rect", x:0, y:52, width:480, height:2, rotation:0, props:{backgroundColor:"#0f172a"} },
      { id:"t4_n", type:"input", x:0, y:72, width:480, height:48, rotation:0, props:{placeholder:"Nome", backgroundColor:"#ffffff", borderColor:"#0f172a", borderWidth:1, borderRadius:4} },
      { id:"t4_e", type:"input", x:0, y:132, width:480, height:48, rotation:0, props:{placeholder:"E-mail", backgroundColor:"#ffffff", borderColor:"#0f172a", borderWidth:1, borderRadius:4} },
      { id:"t4_cf", type:"card-form", x:0, y:192, width:480, height:360, rotation:0, props:{backgroundColor:"#ffffff", borderRadius:4, borderWidth:1, borderColor:"#0f172a"} },
      { id:"t4_btn", type:"button", x:0, y:568, width:480, height:52, rotation:0, props:{text:"Confirmar pagamento", backgroundColor:"#0f172a", color:"#ffffff", fontSize:15, fontWeight:"700", borderRadius:4} }
    ]
  },
  // 5: Corporativo
  {
    cfg: {primary_color:"#1d4ed8",background_color:"#eff6ff",container_max_width:"580",title:"Contratação de Serviço"},
    els: [
      { id:"t5_bg", type:"rect", x:0, y:0, width:580, height:940, rotation:0, props:{backgroundColor:"#eff6ff"} },
      { id:"t5_top", type:"rect", x:0, y:0, width:580, height:80, rotation:0, props:{backgroundColor:"#1d4ed8", borderRadius:0} },
      { id:"t5_ttl", type:"text", x:24, y:22, width:400, height:36, rotation:0, props:{text:"Contratação de Serviço", color:"#ffffff", fontSize:20, fontWeight:"700"} },
      { id:"t5_card", type:"rect", x:20, y:104, width:540, height:800, rotation:0, props:{backgroundColor:"#ffffff", borderRadius:12, borderWidth:1, borderColor:"#bfdbfe", shadow:true} },
      { id:"t5_n", type:"input", x:40, y:128, width:500, height:48, rotation:0, props:{placeholder:"Razão social ou nome", backgroundColor:"#f0f9ff", borderColor:"#bfdbfe", borderWidth:1, borderRadius:8} },
      { id:"t5_cf", type:"card-form", x:40, y:188, width:500, height:380, rotation:0, props:{backgroundColor:"#f0f9ff", borderRadius:10, borderWidth:1, borderColor:"#bfdbfe"} },
      { id:"t5_btn", type:"button", x:40, y:588, width:500, height:52, rotation:0, props:{text:"Contratar agora", backgroundColor:"#1d4ed8", color:"#ffffff", fontSize:16, fontWeight:"700", borderRadius:8} }
    ]
  }
];

// Preenche os forms invisíveis
for(let i=1; i<=5; i++){
  document.getElementById('cfgTpl'+i).value = JSON.stringify(TPL[i-1].cfg);
  document.getElementById('elTpl'+i).value = JSON.stringify(TPL[i-1].els);
}

function openTemplates() { document.getElementById('tplModal').classList.add('open'); }
function closeTemplates() { document.getElementById('tplModal').classList.remove('open'); }

// FILTROS
let currentFilter = 'all';

function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filters .btn-secondary:not(.search-input)').forEach(b => {
    b.style.background = '#1e1e3a'; b.style.color = '#64748b'; b.style.borderColor = '#2d2d5a';
  });
  btn.style.background = '#2d2d5a'; btn.style.color = '#e2e8f0'; btn.style.borderColor = '#7c3aed';
  filterCheckouts();
}

function filterCheckouts() {
  const search = document.getElementById('search').value.toLowerCase();
  document.querySelectorAll('.checkout-card').forEach(card => {
    const name = card.dataset.name;
    const status = card.dataset.status;
    const matchSearch = name.includes(search);
    const matchFilter = currentFilter === 'all' || currentFilter === status;
    card.style.display = matchSearch && matchFilter ? 'flex' : 'none';
  });
}

// TOGGLE PUBLISH (AJAX)
async function togglePublish(id, btn) {
  try {
    const res = await fetch(`/dashboard/lab/api/${id}/publish`, {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}' }
    });
    const data = await res.json();
    
    // Atualiza botão
    btn.textContent = data.is_active ? 'Pausar' : 'Publicar';
    btn.style.color = data.is_active ? '#f87171' : '#4ade80';
    btn.style.borderColor = data.is_active ? '#7f1d1d' : '#14532d';

    // Atualiza badge status
    const card = btn.closest('.checkout-card');
    card.dataset.status = data.is_active ? 'active' : 'inactive';
    const indicator = card.querySelector('.chk-status');
    indicator.className = `chk-status ${data.is_active ? 'chk-active' : 'chk-inactive'}`;
  } catch (e) {
    alert('Erro ao publicar checkout');
  }
}
</script>
@endsection