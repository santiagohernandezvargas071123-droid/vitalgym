/**
 * VITALGYM - MÓDULO DE VERIFICACIÓN DE USUARIOS & CONTROL DE ACCESOS
 * SENA Centro de Formación Agroindustrial - La Angostura (Ficha ADSO 3312595)
 */

// 1. ESTADO DE VERIFICACIÓN Y TORNIQUETES
const estadoRecepcion = {
  aforoActual: 14,
  aforoMaximo: 35,
  entradasHoy: 32,
  salidasHoy: 18,
  rechazosHoy: 3,

  // Base de datos de usuarios sincronizada con VitalGym SENA
  usuarios: [
    { id: 1, numero_documento: '1000000001', nombres: 'Administrador', apellidos: 'General', rol: 'administrador', ficha_sena: 'ADSO-3312595', codigo_qr_token: 'QR-ADM-9988112233', plan: 'Administración General La Angostura', activo: 1 },
    { id: 2, numero_documento: '1000000002', nombres: 'Martha', apellidos: 'Rivera', rol: 'entrenador', ficha_sena: 'INSTRUCTORA-SENA', codigo_qr_token: 'QR-TRN-4455667788', plan: 'Instructora Titular Acondicionamiento', activo: 1 },
    { id: 4, numero_documento: '1107530057', documento_alias: '1075254123', nombres: 'Santiago', apellidos: 'Hernández Vargas', rol: 'aprendiz', ficha_sena: '3312595 (ADSO)', codigo_qr_token: 'QR-APR-1107530057', plan: 'Plan Oro (Sin Costo · SENA)', puntos: 260, activo: 1 },
    { id: 5, numero_documento: '1098765432', nombres: 'Leonardo', apellidos: 'González Perdomo', rol: 'aprendiz', ficha_sena: '3312595 (ADSO)', codigo_qr_token: 'QR-APR-1098765432', plan: 'Plan Plata (Sin Costo · SENA)', puntos: 180, activo: 1 },
    { id: 6, numero_documento: '1012345678', nombres: 'Germán', apellidos: 'Mouse', rol: 'aprendiz', ficha_sena: '3312595 (ADSO)', codigo_qr_token: 'QR-APR-1012345678', plan: 'Plan Bronce (Vencido)', puntos: 95, activo: 0 }
  ],

  historialAccesos: [
    { nombre: 'Santiago Hernández', hora: '10:15:20', concedido: true, detalle: 'Usuario Existe & Activo', tipo: 'verificación' },
    { nombre: 'Leonardo González', hora: '09:45:10', concedido: true, detalle: 'Usuario Existe & Activo', tipo: 'verificación' },
    { nombre: 'Germán Mouse', hora: '09:40:05', concedido: false, detalle: 'Usuario Existe pero Inactivo (Vencido)', tipo: 'verificación' }
  ]
};

// 2. SISTEMA DE AUDIO SINTÉTICO (WEB AUDIO API)
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function reproducirSonidoExito() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Re 5
    osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12); // La 5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.log('Audio no disponible');
  }
}

function reproducirSonidoFallo() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220.00, audioCtx.currentTime); // La 3
    osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.15); // Mi 3
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (e) {
    console.log('Audio no disponible');
  }
}

// 3. INICIALIZACIÓN DE LA TERMINAL
document.addEventListener('DOMContentLoaded', () => {
  configurarReloj();
  renderizarAforo();
  renderizarHistorialInicial();
  sincronizarUsuariosRemotos();
  const input = document.getElementById('input-doc-checkin');
  if (input) input.focus();
});

async function sincronizarUsuariosRemotos() {
  // 1. Cargar usuarios guardados localmente
  try {
    const guardados = localStorage.getItem('vitalgym_usuarios_registrados');
    if (guardados) {
      const parsed = JSON.parse(guardados);
      if (Array.isArray(parsed)) {
        parsed.forEach(u => {
          if (!estadoRecepcion.usuarios.some(x => String(x.numero_documento).trim() === String(u.numero_documento).trim())) {
            estadoRecepcion.usuarios.push(u);
          }
        });
      }
    }
  } catch (e) {}

  // 2. Sincronizar con API remota si existe
  try {
    const res = await fetch('api.php?action=init_data');
    if (res.ok) {
      const data = await res.json();
      if (data && data.usuarios && data.usuarios.length > 0) {
        data.usuarios.forEach(u => {
          if (!estadoRecepcion.usuarios.some(x => String(x.numero_documento).trim() === String(u.numero_documento).trim())) {
            estadoRecepcion.usuarios.push(u);
          }
        });
      }
    }
  } catch (e) {
    console.log('Trabajando con base de datos local');
  }
}

function configurarReloj() {
  const clockEl = document.getElementById('reloj-recepcion');
  function tick() {
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('es-CO', { hour12: false });
    }
  }
  setInterval(tick, 1000);
  tick();
}

function renderizarAforo() {
  const aforoEl = document.getElementById('contador-aforo');
  const aforoKpi = document.getElementById('recep-kpi-aforo');
  const aforoProgresoEl = document.getElementById('progreso-aforo');

  if (aforoEl) aforoEl.textContent = `${estadoRecepcion.aforoActual} de ${estadoRecepcion.aforoMaximo}`;
  if (aforoKpi) aforoKpi.textContent = estadoRecepcion.aforoActual;
  if (aforoProgresoEl) {
    const pct = Math.min(100, Math.round((estadoRecepcion.aforoActual / estadoRecepcion.aforoMaximo) * 100));
    aforoProgresoEl.style.width = `${pct}%`;
  }
}

function renderizarHistorialInicial() {
  const lista = document.getElementById('lista-accesos-recientes');
  if (!lista) return;

  lista.innerHTML = estadoRecepcion.historialAccesos.map(h => `
    <div class="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs transition shadow-sm hover:border-slate-300">
      <div class="flex items-center gap-2.5 truncate">
        <span class="h-2.5 w-2.5 rounded-full ${h.concedido ? 'bg-[#39A900]' : 'bg-rose-500'} shrink-0"></span>
        <div class="truncate">
          <p class="font-bold text-slate-800 truncate">${escapeHtml(h.nombre)} <span class="text-[10px] text-slate-400">(${h.tipo})</span></p>
          <p class="text-[11px] ${h.concedido ? 'text-[#236900] font-semibold' : 'text-rose-600 font-semibold'} truncate">${escapeHtml(h.detalle)}</p>
        </div>
      </div>
      <span class="font-mono text-slate-400 text-[11px] ml-2 shrink-0">${h.hora}</span>
    </div>
  `).join('');
}

// ============================================================================
// 4. FUNCIÓN CLAVE: VERIFICAR SI EXISTE Y ESTÁ ACTIVO
// ============================================================================

function verificarEstadoUsuario(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inputEl = document.getElementById('input-doc-checkin');
  if (!inputEl) return;
  const identificador = inputEl.value.trim();
  if (!identificador) {
    alert('Por favor ingrese un número de documento o escanee un código QR.');
    inputEl.focus();
    return;
  }

  const user = estadoRecepcion.usuarios.find(u => 
    String(u.numero_documento).trim() === identificador || 
    (u.documento_alias && String(u.documento_alias).trim() === identificador) ||
    String(u.codigo_qr_token).trim() === identificador ||
    (u.nombres + ' ' + u.apellidos).toLowerCase().includes(identificador.toLowerCase())
  );

  const panelEstado = document.getElementById('panel-estado-checkin');
  const idleEstado = document.getElementById('estado-idle-checkin');
  const resultadoContenedor = document.getElementById('resultado-checkin');

  if (idleEstado) idleEstado.classList.add('hidden');
  if (resultadoContenedor) resultadoContenedor.classList.remove('hidden');

  // CASO 1: NO EXISTE EN LA BASE DE DATOS
  if (!user) {
    reproducirSonidoFallo();
    panelEstado.className = "min-h-[280px] rounded-3xl border-2 border-rose-500 bg-rose-50/95 flex flex-col items-center justify-center p-6 md:p-8 text-center transition-all duration-300 shadow-xl space-y-3.5";
    resultadoContenedor.innerHTML = `
      <div class="inline-flex p-3 rounded-full bg-rose-500 text-white shadow-md animate-bounce">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
      </div>
      
      <div class="space-y-1">
        <span class="text-xs font-black px-3.5 py-1 rounded-full bg-rose-600 text-white uppercase tracking-wider shadow-sm">
          ❌ NO EXISTE EN EL SISTEMA
        </span>
        <h2 class="text-2xl font-black text-rose-950 mt-1">Usuario No Encontrado</h2>
        <p class="text-xs text-rose-700 font-semibold max-w-md">
          El identificador <strong>"${escapeHtml(identificador)}"</strong> no corresponde a ningún usuario, aprendiz o instructor registrado en VitalGym SENA.
        </p>
      </div>

      <div class="pt-2 text-[11px] text-slate-500 bg-white/90 px-4 py-2.5 rounded-2xl border border-rose-200 font-medium space-y-2">
        <p>El usuario debe registrarse previamente en el portal para activar su membresía institucional.</p>
        <button type="button" onclick="autoRegistrarYActivar('${escapeHtml(identificador)}')" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#39A900] hover:bg-[#236900] text-white font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Registrar y Activar "${escapeHtml(identificador)}" al Instante
        </button>
      </div>
    `;
    agregarHistorialAcceso(`Doc: ${identificador}`, false, 'Usuario No Existe en BD', 'Verificación');
  } 
  // CASO 2: EXISTE Y ESTÁ ACTIVO
  else if (user.activo === 1) {
    reproducirSonidoExito();
    panelEstado.className = "min-h-[280px] rounded-3xl border-2 border-[#39A900] bg-emerald-50/95 flex flex-col items-center justify-center p-6 md:p-8 text-center transition-all duration-300 shadow-xl space-y-3.5";
    resultadoContenedor.innerHTML = `
      <div class="inline-flex p-3 rounded-full bg-[#39A900] text-white shadow-md">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
      </div>

      <div class="space-y-1">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span class="text-xs font-black px-3.5 py-1 rounded-full bg-white text-[#236900] border border-emerald-300 uppercase tracking-wider shadow-sm">
            ✅ USUARIO EXISTE
          </span>
          <span class="text-xs font-black px-3.5 py-1 rounded-full bg-[#39A900] text-white uppercase tracking-wider shadow-sm">
            ● ESTADO: ACTIVO
          </span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 mt-1">${escapeHtml(user.nombres)} ${escapeHtml(user.apellidos)}</h2>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-white/90 p-3.5 rounded-2xl border border-emerald-200 max-w-md w-full shadow-sm text-left">
        <p><span class="text-slate-400 font-bold block text-[10px] uppercase">Documento:</span> <strong>${escapeHtml(user.numero_documento)}</strong></p>
        <p><span class="text-slate-400 font-bold block text-[10px] uppercase">Rol:</span> <strong class="capitalize text-[#236900] font-black">${escapeHtml(user.rol)}</strong></p>
        <p><span class="text-slate-400 font-bold block text-[10px] uppercase">Ficha SENA:</span> <strong>${escapeHtml(user.ficha_sena || 'SENA')}</strong></p>
        <p><span class="text-slate-400 font-bold block text-[10px] uppercase">Membresía:</span> <strong class="text-[#236900]">${escapeHtml(user.plan || 'Plan Oro ($0 COP)')}</strong></p>
      </div>

      <p class="text-xs text-[#236900] font-black tracking-wide">
        ✓ HABILITADO PARA INGRESAR Y ENTRENAR EN EL GIMNASIO
      </p>
    `;
    agregarHistorialAcceso(`${user.nombres} ${user.apellidos}`, true, 'Existe y Activo', 'Verificación');
  } 
  // CASO 3: EXISTE PERO ESTÁ INACTIVO O VENCIDO
  else {
    reproducirSonidoFallo();
    panelEstado.className = "min-h-[280px] rounded-3xl border-2 border-amber-500 bg-amber-50/95 flex flex-col items-center justify-center p-6 md:p-8 text-center transition-all duration-300 shadow-xl space-y-3.5";
    resultadoContenedor.innerHTML = `
      <div class="inline-flex p-3 rounded-full bg-amber-500 text-white shadow-md">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>

      <div class="space-y-1">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span class="text-xs font-black px-3.5 py-1 rounded-full bg-white text-amber-800 border border-amber-300 uppercase tracking-wider shadow-sm">
            ⚠️ USUARIO EXISTE
          </span>
          <span class="text-xs font-black px-3.5 py-1 rounded-full bg-rose-600 text-white uppercase tracking-wider shadow-sm">
            ● ESTADO: INACTIVO
          </span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 mt-1">${escapeHtml(user.nombres)} ${escapeHtml(user.apellidos)}</h2>
      </div>

      <div class="text-xs text-slate-700 bg-white/90 p-3.5 rounded-2xl border border-amber-200 max-w-md w-full shadow-sm space-y-1.5 text-left">
        <p><span class="text-slate-400 font-bold">Documento:</span> <strong>${escapeHtml(user.numero_documento)}</strong></p>
        <p><span class="text-slate-400 font-bold">Motivo de Inactividad:</span> <strong class="text-rose-700">${escapeHtml(user.plan || 'Membresía Vencida')}</strong></p>
        <p><span class="text-slate-400 font-bold">Ficha Formativa:</span> <strong>${escapeHtml(user.ficha_sena || 'SENA')}</strong></p>
      </div>

      <p class="text-xs text-amber-900 font-bold">
        Acceso no permitido en torniquete: debe renovar su afiliación en el Centro.
      </p>
    `;
    agregarHistorialAcceso(`${user.nombres} ${user.apellidos}`, false, 'Existe pero Inactivo', 'Verificación');
  }

  // Devolver el foco al campo para seguir verificando
  inputEl.focus();
  inputEl.select();
}
window.verificarEstadoUsuario = verificarEstadoUsuario;

function autoRegistrarYActivar(doc) {
  const cleanDoc = String(doc).trim();
  const nuevo = {
    id: Date.now(),
    numero_documento: cleanDoc,
    nombres: 'Aprendiz',
    apellidos: 'SENA',
    rol: 'aprendiz',
    ficha_sena: '3312595 (ADSO)',
    codigo_qr_token: `QR-APR-${cleanDoc}`,
    plan: 'Plan Oro (Sin Costo · SENA)',
    puntos: 100,
    activo: 1
  };
  estadoRecepcion.usuarios.push(nuevo);
  try {
    const list = JSON.parse(localStorage.getItem('vitalgym_usuarios_registrados') || '[]');
    list.push(nuevo);
    localStorage.setItem('vitalgym_usuarios_registrados', JSON.stringify(list));
  } catch (e) {}

  const inputEl = document.getElementById('input-doc-checkin');
  if (inputEl) inputEl.value = cleanDoc;
  verificarEstadoUsuario();
}
window.autoRegistrarYActivar = autoRegistrarYActivar;

// ============================================================================
// 5. REGISTRAR ENTRADA / SALIDA (CHECK-IN / CHECK-OUT)
// ============================================================================

async function procesarCheckIn(e, tipoEvento = 'entrada') {
  if (e) e.preventDefault();
  const inputEl = document.getElementById('input-doc-checkin');
  const identificador = inputEl.value.trim();
  if (!identificador) {
    alert('Por favor ingrese un número de documento o escanee un código QR.');
    return;
  }

  const user = estadoRecepcion.usuarios.find(u => 
    String(u.numero_documento).trim() === identificador || 
    (u.documento_alias && String(u.documento_alias).trim() === identificador) ||
    String(u.codigo_qr_token).trim() === identificador ||
    (u.nombres + ' ' + u.apellidos).toLowerCase().includes(identificador.toLowerCase())
  );

  if (!user) {
    verificarEstadoUsuario(null);
    return;
  }

  if (user.activo === 0) {
    verificarEstadoUsuario(null);
    return;
  }

  // Si está activo, marcar evento de entrada o salida
  if (tipoEvento === 'entrada') {
    estadoRecepcion.aforoActual = Math.min(estadoRecepcion.aforoMaximo, estadoRecepcion.aforoActual + 1);
    estadoRecepcion.entradasHoy++;
  } else {
    estadoRecepcion.aforoActual = Math.max(0, estadoRecepcion.aforoActual - 1);
    estadoRecepcion.salidasHoy++;
  }
  renderizarAforo();

  reproducirSonidoExito();
  const panelEstado = document.getElementById('panel-estado-checkin');
  const idleEstado = document.getElementById('estado-idle-checkin');
  const resultadoContenedor = document.getElementById('resultado-checkin');

  if (idleEstado) idleEstado.classList.add('hidden');
  if (resultadoContenedor) resultadoContenedor.classList.remove('hidden');

  panelEstado.className = "min-h-[280px] rounded-3xl border-2 border-[#39A900] bg-emerald-50/95 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 shadow-xl space-y-3.5";
  resultadoContenedor.innerHTML = `
    <div class="inline-flex p-3 rounded-full bg-[#39A900] text-white shadow-md">
      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
    </div>
    <span class="text-xs font-black px-3.5 py-1 rounded-full bg-white text-[#236900] border border-emerald-300 uppercase tracking-wider shadow-sm">
      ${tipoEvento === 'entrada' ? '🟢 Ingreso Autorizado' : '🔴 Salida Registrada'}
    </span>
    <h2 class="text-2xl font-black text-slate-900">${escapeHtml(user.nombres)} ${escapeHtml(user.apellidos)}</h2>
    <p class="text-xs text-[#236900] font-bold">
      ${tipoEvento === 'entrada' ? '¡Bienvenido(a) a tu sesión de entrenamiento!' : '¡Salida registrada con éxito! Buen descanso.'}
    </p>
    <p class="text-[11px] text-slate-500">Aforo actual en sala: <strong>${estadoRecepcion.aforoActual} / ${estadoRecepcion.aforoMaximo} personas</strong></p>
  `;

  agregarHistorialAcceso(`${user.nombres} ${user.apellidos}`, true, tipoEvento === 'entrada' ? 'Entrada Registrada' : 'Salida Registrada', tipoEvento);
  inputEl.value = '';
  inputEl.focus();
}
window.procesarCheckIn = procesarCheckIn;

function agregarHistorialAcceso(nombre, concedido, detalle, tipo) {
  const lista = document.getElementById('lista-accesos-recientes');
  if (!lista) return;

  const now = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const item = document.createElement('div');
  item.className = "p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs transition shadow-sm hover:border-slate-300";
  item.innerHTML = `
    <div class="flex items-center gap-2.5 truncate">
      <span class="h-2.5 w-2.5 rounded-full ${concedido ? 'bg-[#39A900]' : 'bg-rose-500'} shrink-0"></span>
      <div class="truncate">
        <p class="font-bold text-slate-800 truncate">${escapeHtml(nombre)} <span class="text-[10px] text-slate-400">(${tipo})</span></p>
        <p class="text-[11px] ${concedido ? 'text-[#236900] font-semibold' : 'text-rose-600 font-semibold'} truncate">${escapeHtml(detalle)}</p>
      </div>
    </div>
    <span class="font-mono text-slate-400 text-[11px] ml-2 shrink-0">${now}</span>
  `;
  lista.prepend(item);
}

// 6. UTILIDADES
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
