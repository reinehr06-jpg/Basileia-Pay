<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>⚡ Builder — {{ $config->name }}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0f0f1a;color:#e2e8f0;overflow:hidden;height:100vh;display:flex;flex-direction:column}

/* TOOLBAR */
.toolbar{height:52px;background:#0f0f1a;border-bottom:1px solid #1e1e3a;display:flex;align-items:center;padding:0 16px;gap:12px;flex-shrink:0}
.toolbar .brand{color:#7c3aed;font-weight:700;font-size:15px;margin-right:16px}
.toolbar .name{color:#94a3b8;font-size:13px}
.toolbar .spacer{flex:1}
.tb{background:#2d2d5a;border:none;border-radius:6px;color:#e2e8f0;font-size:13px;padding:6px 14px;cursor:pointer}
.tb:disabled{background:#1e1e3a;color:#475569;cursor:not-allowed}
.tb.save{background:#7c3aed;color:#fff;font-weight:600;padding:8px 20px;border-radius:8px}
.tb.clone{background:#1e1e3a;border:1px solid #2d2d5a;color:#a78bfa;font-weight:600;padding:8px 16px;border-radius:8px}
.tb.clone:hover{background:#2d2d5a}
.tb.back{background:#1e1e3a;color:#94a3b8;text-decoration:none;display:inline-flex;align-items:center;gap:4px}

/* CLONE MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;z-index:1000}
.modal-overlay.open{display:flex}
.modal{background:#0f0f1a;border:1px solid #2d2d5a;border-radius:16px;padding:32px;width:520px;max-width:90vw;display:flex;flex-direction:column;gap:20px}
.modal h2{color:#e2e8f0;font-size:18px;font-weight:700;margin:0}
.modal .desc{color:#64748b;font-size:13px;margin:0}
.modal .tabs{display:flex;gap:8px}
.modal .tab{background:#1e1e3a;border:none;border-radius:8px;color:#e2e8f0;font-size:14px;padding:10px 20px;cursor:pointer}
.modal .tab.active{background:#7c3aed}
.modal .mfin{background:#1e1e3a;border:1px solid #2d2d5a;border-radius:8px;padding:10px 14px;color:#e2e8f0;font-size:14px;width:100%}
.modal .upload-zone{background:#1e1e3a;border:2px dashed #2d2d5a;border-radius:8px;padding:24px;text-align:center;color:#64748b;cursor:pointer;font-size:14px}
.modal .upload-zone:hover{border-color:#7c3aed}
.modal .error{background:#450a0a;border:1px solid #7f1d1d;border-radius:8px;padding:10px 14px;color:#f87171;font-size:13px}
.modal .preview{background:#1e1e3a;border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:8px}
.modal .preview .ok{color:#10b981;font-size:13px;font-weight:600;margin:0}
.modal .preview .tags{display:flex;flex-wrap:wrap;gap:6px}
.modal .preview .tag{background:#2d2d5a;border-radius:20px;padding:3px 10px;font-size:12px;color:#a78bfa}
.modal .preview .meta{color:#64748b;font-size:12px;margin:0}
.modal .actions{display:flex;gap:12px;justify-content:flex-end}
.modal .mbtn{border:none;border-radius:8px;font-size:14px;padding:10px 20px;cursor:pointer}
.modal .mbtn.primary{background:#7c3aed;color:#fff;font-weight:600}
.modal .mbtn.primary:disabled{background:#4c1d95;opacity:.6;cursor:not-allowed}
.modal .mbtn.secondary{background:#1e1e3a;color:#e2e8f0}
.zoom-val{color:#e2e8f0;font-size:13px;min-width:40px;text-align:center}

/* LAYOUT */
.main{display:flex;flex:1;min-height:0}

/* LEFT PANEL */
.left{width:200px;background:#0f0f1a;border-right:1px solid #1e1e3a;display:flex;flex-direction:column;gap:4px;padding:12px;overflow-y:auto;flex-shrink:0}
.left .sec{color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.el-btn{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#1e1e3a;border:none;border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;text-align:left;width:100%;transition:background .15s}
.el-btn:hover{background:#2d2d5a}
.el-btn .icon{font-size:18px;width:24px;text-align:center}

/* CANVAS AREA */
.canvas-area{overflow:auto;flex:1;background:#1e1e2e;display:flex;align-items:center;justify-content:center;min-height:0}
.canvas{position:relative;background:#fff;box-shadow:0 8px 48px rgba(0,0,0,.4);flex-shrink:0;cursor:default}

/* ELEMENT */
.cel{position:absolute;cursor:grab;user-select:none}
.cel.selected{outline:2px solid #3b82f6}
.cel .content{width:100%;height:100%;pointer-events:none}

/* RESIZE HANDLES */
.rh{position:absolute;width:10px;height:10px;background:#fff;border:2px solid #3b82f6;border-radius:2px;z-index:10}

/* RIGHT PANEL */
.right{width:240px;background:#0f0f1a;border-left:1px solid #1e1e3a;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px;flex-shrink:0}
.right .empty{color:#64748b;font-size:13px;text-align:center;margin-top:40px}
.right .hdr{display:flex;justify-content:space-between;align-items:center}
.right .type{color:#e2e8f0;font-weight:600;font-size:14px}
.del-btn{background:#450a0a;border:none;border-radius:6px;color:#f87171;font-size:12px;padding:4px 10px;cursor:pointer}
.field{display:flex;flex-direction:column;gap:4px}
.field label{font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.fin{background:#1e1e3a;border:1px solid #2d2d5a;border-radius:6px;padding:6px 10px;color:#e2e8f0;font-size:13px;width:100%}
.fin[type=color]{padding:2px;height:36px}
.row2{display:flex;gap:8px}
.row2 .fin{flex:1}

/* TOAST */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;opacity:0;transition:opacity .3s;pointer-events:none;z-index:999}
.toast.show{opacity:1}
</style>
</head>
<body>

<!-- TOOLBAR -->
<div class="toolbar">
  <a href="{{ route('dashboard.lab') }}" class="tb back">← Voltar</a>
  <span class="brand">⚡ Builder</span>
  <span class="name" id="ckName">{{ $config->name }}</span>
  <div class="spacer"></div>
  <button class="tb" id="undoBtn" disabled onclick="undo()">↩ Undo</button>
  <button class="tb" id="redoBtn" disabled onclick="redo()">↪ Redo</button>
  <button class="tb" onclick="zoomBy(-10)">−</button>
  <span class="zoom-val" id="zoomVal">80%</span>
  <button class="tb" onclick="zoomBy(10)">+</button>
  <button class="tb clone" onclick="openCloneModal()">🤖 Clonar com IA</button>
  <button class="tb save" onclick="saveCanvas()">💾 Salvar</button>
</div>

<!-- MAIN -->
<div class="main">
  <!-- LEFT -->
  <div class="left">
    <p class="sec">Elementos</p>
    <button class="el-btn" onclick="addEl('text')"><span class="icon">T</span>Texto</button>
    <button class="el-btn" onclick="addEl('rect')"><span class="icon">▬</span>Retângulo</button>
    <button class="el-btn" onclick="addEl('circle')"><span class="icon">●</span>Círculo</button>
    <button class="el-btn" onclick="addEl('button')"><span class="icon">⬛</span>Botão</button>
    <button class="el-btn" onclick="addEl('input')"><span class="icon">▭</span>Campo</button>
    <button class="el-btn" onclick="addEl('image')"><span class="icon">🖼</span>Imagem</button>
    <button class="el-btn" onclick="addEl('pix')"><span class="icon">⚡</span>Bloco Pix</button>
    <button class="el-btn" onclick="addEl('card-form')"><span class="icon">💳</span>Bloco Cartão</button>
  </div>

  <!-- CANVAS -->
  <div class="canvas-area" id="canvasArea">
    <div class="canvas" id="canvas" style="width:600px;height:900px"></div>
  </div>

  <!-- RIGHT -->
  <div class="right" id="rightPanel">
    <p class="empty">Selecione um elemento</p>
  </div>
</div>

<!-- CLONE MODAL -->
<div class="modal-overlay" id="cloneModal">
  <div class="modal" onclick="event.stopPropagation()">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h2>🤖 Clonar com IA</h2>
      <button onclick="closeCloneModal()" style="background:none;border:none;color:#64748b;font-size:20px;cursor:pointer">✕</button>
    </div>
    <p class="desc">Cole uma URL ou envie uma imagem — a IA analisa e replica o layout no canvas.</p>
    <div class="tabs">
      <button class="tab active" id="tabUrl" onclick="setCloneTab('url')">🔗 URL</button>
      <button class="tab" id="tabImg" onclick="setCloneTab('image')">🖼 Imagem</button>
    </div>
    <div id="cloneInputArea">
      <input class="mfin" type="url" id="cloneUrl" placeholder="https://checkout.exemplo.com/pagamento">
    </div>
    <div id="cloneError" style="display:none" class="error"></div>
    <div id="clonePreview" style="display:none" class="preview"></div>
    <div class="actions">
      <button class="mbtn secondary" onclick="closeCloneModal()">Cancelar</button>
      <button class="mbtn primary" id="cloneActionBtn" onclick="handleClone()">🤖 Analisar com IA</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
// ─── STATE ───
const CONFIG_ID = {{ $config->id }};
const API_URL   = '/dashboard/lab/api/' + CONFIG_ID;
const CSRF      = document.querySelector('meta[name=csrf-token]').content;

let elements   = [];
let selectedIds = [];
let zoom       = 80;
let history    = [[]];
let histIdx    = 0;

// ─── ELEMENT FACTORY ───
function uid(){return 'el_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)}
const DEFAULTS = {
  text:      {w:200,h:40,  props:{text:'Texto aqui',color:'#1e293b',fontSize:16,fontWeight:'400'}},
  rect:      {w:200,h:100, props:{backgroundColor:'#7c3aed',borderRadius:8}},
  circle:    {w:100,h:100, props:{backgroundColor:'#7c3aed',borderRadius:50}},
  button:    {w:200,h:48,  props:{text:'Pagar agora',backgroundColor:'#7c3aed',color:'#ffffff',fontSize:16,fontWeight:'600',borderRadius:8}},
  input:     {w:300,h:48,  props:{placeholder:'Digite aqui...',backgroundColor:'#ffffff',borderColor:'#e2e8f0',borderWidth:1,borderRadius:8,fontSize:14,color:'#1e293b'}},
  image:     {w:200,h:200, props:{src:'',backgroundColor:'#f1f5f9',borderRadius:0}},
  pix:       {w:280,h:320, props:{backgroundColor:'#ffffff',borderRadius:16,borderWidth:1,borderColor:'#e2e8f0'}},
  'card-form':{w:360,h:420,props:{backgroundColor:'#ffffff',borderRadius:16,borderWidth:1,borderColor:'#e2e8f0'}},
};

function makeEl(type,x,y){
  const d=DEFAULTS[type]||{w:200,h:100,props:{backgroundColor:'#e2e8f0'}};
  return {id:uid(),type,x,y,width:d.w,height:d.h,rotation:0,props:{...d.props},locked:false,visible:true,name:type};
}

// ─── RENDER ───
function renderCanvas(){
  const c=document.getElementById('canvas');
  c.style.transform='scale('+(zoom/100)+')';
  c.style.transformOrigin='center center';
  c.innerHTML='';
  elements.forEach(el=>{
    const div=document.createElement('div');
    div.className='cel'+(selectedIds.includes(el.id)?' selected':'');
    div.dataset.id=el.id;
    Object.assign(div.style,{left:el.x+'px',top:el.y+'px',width:el.width+'px',height:el.height+'px',transform:'rotate('+el.rotation+'deg)',opacity:el.props.opacity??1});
    div.innerHTML='<div class="content">'+renderContent(el)+'</div>';
    div.addEventListener('mousedown',e=>startDrag(e,el.id));
    if(selectedIds.includes(el.id)){
      ['nw','n','ne','e','se','s','sw','w'].forEach(h=>{
        const hd=document.createElement('div');
        hd.className='rh';
        const pos=handlePos(h);
        Object.assign(hd.style,pos);
        hd.addEventListener('mousedown',e=>{e.stopPropagation();startResize(e,el.id,h)});
        div.appendChild(hd);
      });
    }
    c.appendChild(div);
  });
  renderRight();
  document.getElementById('zoomVal').textContent=zoom+'%';
  document.getElementById('undoBtn').disabled=histIdx<=0;
  document.getElementById('redoBtn').disabled=histIdx>=history.length-1;
}

function handlePos(h){
  const m={nw:{top:'-5px',left:'-5px',cursor:'nw-resize'},n:{top:'-5px',left:'50%',transform:'translateX(-50%)',cursor:'n-resize'},ne:{top:'-5px',right:'-5px',cursor:'ne-resize'},e:{top:'50%',right:'-5px',transform:'translateY(-50%)',cursor:'e-resize'},se:{bottom:'-5px',right:'-5px',cursor:'se-resize'},s:{bottom:'-5px',left:'50%',transform:'translateX(-50%)',cursor:'s-resize'},sw:{bottom:'-5px',left:'-5px',cursor:'sw-resize'},w:{top:'50%',left:'-5px',transform:'translateY(-50%)',cursor:'w-resize'}};
  return m[h]||{};
}

function renderContent(el){
  const p=el.props;
  switch(el.type){
    case 'text': return `<div style="width:100%;height:100%;display:flex;align-items:center;color:${p.color};font-size:${p.fontSize}px;font-weight:${p.fontWeight||400};padding:4px">${esc(p.text||'')}</div>`;
    case 'button': return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${p.backgroundColor};color:${p.color};font-size:${p.fontSize}px;font-weight:${p.fontWeight||600};border-radius:${p.borderRadius||0}px;cursor:pointer">${esc(p.text||'')}</div>`;
    case 'input': return `<div style="width:100%;height:100%;display:flex;align-items:center;background:${p.backgroundColor};border:${p.borderWidth||0}px solid ${p.borderColor||'#e2e8f0'};border-radius:${p.borderRadius||0}px;padding:0 12px;color:${p.color||'#94a3b8'};font-size:${p.fontSize||14}px">${esc(p.placeholder||'')}</div>`;
    case 'image': return p.src?`<img src="${esc(p.src)}" style="width:100%;height:100%;object-fit:cover;border-radius:${p.borderRadius||0}px;display:block">`:`<div style="width:100%;height:100%;background:${p.backgroundColor};border-radius:${p.borderRadius||0}px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px">Imagem</div>`;
    case 'pix': return `<div style="width:100%;height:100%;background:${p.backgroundColor};border-radius:${p.borderRadius||0}px;border:${p.borderWidth||0}px solid ${p.borderColor||'#e2e8f0'};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px"><div style="width:120px;height:120px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#94a3b8">QR Code Pix</div><div style="font-size:13px;color:#64748b">Copiar código Pix</div></div>`;
    case 'card-form': return `<div style="width:100%;height:100%;background:${p.backgroundColor};border-radius:${p.borderRadius||0}px;border:${p.borderWidth||0}px solid ${p.borderColor||'#e2e8f0'};display:flex;flex-direction:column;gap:12px;padding:20px"><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:13px;color:#94a3b8">Número do cartão</div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:13px;color:#94a3b8">Nome no cartão</div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:13px;color:#94a3b8">Validade / CVV</div><div style="margin-top:auto;background:#7c3aed;border-radius:8px;padding:12px;text-align:center;color:#fff;font-size:14px;font-weight:600">Pagar</div></div>`;
    default: return `<div style="width:100%;height:100%;background:${p.backgroundColor||'#e2e8f0'};border-radius:${p.borderRadius||0}px"></div>`;
  }
}
function esc(s){return s.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// ─── RIGHT PANEL ───
function renderRight(){
  const rp=document.getElementById('rightPanel');
  if(!selectedIds.length){rp.innerHTML='<p class="empty">Selecione um elemento</p>';return}
  const el=elements.find(e=>e.id===selectedIds[0]);
  if(!el){rp.innerHTML='<p class="empty">Selecione um elemento</p>';return}
  const p=el.props;
  let h=`<div class="hdr"><span class="type">${esc(el.type)}</span><button class="del-btn" onclick="deleteSelected()">Deletar</button></div>`;
  h+=field('Posição X / Y',`<div class="row2"><input class="fin" type="number" value="${Math.round(el.x)}" onchange="updEl('${el.id}','x',+this.value)"><input class="fin" type="number" value="${Math.round(el.y)}" onchange="updEl('${el.id}','y',+this.value)"></div>`);
  h+=field('Largura / Altura',`<div class="row2"><input class="fin" type="number" value="${Math.round(el.width)}" onchange="updEl('${el.id}','width',+this.value)"><input class="fin" type="number" value="${Math.round(el.height)}" onchange="updEl('${el.id}','height',+this.value)"></div>`);
  h+=field('Rotação',`<input class="fin" type="number" value="${el.rotation}" onchange="updEl('${el.id}','rotation',+this.value)">`);
  if(p.backgroundColor!==undefined) h+=field('Cor de fundo',`<input class="fin" type="color" value="${p.backgroundColor||'#ffffff'}" oninput="updProp('${el.id}','backgroundColor',this.value)">`);
  if(p.color!==undefined) h+=field('Cor do texto',`<input class="fin" type="color" value="${p.color||'#000000'}" oninput="updProp('${el.id}','color',this.value)">`);
  if(p.text!==undefined) h+=field('Texto',`<input class="fin" type="text" value="${esc(p.text||'')}" oninput="updProp('${el.id}','text',this.value)">`);
  if(p.fontSize!==undefined) h+=field('Tamanho da fonte',`<input class="fin" type="number" value="${p.fontSize||16}" onchange="updProp('${el.id}','fontSize',+this.value)">`);
  if(p.borderRadius!==undefined) h+=field('Border Radius',`<input class="fin" type="number" value="${p.borderRadius||0}" onchange="updProp('${el.id}','borderRadius',+this.value)">`);
  if(p.src!==undefined) h+=field('URL da imagem',`<input class="fin" type="text" value="${esc(p.src||'')}" oninput="updProp('${el.id}','src',this.value)" placeholder="https://...">`);
  if(p.placeholder!==undefined) h+=field('Placeholder',`<input class="fin" type="text" value="${esc(p.placeholder||'')}" oninput="updProp('${el.id}','placeholder',this.value)">`);
  rp.innerHTML=h;
}
function field(l,c){return `<div class="field"><label>${l}</label>${c}</div>`}

// ─── DRAG & DROP ───
let dragState=null, resizeState=null;

function startDrag(e,id){
  e.stopPropagation();
  const el=elements.find(x=>x.id===id);
  if(!el)return;
  if(e.shiftKey){selectedIds=selectedIds.includes(id)?selectedIds.filter(s=>s!==id):[...selectedIds,id]}
  else if(!selectedIds.includes(id)){selectedIds=[id]}
  dragState={id,startX:e.clientX,startY:e.clientY,elX:el.x,elY:el.y};
  renderCanvas();
}

function startResize(e,id,handle){
  resizeState={id,handle,startX:e.clientX,startY:e.clientY};
}

document.addEventListener('mousemove',e=>{
  if(dragState){
    const{id,startX,startY,elX,elY}=dragState;
    const dx=(e.clientX-startX)/(zoom/100);
    const dy=(e.clientY-startY)/(zoom/100);
    elements=elements.map(el=>el.id===id?{...el,x:elX+dx,y:elY+dy}:el);
    renderCanvas();
  }
  if(resizeState){
    const{id,handle,startX,startY}=resizeState;
    const dx=(e.clientX-startX)/(zoom/100);
    const dy=(e.clientY-startY)/(zoom/100);
    resizeState.startX=e.clientX;resizeState.startY=e.clientY;
    elements=elements.map(el=>{
      if(el.id!==id)return el;
      let{x,y,width:w,height:h}=el;
      if(handle.includes('e'))w=Math.max(20,w+dx);
      if(handle.includes('s'))h=Math.max(20,h+dy);
      if(handle.includes('w')){w=Math.max(20,w-dx);x+=dx}
      if(handle.includes('n')){h=Math.max(20,h-dy);y+=dy}
      return{...el,x,y,width:w,height:h};
    });
    renderCanvas();
  }
});

document.addEventListener('mouseup',()=>{
  if(dragState||resizeState)pushHistory();
  dragState=null;resizeState=null;
});

document.getElementById('canvas').addEventListener('mousedown',e=>{
  if(e.target===e.currentTarget){selectedIds=[];renderCanvas()}
});

// ─── ADD / UPDATE / DELETE ───
function addEl(type){
  const el=makeEl(type,300-100,450-50);
  elements.push(el);
  selectedIds=[el.id];
  pushHistory();renderCanvas();
}

function updEl(id,key,val){
  elements=elements.map(el=>el.id===id?{...el,[key]:val}:el);
  pushHistory();renderCanvas();
}

function updProp(id,key,val){
  elements=elements.map(el=>el.id===id?{...el,props:{...el.props,[key]:val}}:el);
  pushHistory();renderCanvas();
}

function deleteSelected(){
  elements=elements.filter(el=>!selectedIds.includes(el.id));
  selectedIds=[];
  pushHistory();renderCanvas();
}

// ─── HISTORY ───
function pushHistory(){
  history=history.slice(0,histIdx+1);
  history.push(JSON.parse(JSON.stringify(elements)));
  if(history.length>50)history.shift();
  histIdx=history.length-1;
  renderCanvas();
}

function undo(){
  if(histIdx<=0)return;
  histIdx--;elements=JSON.parse(JSON.stringify(history[histIdx]));
  renderCanvas();
}

function redo(){
  if(histIdx>=history.length-1)return;
  histIdx++;elements=JSON.parse(JSON.stringify(history[histIdx]));
  renderCanvas();
}

// ─── ZOOM ───
function zoomBy(d){zoom=Math.max(25,Math.min(200,zoom+d));renderCanvas()}

// ─── KEYBOARD ───
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.key==='Delete'&&selectedIds.length)deleteSelected();
  if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault();undo()}
  if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();redo()}
});

// ─── SAVE ───
async function saveCanvas(){
  try{
    const r=await fetch(API_URL,{method:'PUT',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':CSRF},body:JSON.stringify({canvas_elements:elements})});
    if(r.ok)showToast('✅ Salvo com sucesso!');
    else showToast('❌ Erro ao salvar');
  }catch(err){showToast('❌ Erro de conexão')}
}

function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ─── LOAD ───
async function loadCanvas(){
  try{
    const r=await fetch(API_URL,{headers:{'X-CSRF-TOKEN':CSRF}});
    const data=await r.json();
    elements=Array.isArray(data.canvas_elements)?data.canvas_elements:[];
    history=[JSON.parse(JSON.stringify(elements))];histIdx=0;
    renderCanvas();
  }catch(err){console.error('Load error',err);renderCanvas()}
}

// ─── CLONE IA ───
let cloneTab = 'url';
let cloneResult = null;

function openCloneModal(){
  cloneResult=null;
  document.getElementById('cloneModal').classList.add('open');
  document.getElementById('cloneError').style.display='none';
  document.getElementById('clonePreview').style.display='none';
  document.getElementById('cloneActionBtn').textContent='🤖 Analisar com IA';
  document.getElementById('cloneActionBtn').disabled=false;
  document.getElementById('cloneActionBtn').onclick=handleClone;
  setCloneTab('url');
}

function closeCloneModal(){
  document.getElementById('cloneModal').classList.remove('open');
}

document.getElementById('cloneModal').addEventListener('click',e=>{
  if(e.target===e.currentTarget)closeCloneModal();
});

function setCloneTab(tab){
  cloneTab=tab;
  document.getElementById('tabUrl').className='tab'+(tab==='url'?' active':'');
  document.getElementById('tabImg').className='tab'+(tab==='image'?' active':'');
  if(tab==='url'){
    document.getElementById('cloneInputArea').innerHTML='<input class="mfin" type="url" id="cloneUrl" placeholder="https://checkout.exemplo.com/pagamento">';
  } else {
    document.getElementById('cloneInputArea').innerHTML='<div class="upload-zone" onclick="document.getElementById(\'cloneFile\').click()">Clique para selecionar imagem (PNG, JPG, WEBP)<input type="file" id="cloneFile" accept="image/*" style="display:none"></div>';
  }
  document.getElementById('cloneError').style.display='none';
  document.getElementById('clonePreview').style.display='none';
  cloneResult=null;
  document.getElementById('cloneActionBtn').textContent='🤖 Analisar com IA';
  document.getElementById('cloneActionBtn').onclick=handleClone;
}

async function handleClone(){
  const errDiv=document.getElementById('cloneError');
  const preDiv=document.getElementById('clonePreview');
  const btn=document.getElementById('cloneActionBtn');
  errDiv.style.display='none';
  preDiv.style.display='none';
  btn.textContent='⏳ Analisando...';
  btn.disabled=true;

  try{
    let res;
    if(cloneTab==='url'){
      const url=document.getElementById('cloneUrl')?.value?.trim();
      if(!url)throw new Error('Cole uma URL válida');
      res=await fetch('/dashboard/lab/clone',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':CSRF},body:JSON.stringify({url})});
    } else {
      const file=document.getElementById('cloneFile')?.files?.[0];
      if(!file)throw new Error('Selecione uma imagem');
      const fd=new FormData();
      fd.append('image',file);
      res=await fetch('/dashboard/lab/clone',{method:'POST',headers:{'X-CSRF-TOKEN':CSRF},body:fd});
    }

    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Erro na IA');
    if(!data.elements||!Array.isArray(data.elements))throw new Error('Resposta sem elementos');

    cloneResult=data;

    // Contagem de tipos
    const counts={};
    data.elements.forEach(el=>{counts[el.type]=(counts[el.type]||0)+1});
    let tags='';
    Object.entries(counts).forEach(([t,c])=>{tags+=`<span class="tag">${t}: ${c}</span>`});

    preDiv.innerHTML=`<p class="ok">✅ IA detectou ${data.elements.length} elementos</p><div class="tags">${tags}</div><p class="meta">Canvas: ${data.canvasWidth||600}×${data.canvasHeight||900}px · Fundo: ${data.backgroundColor||'#fff'}</p>`;
    preDiv.style.display='flex';
    btn.textContent='✅ Aplicar no Canvas';
    btn.disabled=false;
    btn.onclick=applyClone;

  }catch(e){
    errDiv.textContent='❌ '+e.message;
    errDiv.style.display='block';

    // Oferece fallback
    btn.textContent='⚡ Usar template padrão';
    btn.disabled=false;
    btn.onclick=handleCloneFallback;
  }
}

async function handleCloneFallback(){
  const btn=document.getElementById('cloneActionBtn');
  btn.textContent='⏳ Gerando...';
  btn.disabled=true;
  try{
    const res=await fetch('/dashboard/lab/clone/fallback',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-TOKEN':CSRF},body:JSON.stringify({})});
    const data=await res.json();
    cloneResult=data;
    applyClone();
  }catch(e){
    document.getElementById('cloneError').textContent='❌ '+e.message;
    document.getElementById('cloneError').style.display='block';
    btn.textContent='🤖 Analisar com IA';
    btn.disabled=false;
    btn.onclick=handleClone;
  }
}

function applyClone(){
  if(!cloneResult)return;
  elements=cloneResult.elements.map(el=>({
    id:el.id||uid(),
    type:el.type||'rect',
    x:el.x||0,y:el.y||0,
    width:el.width||200,height:el.height||100,
    rotation:el.rotation||0,
    props:el.props||{backgroundColor:'#e2e8f0'},
    locked:false,visible:true,name:el.name||el.type
  }));
  const c=document.getElementById('canvas');
  c.style.width=(cloneResult.canvasWidth||600)+'px';
  c.style.height=(cloneResult.canvasHeight||900)+'px';
  c.style.backgroundColor=cloneResult.backgroundColor||'#ffffff';
  selectedIds=[];
  pushHistory();
  renderCanvas();
  closeCloneModal();
  showToast('✅ Layout clonado com '+elements.length+' elementos!');
}

loadCanvas();
</script>
</body>
</html>
