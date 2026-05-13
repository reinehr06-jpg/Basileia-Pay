<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>{{ $config->name }} — Checkout</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8fafc;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.ck-frame{position:relative;margin:0 auto;overflow:hidden}
.ck-input{width:100%;padding:11px 14px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;font-size:14px;color:#1e293b;outline:none;box-sizing:border-box;font-family:'Inter',sans-serif}
.ck-input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
.ck-btn{width:100%;padding:13px;border-radius:10px;border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .2s}
.ck-btn:hover{opacity:.9}
.ck-btn:disabled{opacity:.5;cursor:not-allowed}
.ck-error{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;color:#dc2626;font-size:13px;margin-bottom:16px}
.ck-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;opacity:0;transition:opacity .3s;z-index:999}
.ck-toast.show{opacity:1}
.ck-success{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.ck-success .card{background:#fff;border-radius:16px;padding:40px;max-width:480px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)}
</style>
</head>
<body>

<div id="app"></div>
<div class="ck-toast" id="toast"></div>

<script>
const CONFIG = @json($config->config ?? []);
const ELEMENTS = @json($config->canvas_elements ?? []);
const SLUG = @json($config->slug);
const CSRF = document.querySelector('meta[name=csrf-token]').content;
const BTN_COLOR = CONFIG.primary_color || '#7c3aed';
const VALUE = Number(CONFIG.value || 97);
const MAX_INSTALLMENTS = Number(CONFIG.card_installments || 12);

let step = 'form'; // form | pix | success
let method = 'pix';
let loading = false;
let error = '';
let pixData = null;

function render() {
  const app = document.getElementById('app');
  if (step === 'success') { renderSuccess(app); return; }
  if (step === 'pix') { renderPix(app); return; }
  renderForm(app);
}

function renderForm(app) {
  const hasPix = ELEMENTS.some(e => e.type === 'pix');
  const hasCard = ELEMENTS.some(e => e.type === 'card-form');

  let h = `<div style="background:#fff;border-radius:16px;padding:32px;max-width:600px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08)">`;
  h += `<h1 style="font-size:22px;font-weight:700;color:#1e293b;margin-bottom:8px">${esc(CONFIG.title || 'Finalize seu pagamento')}</h1>`;
  h += `<p style="color:#64748b;font-size:14px;margin-bottom:24px">Preencha os dados abaixo</p>`;

  // Customer fields
  h += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">`;
  h += `<p style="margin:0;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px">Seus dados</p>`;
  h += `<input class="ck-input" id="fName" placeholder="Nome completo">`;
  h += `<input class="ck-input" id="fEmail" placeholder="E-mail" type="email">`;
  h += `<div style="display:flex;gap:12px"><input class="ck-input" id="fCpf" placeholder="CPF / CNPJ" style="flex:1"><input class="ck-input" id="fPhone" placeholder="Telefone" style="flex:1"></div>`;
  h += `<input class="ck-input" id="fCep" placeholder="CEP">`;
  h += `</div>`;

  // Method selector
  if (hasPix && hasCard) {
    h += `<div style="display:flex;gap:0;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:24px">`;
    h += `<button onclick="method='pix';render()" style="flex:1;padding:12px 0;border:none;cursor:pointer;background:${method==='pix'?BTN_COLOR:'#f8fafc'};color:${method==='pix'?'#fff':'#64748b'};font-size:14px;font-weight:600">⚡ Pix</button>`;
    h += `<button onclick="method='card';render()" style="flex:1;padding:12px 0;border:none;cursor:pointer;background:${method==='card'?BTN_COLOR:'#f8fafc'};color:${method==='card'?'#fff':'#64748b'};font-size:14px;font-weight:600">💳 Cartão</button>`;
    h += `</div>`;
  } else if (hasCard) { method = 'card'; }

  // Card fields
  if (method === 'card') {
    h += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">`;
    h += `<p style="margin:0;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px">Dados do cartão</p>`;
    h += `<input class="ck-input" id="cNum" placeholder="Número do cartão" maxlength="19">`;
    h += `<input class="ck-input" id="cName" placeholder="Nome no cartão">`;
    h += `<div style="display:flex;gap:12px"><input class="ck-input" id="cExp" placeholder="MM/AA" maxlength="5" style="flex:1"><input class="ck-input" id="cCvv" placeholder="CVV" type="password" maxlength="4" style="flex:1"></div>`;
    if (MAX_INSTALLMENTS > 1) {
      let opts = '';
      for (let i = 1; i <= MAX_INSTALLMENTS; i++) {
        const v = (VALUE / i).toFixed(2).replace('.', ',');
        opts += `<option value="${i}">${i}x de R$ ${v}${i === 1 ? ' (à vista)' : ''}</option>`;
      }
      h += `<select class="ck-input" id="cInst">${opts}</select>`;
    }
    h += `</div>`;
  }

  // Pix info
  if (method === 'pix') {
    h += `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:24px">`;
    h += `<p style="margin:0;color:#15803d;font-size:14px;font-weight:600">⚡ Pague R$ ${VALUE.toFixed(2).replace('.', ',')} via Pix</p>`;
    h += `<p style="margin:4px 0 0;color:#4ade80;font-size:13px">QR Code gerado após confirmar</p></div>`;
  }

  if (error) h += `<div class="ck-error">⚠️ ${esc(error)}</div>`;

  h += `<button class="ck-btn" style="background:${loading?'#94a3b8':BTN_COLOR}" onclick="handlePay()" ${loading?'disabled':''}>${loading?'⏳ Processando...':'🔒 Pagar R$ '+VALUE.toFixed(2).replace('.',',')}</button>`;
  h += `<p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">🔒 Pagamento 100% seguro · Processado pelo Asaas</p>`;
  h += `</div>`;
  app.innerHTML = h;
}

function renderPix(app) {
  app.innerHTML = `<div style="background:#fff;border-radius:16px;padding:40px;max-width:480px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <p style="font-size:32px;margin:0">⚡</p>
    <h2 style="font-size:22px;font-weight:700;color:#1e293b;margin:12px 0 4px">Pague com Pix</h2>
    <p style="color:#64748b;font-size:14px;margin-bottom:24px">Escaneie o QR code ou copie o código</p>
    <img src="data:image/png;base64,${pixData.qrCode}" width="200" height="200" style="border-radius:12px;margin-bottom:20px">
    <button class="ck-btn" style="background:${BTN_COLOR}" onclick="copyPix()">📋 Copiar código Pix</button>
    <p style="font-size:12px;color:#94a3b8;margin-top:16px">⏱ Confirmação automática após pagamento</p>
  </div>`;
}

function renderSuccess(app) {
  app.innerHTML = `<div class="ck-success"><div class="card">
    <p style="font-size:48px;margin:0">✅</p>
    <h2 style="font-size:24px;font-weight:700;color:#1e293b;margin:16px 0 8px">Pagamento confirmado!</h2>
    <p style="color:#64748b;font-size:15px;margin-bottom:32px">Seu pagamento foi processado com sucesso.</p>
  </div></div>`;
}

async function handlePay() {
  error = '';
  const name = document.getElementById('fName')?.value || '';
  const email = document.getElementById('fEmail')?.value || '';
  const cpf = document.getElementById('fCpf')?.value || '';
  const phone = document.getElementById('fPhone')?.value || '';
  const cep = document.getElementById('fCep')?.value || '';
  if (!name || !email || !cpf) { error = 'Preencha nome, e-mail e CPF'; render(); return; }

  loading = true; render();
  try {
    const body = { method, value: VALUE, description: CONFIG.title || 'Pagamento',
      customer: { name, email, cpfCnpj: cpf, phone, postalCode: cep } };
    if (method === 'card') {
      const num = document.getElementById('cNum')?.value || '';
      const cn = document.getElementById('cName')?.value || '';
      const exp = document.getElementById('cExp')?.value || '';
      const cvv = document.getElementById('cCvv')?.value || '';
      const inst = document.getElementById('cInst')?.value || '1';
      const [em, ey] = exp.split('/');
      body.card = { holderName: cn, number: num.replace(/\s/g,''), expiryMonth: em, expiryYear: '20'+(ey||''), ccv: cvv };
      body.installments = +inst;
    }
    const res = await fetch('/api/v1/payments/receive', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { error = data.error || data.message || 'Erro ao processar'; loading = false; render(); return; }
    if (method === 'pix' && data.qrCode) { pixData = data; step = 'pix'; }
    else { step = 'success'; }
  } catch (e) { error = 'Erro de conexão'; }
  loading = false; render();
}

function copyPix() {
  if (pixData?.pixCopyPaste) {
    navigator.clipboard.writeText(pixData.pixCopyPaste);
    const t = document.getElementById('toast'); t.textContent = '✅ Código copiado!'; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }
}

function esc(s) { return (s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

render();
</script>
</body>
</html>
