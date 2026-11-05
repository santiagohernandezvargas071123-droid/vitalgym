/**
 * VITALGYM - MÓDULO APRENDIZ (aprendiz.js)
 * SENA Centro de Formación Agroindustrial - La Angostura (Ficha ADSO 3312595)
 */

// 1. ESTADO DEL APRENDIZ
const estadoAprendiz = {
  usuario: {
    id: 4,
    nombres: 'Santiago',
    apellidos: 'Hernández Vargas',
    numero_documento: '1107530057',
    documento_alias: '1075254123',
    ficha_sena: '3312595',
    codigo_qr_token: 'QR-APR-1107530057',
    puntos_constancia: 260,
    plan: 'Plan Oro Activo (Sin Costo)',
    rol: 'aprendiz'
  },
  
  ranking: [
    { posicion: 1, nombres: 'Santiago', apellidos: 'Hernández Vargas', ficha: '3312595', puntos: 260, asistencias: 20 },
    { posicion: 2, nombres: 'Leonardo', apellidos: 'González Perdomo', ficha: '3312595', puntos: 180, asistencias: 14 },
    { posicion: 3, nombres: 'Germán', apellidos: 'Mouse', ficha: '3312595', puntos: 95, asistencias: 8 }
  ],

  rutina: {
    nombre: 'Push-Pull-Legs (3 Días) - Hipertrofia & Fuerza',
    diaSeleccionado: 1,
    dias: {
      1: {
        titulo: 'Día 1: Empuje (Pecho, Hombro y Tríceps)',
        ejercicios: [
          { id: 1, nombre: 'Press de Banca Plano con Barra', series: 4, repeticiones: '8-10', tempo: '3-0-1-0', rpe: 'RPE 8', descanso: 120, notas: 'Serie pesada controlando bajada excéntrica' },
          { id: 6, nombre: 'Press Militar de Hombros con Barra', series: 3, repeticiones: '10-12', tempo: '2-0-1-0', rpe: 'RPE 8', descanso: 90, notas: 'Cuerpo firme sin arquear lumbares' },
          { id: 7, nombre: 'Elevaciones Laterales con Mancuernas', series: 4, repeticiones: '12-15', tempo: '2-0-1-0', rpe: 'RPE 9', descanso: 60, notas: 'Última serie con drop-set al fallo' },
          { id: 9, nombre: 'Extensión de Tríceps en Polea Alta', series: 3, repeticiones: '12-15', tempo: '2-0-1-0', rpe: 'RPE 9', descanso: 60, notas: 'Apertura máxima en contracción final' }
        ]
      },
      2: {
        titulo: 'Día 2: Tracción (Espalda, Dorsales y Bíceps)',
        ejercicios: [
          { id: 4, nombre: 'Jalón al Pecho en Polea Alta', series: 4, repeticiones: '10-12', tempo: '3-0-1-0', rpe: 'RPE 8', descanso: 90, notas: 'Pausa isométrica de 1s en el pecho' },
          { id: 5, nombre: 'Remo con Barra Inclinado (Pendlay)', series: 4, repeticiones: '8-10', tempo: '2-0-1-0', rpe: 'RPE 8', descanso: 120, notas: 'Torso paralelo al suelo y espalda rígida' },
          { id: 8, nombre: 'Curl de Bíceps con Barra Z', series: 3, repeticiones: '10-12', tempo: '2-0-1-0', rpe: 'RPE 8.5', descanso: 60, notas: 'Foco total en la supinación sin balanceo' }
        ]
      },
      3: {
        titulo: 'Día 3: Pierna Completa & Core',
        ejercicios: [
          { id: 2, nombre: 'Sentadilla Trasera con Barra (Squat)', series: 4, repeticiones: '6-8', tempo: '3-1-1-0', rpe: 'RPE 8.5', descanso: 150, notas: 'Romper paralelo con rodillas estables' },
          { id: 3, nombre: 'Prensa de Piernas 45°', series: 4, repeticiones: '10-12', tempo: '3-0-1-0', rpe: 'RPE 9', descanso: 90, notas: 'Rango profundo sin bloquear rodillas' },
          { id: 10, nombre: 'Plancha Abdominal Isométrica', series: 3, repeticiones: '45 seg', tempo: 'Isométrico', rpe: 'RPE 8', descanso: 45, notas: 'Mantener tensión lumbar y glúteos firmes' }
        ]
      }
    }
  },

  timer: {
    intervalo: null,
    segundosRestantes: 60
  }
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

// 3. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
  // Garantizar eliminación total del selector de cambio de perfil si existe en caché
  const oldSelector = document.getElementById('selector-aprendiz-demo');
  if (oldSelector) {
    const parentContainer = oldSelector.closest('div.bg-emerald-50\\/70') || oldSelector.parentElement?.parentElement;
    if (parentContainer) parentContainer.remove();
  }
  restaurarSesionAprendiz();
  actualizarBannerAprendiz();
  aplicarFotoPerfil();
  renderizarRutinaDia(1);
  renderizarTablaLideres();
});

function restaurarSesionAprendiz() {
  try {
    const sesion = localStorage.getItem('vitalgym_sesion');
    if (sesion) {
      const u = JSON.parse(sesion);
      if (u && (u.rol === 'aprendiz' || u.rol === 'socio')) {
        estadoAprendiz.usuario = { ...estadoAprendiz.usuario, ...u };
      }
    }
  } catch (e) {
    console.error('Error restaurando sesión:', e);
  }
}

// 4. BANNER DE PERFIL, RANKING Y KPIS AUTOMÁTICOS
function actualizarBannerAprendiz() {
  const u = estadoAprendiz.usuario;
  const avatarEl = document.getElementById('banner-aprendiz-avatar');
  const nombreEl = document.getElementById('banner-aprendiz-nombre');
  const puntosEl = document.getElementById('banner-aprendiz-puntos');
  const detallesEl = document.getElementById('banner-aprendiz-detalles');
  const rankingEl = document.getElementById('banner-aprendiz-ranking');
  const qrTokenEl = document.getElementById('carnet-qr-token');
  const headerAvatarEl = document.getElementById('auth-user-avatar');
  const headerNameEl = document.getElementById('auth-user-name');

  const kpiImcEl = document.getElementById('kpi-aprendiz-imc');
  const kpiAsistEl = document.getElementById('kpi-aprendiz-asistencias');
  const kpiPlanEl = document.getElementById('kpi-aprendiz-plan');
  const kpiRetosEl = document.getElementById('kpi-aprendiz-retos');

  const nombres = u.nombres || 'Santiago';
  const apellidos = u.apellidos || 'Hernández Vargas';
  const iniciales = (nombres.charAt(0) + (apellidos ? apellidos.charAt(0) : '')).toUpperCase();

  // Preservar y aplicar foto de perfil
  aplicarFotoPerfil();
  if (nombreEl) nombreEl.textContent = `${nombres} ${apellidos}`;
  if (headerNameEl) headerNameEl.textContent = `${nombres} ${apellidos}`;
  if (puntosEl) puntosEl.textContent = `${u.puntos_constancia} pts`;
  if (qrTokenEl) qrTokenEl.textContent = u.codigo_qr_token || `QR-APR-${u.numero_documento || '1107530057'}`;
  if (detallesEl) {
    detallesEl.innerHTML = `Programa ADSO · Ficha <strong class="text-slate-700">${escapeHtml(u.ficha_sena || '3312595')}</strong> | <span class="text-[#236900] font-bold">${escapeHtml(u.plan || 'Plan Oro Activo (Sin Costo)')}</span>`;
  }

  // Ranking dinámico según puntos
  if (rankingEl) {
    const rIdx = estadoAprendiz.ranking.findIndex(r => r.nombres && r.nombres.toLowerCase().includes(nombres.toLowerCase().split(' ')[0]));
    const pos = rIdx >= 0 ? rIdx + 1 : (u.id === 5 ? 2 : (u.id === 6 ? 3 : 1));
    if (pos === 1) {
      rankingEl.innerHTML = '🥇 Puesto #1 Ranking';
      rankingEl.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 transition-all duration-300';
    } else if (pos === 2) {
      rankingEl.innerHTML = '🥈 Puesto #2 Ranking';
      rankingEl.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 transition-all duration-300';
    } else if (pos === 3) {
      rankingEl.innerHTML = '🥉 Puesto #3 Ranking';
      rankingEl.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 transition-all duration-300';
    } else {
      rankingEl.innerHTML = `🏅 Puesto #${pos} Ranking`;
      rankingEl.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#236900] border border-emerald-200 transition-all duration-300';
    }
  }

  // KPIs dinámicos
  if (kpiImcEl) {
    const imc = u.imc || (u.id === 5 ? '23.8' : (u.id === 6 ? '28.2' : '25.6'));
    const diagnostico = Number(imc) > 25 ? (Number(imc) >= 30 ? 'Obesidad' : 'Normal') : 'Normal';
    kpiImcEl.innerHTML = `${imc} <span class="text-xs text-slate-500 font-normal">${diagnostico}</span>`;
  }
  if (kpiAsistEl) {
    const asist = u.asistencias || (u.id === 5 ? 14 : (u.id === 6 ? 8 : 20));
    kpiAsistEl.innerHTML = `${asist} <span class="text-xs text-slate-400 font-normal">sesiones</span>`;
  }
  if (kpiPlanEl) {
    const planText = u.plan ? (u.plan.includes('Plata') ? 'Plan Plata' : (u.plan.includes('Bronce') ? 'Plan Bronce' : 'Plan Oro')) : 'Plan Oro';
    kpiPlanEl.innerHTML = `${planText} <span class="text-xs text-[#236900] font-bold">($0)</span>`;
  }
  if (kpiRetosEl) {
    const retos = u.retos || (u.id === 5 ? '1 / 2' : (u.id === 6 ? '0 / 2' : '2 / 2'));
    kpiRetosEl.innerHTML = `${retos} <span class="text-xs text-slate-400 font-normal">completados</span>`;
  }

  // Sincronizar selector si existe en DOM
  const selectEl = document.getElementById('selector-aprendiz-demo');
  if (selectEl && u.id) {
    selectEl.value = String(u.id);
  }
}

function cambiarAprendizDemo(id) {
  const aprendices = {
    4: {
      id: 4,
      nombres: 'Santiago',
      apellidos: 'Hernández Vargas',
      numero_documento: '1107530057',
      documento_alias: '1075254123',
      ficha_sena: '3312595',
      codigo_qr_token: 'QR-APR-1107530057',
      puntos_constancia: 260,
      plan: 'Plan Oro Activo (Sin Costo)',
      imc: '25.6',
      asistencias: 20,
      retos: '2 / 2',
      rol: 'aprendiz'
    },
    5: {
      id: 5,
      nombres: 'Leonardo',
      apellidos: 'González Perdomo',
      numero_documento: '1098765432',
      ficha_sena: '3312595',
      codigo_qr_token: 'QR-APR-1098765432',
      puntos_constancia: 180,
      plan: 'Plan Plata Activo (Sin Costo)',
      imc: '23.8',
      asistencias: 14,
      retos: '1 / 2',
      rol: 'aprendiz'
    },
    6: {
      id: 6,
      nombres: 'Germán',
      apellidos: 'Mouse',
      numero_documento: '1012345678',
      ficha_sena: '3312595',
      codigo_qr_token: 'QR-APR-1012345678',
      puntos_constancia: 95,
      plan: 'Plan Bronce (Sin Costo)',
      imc: '28.2',
      asistencias: 8,
      retos: '0 / 2',
      rol: 'aprendiz'
    }
  };

  const sel = aprendices[id];
  if (!sel) return;

  estadoAprendiz.usuario = { ...sel };
  localStorage.setItem('vitalgym_sesion', JSON.stringify(estadoAprendiz.usuario));
  actualizarBannerAprendiz();
  renderizarTablaLideres();
  mostrarToast(`Cambiado a perfil de ${sel.nombres} ${sel.apellidos}`, 'info');
}
window.cambiarAprendizDemo = cambiarAprendizDemo;

// 5. FINALIZAR ENTRENAMIENTO (+10 PTS)
async function finalizarEntrenamiento() {
  estadoAprendiz.usuario.puntos_constancia = Number(estadoAprendiz.usuario.puntos_constancia || 0) + 10;
  
  // Guardar en sesión
  localStorage.setItem('vitalgym_sesion', JSON.stringify(estadoAprendiz.usuario));

  // Animación visual en los puntos
  const puntosEl = document.getElementById('banner-aprendiz-puntos');
  if (puntosEl) {
    puntosEl.classList.add('scale-125', 'text-amber-500');
    setTimeout(() => puntosEl.classList.remove('scale-125', 'text-amber-500'), 500);
  }

  // Actualizar el aprendiz actual en la tabla de ranking dinámicamente
  const nombresFirst = (estadoAprendiz.usuario.nombres || '').toLowerCase().split(' ')[0];
  const rItem = estadoAprendiz.ranking.find(r => r.nombres && r.nombres.toLowerCase().includes(nombresFirst));
  if (rItem) {
    rItem.puntos = estadoAprendiz.usuario.puntos_constancia;
    estadoAprendiz.ranking.sort((a, b) => b.puntos - a.puntos);
    estadoAprendiz.ranking.forEach((r, idx) => r.posicion = idx + 1);
  }

  actualizarBannerAprendiz();
  renderizarTablaLideres();
  reproducirSonidoExito();
  mostrarToast(`¡Entrenamiento registrado! +10 Puntos. Total: ${estadoAprendiz.usuario.puntos_constancia} pts`, 'success');

  // Notificar al backend si hay conectividad
  try {
    fetch('api.php?action=finalizar_entrenamiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aprendiz_id: estadoAprendiz.usuario.id })
    });
  } catch (e) {
    console.log('Puntos sincronizados en memoria local');
  }
}
window.finalizarEntrenamiento = finalizarEntrenamiento;

// 6. RUTINAS PPL INTERACTIVAS
function renderizarRutinaDia(diaNumero) {
  estadoAprendiz.rutina.diaSeleccionado = diaNumero;

  // Actualizar botones de día
  [1, 2, 3].forEach(d => {
    const btn = document.getElementById(`btn-dia-${d}`);
    if (btn) {
      if (d === diaNumero) {
        btn.className = "px-4 py-2 rounded-xl text-xs font-bold bg-[#39A900] text-white shadow transition";
      } else {
        btn.className = "px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition";
      }
    }
  });

  const diaInfo = estadoAprendiz.rutina.dias[diaNumero];
  const contenedor = document.getElementById('lista-ejercicios-rutina');
  const tituloEl = document.getElementById('titulo-dia-rutina');

  if (tituloEl && diaInfo) {
    tituloEl.textContent = diaInfo.titulo;
  }

  if (contenedor && diaInfo) {
    contenedor.innerHTML = diaInfo.ejercicios.map((ex, idx) => `
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm hover:border-emerald-200 transition">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="h-8 w-8 rounded-xl bg-white text-[#236900] font-black text-xs flex items-center justify-center border border-emerald-200 shadow-sm">
              #${idx + 1}
            </span>
            <div>
              <h3 class="text-sm font-black text-slate-900">${escapeHtml(ex.nombre)}</h3>
              <p class="text-xs text-slate-500">${escapeHtml(ex.notas)}</p>
            </div>
          </div>
          <button onclick="iniciarTimer(${ex.descanso})" class="text-xs bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-1.5 transition shadow-sm font-semibold">
            ⏱️ Descanso: ${ex.descanso}s
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center text-xs">
          <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
            <span class="text-[10px] uppercase text-slate-500 block font-semibold">Series</span>
            <span class="font-bold text-slate-800">${ex.series}</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
            <span class="text-[10px] uppercase text-slate-500 block font-semibold">Reps</span>
            <span class="font-bold text-[#236900]">${escapeHtml(ex.repeticiones)}</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
            <span class="text-[10px] uppercase text-slate-500 block font-semibold">Cadencia</span>
            <span class="font-mono text-slate-700">${escapeHtml(ex.tempo)}</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
            <span class="text-[10px] uppercase text-slate-500 block font-semibold">Intensidad</span>
            <span class="font-bold text-amber-700">${escapeHtml(ex.rpe)}</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-sm">
          <div class="flex items-center gap-2">
            <label class="text-slate-500 font-semibold">Carga:</label>
            <input type="number" placeholder="kg" class="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-[#236900] focus:outline-none focus:border-[#39A900]">
          </div>
          <div class="flex items-center gap-2">
            <label class="text-slate-500 font-semibold">Reps:</label>
            <input type="number" placeholder="0" class="w-14 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-slate-800 focus:outline-none focus:border-[#39A900]">
          </div>
          <button onclick="marcarSerieCompletada(this)" class="bg-slate-100 hover:bg-[#39A900] hover:text-white text-slate-700 font-bold px-3.5 py-1.5 rounded-lg border border-slate-300 transition flex items-center gap-1 shadow-sm">
            ✓ Check
          </button>
        </div>
      </div>
    `).join('');
  }
}
window.renderizarRutinaDia = renderizarRutinaDia;

function marcarSerieCompletada(btn) {
  btn.className = "bg-[#39A900] text-white font-bold px-3.5 py-1.5 rounded-lg transition shadow-md flex items-center gap-1";
  btn.innerHTML = "✓ Lista";
  reproducirSonidoExito();
}
window.marcarSerieCompletada = marcarSerieCompletada;

// 7. TEMPORIZADOR DE DESCANSO
function iniciarTimer(segundos) {
  const modal = document.getElementById('modal-timer-descanso');
  const display = document.getElementById('display-timer-descanso');
  if (!modal || !display) return;

  modal.classList.remove('hidden');
  estadoAprendiz.timer.segundosRestantes = segundos;

  function actualizarDisplay() {
    const mins = Math.floor(estadoAprendiz.timer.segundosRestantes / 60);
    const secs = estadoAprendiz.timer.segundosRestantes % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  actualizarDisplay();
  clearInterval(estadoAprendiz.timer.intervalo);

  estadoAprendiz.timer.intervalo = setInterval(() => {
    estadoAprendiz.timer.segundosRestantes--;
    actualizarDisplay();

    if (estadoAprendiz.timer.segundosRestantes <= 0) {
      clearInterval(estadoAprendiz.timer.intervalo);
      reproducirSonidoExito();
      setTimeout(cerrarTimer, 500);
    }
  }, 1000);
}
window.iniciarTimer = iniciarTimer;

function cerrarTimer() {
  const modal = document.getElementById('modal-timer-descanso');
  if (modal) modal.classList.add('hidden');
  clearInterval(estadoAprendiz.timer.intervalo);
}
window.cerrarTimer = cerrarTimer;

// 8. TABLA DE LÍDERES
function renderizarTablaLideres() {
  const tabla = document.getElementById('cuerpo-tabla-lideres');
  if (!tabla) return;

  tabla.innerHTML = estadoAprendiz.ranking.map((ap, index) => {
    let insignia = '';
    if (index === 0) insignia = '🥇 Oro';
    else if (index === 1) insignia = '🥈 Plata';
    else if (index === 2) insignia = '🥉 Bronce';
    else insignia = `#${index + 1}`;

    return `
      <tr class="hover:bg-emerald-50/50 border-b border-slate-100 text-xs transition">
        <td class="px-4 py-3 font-bold text-amber-600">${insignia}</td>
        <td class="px-4 py-3 font-bold text-slate-900">
          ${escapeHtml(ap.nombres)} ${escapeHtml(ap.apellidos)}
          <span class="block text-[11px] text-slate-500 font-normal font-mono">Ficha: ${escapeHtml(ap.ficha)}</span>
        </td>
        <td class="px-4 py-3 text-center">
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-[#236900] border border-emerald-200 font-bold">
            ${ap.puntos} pts
          </span>
        </td>
        <td class="px-4 py-3 text-right text-slate-500">
          ${ap.asistencias} sesiones
        </td>
      </tr>
    `;
  }).join('');
}

// 9. UTILIDADES
function cerrarSesion() {
  localStorage.removeItem('vitalgym_sesion');
  window.location.href = 'index.html';
}
window.cerrarSesion = cerrarSesion;

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl border text-xs font-bold shadow-2xl transition-all duration-300 transform translate-y-2 flex items-center gap-2 ${
    tipo === 'success' 
      ? 'bg-[#236900] text-white border border-[#39A900] shadow-emerald-900/30' 
      : 'bg-slate-900 text-white border border-slate-700'
  }`;
  toast.innerHTML = `<span>⚡</span><span>${escapeHtml(mensaje)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.remove('translate-y-2'), 50);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// 10. MÓDULO DE FOTO DE PERFIL (PERSONALIZACIÓN Y CAMBIO DE AVATARES)
let fotoPerfilTemporal = null;

function abrirModalFotoPerfil() {
  const modal = document.getElementById('modal-cambiar-foto');
  if (!modal) return;
  const fotoActual = localStorage.getItem('vitalgym_foto_perfil') || 'avatar_santiago.jpg';
  fotoPerfilTemporal = fotoActual;
  const preview = document.getElementById('preview-foto-modal');
  if (preview) preview.src = fotoActual;
  modal.classList.remove('hidden');
}
window.abrirModalFotoPerfil = abrirModalFotoPerfil;

function cerrarModalFotoPerfil() {
  const modal = document.getElementById('modal-cambiar-foto');
  if (modal) modal.classList.add('hidden');
}
window.cerrarModalFotoPerfil = cerrarModalFotoPerfil;

function seleccionarFotoPredeterminada(url) {
  fotoPerfilTemporal = url;
  const preview = document.getElementById('preview-foto-modal');
  if (preview) preview.src = url;
}
window.seleccionarFotoPredeterminada = seleccionarFotoPredeterminada;

function procesarFotoArchivo(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    fotoPerfilTemporal = evt.target.result;
    const preview = document.getElementById('preview-foto-modal');
    if (preview) preview.src = fotoPerfilTemporal;
  };
  reader.readAsDataURL(file);
}
window.procesarFotoArchivo = procesarFotoArchivo;

function guardarFotoPerfil() {
  if (!fotoPerfilTemporal) return;
  try {
    localStorage.setItem('vitalgym_foto_perfil', fotoPerfilTemporal);
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
  aplicarFotoPerfil(fotoPerfilTemporal);
  cerrarModalFotoPerfil();
  mostrarToast('¡Foto de perfil actualizada con éxito!');
  if (typeof reproducirSonidoExito === 'function') reproducirSonidoExito();
}
window.guardarFotoPerfil = guardarFotoPerfil;

function aplicarFotoPerfil(url) {
  const foto = url || localStorage.getItem('vitalgym_foto_perfil') || 'avatar_santiago.jpg';
  
  // 1. Banner avatar principal
  const imgBanner = document.getElementById('img-aprendiz-avatar');
  if (imgBanner) imgBanner.src = foto;

  // 2. Header avatar superior
  const imgHeader = document.getElementById('header-avatar-img');
  if (imgHeader) imgHeader.src = foto;

  // 3. Carnet digital con foto
  const imgCarnet = document.getElementById('carnet-aprendiz-foto');
  if (imgCarnet) imgCarnet.src = foto;
}
window.aplicarFotoPerfil = aplicarFotoPerfil;

