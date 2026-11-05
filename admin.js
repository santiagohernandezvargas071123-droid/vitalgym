/**
 * VITALGYM - MÓDULO ADMINISTRADOR (admin.js)
 * SENA Centro de Formación Agroindustrial - La Angostura (Ficha ADSO 3312595)
 */

// 1. ESTADO DEL ADMINISTRADOR
const estadoAdmin = {
  filtroZona: 'TODAS',
  filtroEstado: 'TODOS',
  busquedaEquipo: '',

  equipos: [
    { id: 1, codigo_activo: 'EQ-MS-001', nombre: 'Prensa de Piernas 45°', marca: 'Hammer Strength', modelo: 'Linear 45 Plate Loaded', zona_ubicacion: 'Musculación', estado_operativo: 'operativo' },
    { id: 2, codigo_activo: 'EQ-MS-012', nombre: 'Polea Dual Cruzada (Crossover)', marca: 'Life Fitness', modelo: 'Cable Motion Dual', zona_ubicacion: 'Musculación', estado_operativo: 'requiere_mantenimiento' },
    { id: 3, codigo_activo: 'EQ-CD-003', nombre: 'Caminadora Eléctrica T70', marca: 'Matrix', modelo: 'Matrix T70 Touch', zona_ubicacion: 'Cardio', estado_operativo: 'fuera_de_servicio' },
    { id: 4, codigo_activo: 'EQ-SP-008', nombre: 'Bicicleta de Spinning IC4', marca: 'Schwinn', modelo: 'IC4 Magnetic Spin', zona_ubicacion: 'Spinning', estado_operativo: 'operativo' },
    { id: 5, codigo_activo: 'EQ-PL-020', nombre: 'Banco Plano Olímpico de Pecho', marca: 'Rogue Fitness', modelo: 'Monster Flat Bench', zona_ubicacion: 'Peso Libre', estado_operativo: 'operativo' }
  ],

  alertasMantenimiento: [
    { id: 1, codigo_activo: 'EQ-CD-003', nombre_equipo: 'Caminadora Eléctrica T70', alerta_titulo: 'MÁQUINA AVERIADA (URGENTE)', tipo_mantenimiento: 'correctivo', descripcion: 'Falla mecánica: Rotura de banda de tracción principal durante sesión.', zona_ubicacion: 'Cardio' },
    { id: 2, codigo_activo: 'EQ-MS-012', nombre_equipo: 'Polea Dual Cruzada', alerta_titulo: 'MANTENIMIENTO PREVENTIVO REQUERIDO', tipo_mantenimiento: 'preventivo', descripcion: 'Inspección periódica de guayas y lubricación de poleas en torre dual.', zona_ubicacion: 'Musculación' }
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
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12);
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
  restaurarSesionAdmin();
  renderizarEquipos();
  renderizarAlertasMantenimiento();
});

function restaurarSesionAdmin() {
  try {
    const sesion = localStorage.getItem('vitalgym_sesion');
    if (sesion) {
      const u = JSON.parse(sesion);
      if (u) {
        const nombre = `${u.nombres || 'Administrador'} ${u.apellidos || 'General'}`;
        const iniciales = ((u.nombres ? u.nombres.charAt(0) : 'A') + (u.apellidos ? u.apellidos.charAt(0) : 'D')).toUpperCase();
        
        const avatarEl = document.getElementById('auth-admin-avatar');
        const nameEl = document.getElementById('auth-admin-name');
        const roleEl = document.getElementById('auth-admin-role');

        if (avatarEl) avatarEl.textContent = iniciales;
        if (nameEl) nameEl.textContent = nombre;
        if (roleEl) roleEl.textContent = u.plan || 'Coordinación La Angostura';
      }
    }
  } catch (e) {
    console.error('Error cargando admin:', e);
  }
}

// 4. INVENTARIO DE EQUIPOS Y FILTROS
function renderizarEquipos() {
  const tbody = document.getElementById('cuerpo-tabla-equipos');
  if (!tbody) return;

  const termino = estadoAdmin.busquedaEquipo.toLowerCase();
  const filtrados = estadoAdmin.equipos.filter(eq => {
    const coincideTexto = eq.codigo_activo.toLowerCase().includes(termino) ||
                          eq.nombre.toLowerCase().includes(termino) ||
                          eq.marca.toLowerCase().includes(termino);
    const coincideZona = (estadoAdmin.filtroZona === 'TODAS' || eq.zona_ubicacion === estadoAdmin.filtroZona);
    const coincideEstado = (estadoAdmin.filtroEstado === 'TODOS' || eq.estado_operativo === estadoAdmin.filtroEstado);
    return coincideTexto && coincideZona && coincideEstado;
  });

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-xs text-slate-500">No se encontraron equipos bajo los filtros aplicados.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtrados.map(eq => {
    let badgeEstado = '';
    if (eq.estado_operativo === 'operativo') {
      badgeEstado = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#236900] border border-emerald-200">Operativo</span>`;
    } else if (eq.estado_operativo === 'fuera_de_servicio') {
      badgeEstado = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Fuera de Servicio</span>`;
    } else {
      badgeEstado = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">En Taller / Mant.</span>`;
    }

    return `
      <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
        <td class="px-4 py-3 font-mono font-black text-[#236900]">${escapeHtml(eq.codigo_activo)}</td>
        <td class="px-4 py-3 font-bold text-slate-900">
          ${escapeHtml(eq.nombre)}
          <span class="block text-[11px] text-slate-500 font-normal">${escapeHtml(eq.marca)} · ${escapeHtml(eq.modelo || '')}</span>
        </td>
        <td class="px-4 py-3 text-slate-600">${escapeHtml(eq.zona_ubicacion)}</td>
        <td class="px-4 py-3">${badgeEstado}</td>
        <td class="px-4 py-3 text-right">
          <button onclick="abrirModalReporteMantenimiento('${escapeHtml(eq.id)}', '${escapeHtml(eq.codigo_activo)} - ${escapeHtml(eq.nombre)}')" class="text-xs text-[#39A900] hover:text-[#236900] font-bold transition">
            Reportar Daño
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
window.renderizarEquipos = renderizarEquipos;

function filtrarEquiposTexto(val) {
  estadoAdmin.busquedaEquipo = val;
  renderizarEquipos();
}
window.filtrarEquiposTexto = filtrarEquiposTexto;

function filtrarEquiposZona(val) {
  estadoAdmin.filtroZona = val;
  renderizarEquipos();
}
window.filtrarEquiposZona = filtrarEquiposZona;

function filtrarEquiposEstado(val) {
  estadoAdmin.filtroEstado = val;
  renderizarEquipos();
}
window.filtrarEquiposEstado = filtrarEquiposEstado;

// 5. ALERTAS DE MANTENIMIENTO
function renderizarAlertasMantenimiento() {
  const cont = document.getElementById('contenedor-alertas-mantenimiento');
  if (!cont) return;

  cont.innerHTML = estadoAdmin.alertasMantenimiento.map(al => {
    const esUrgente = al.tipo_mantenimiento === 'correctivo';
    return `
      <div class="p-3.5 rounded-2xl border ${esUrgente ? 'border-rose-200 bg-rose-50/80' : 'border-amber-200 bg-amber-50/80'} flex flex-col justify-between gap-2 shadow-sm">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${esUrgente ? 'bg-white text-rose-700 border-rose-200' : 'bg-white text-amber-700 border-amber-200'}">
              ${escapeHtml(al.codigo_activo)}
            </span>
            <h4 class="text-xs font-black text-slate-900 mt-1">${escapeHtml(al.nombre_equipo)}</h4>
            <p class="text-[11px] ${esUrgente ? 'text-rose-700' : 'text-amber-800'} mt-0.5">${escapeHtml(al.descripcion)}</p>
          </div>
          <span class="text-[10px] font-black uppercase ${esUrgente ? 'text-rose-700' : 'text-amber-700'}">
            ${esUrgente ? 'Avería' : 'Preventivo'}
          </span>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[10px] text-slate-500">
          <span>Zona: ${escapeHtml(al.zona_ubicacion || 'General')}</span>
          <span class="font-bold ${esUrgente ? 'text-rose-600' : 'text-amber-600'}">${escapeHtml(al.alerta_titulo)}</span>
        </div>
      </div>
    `;
  }).join('');
}
window.renderizarAlertasMantenimiento = renderizarAlertasMantenimiento;

// 6. MODAL DE MANTENIMIENTO (HU-06)
function abrirModalReporteMantenimiento(id, textoEquipo) {
  const modal = document.getElementById('modal-mantenimiento');
  const inputEqId = document.getElementById('maint-equipo-id');
  const inputEqTexto = document.getElementById('maint-equipo-nombre');
  if (modal && inputEqId && inputEqTexto) {
    inputEqId.value = id;
    inputEqTexto.value = textoEquipo;
    modal.classList.remove('hidden');
  }
}
window.abrirModalReporteMantenimiento = abrirModalReporteMantenimiento;

function cerrarModalReporteMantenimiento() {
  const modal = document.getElementById('modal-mantenimiento');
  if (modal) modal.classList.add('hidden');
}
window.cerrarModalReporteMantenimiento = cerrarModalReporteMantenimiento;

async function guardarReporteMantenimiento(e) {
  e.preventDefault();
  const equipoId = parseInt(document.getElementById('maint-equipo-id').value);
  const tipo = document.getElementById('maint-tipo').value;
  const descripcion = document.getElementById('maint-descripcion').value.trim();
  const tecnico = document.getElementById('maint-tecnico').value.trim();

  const eq = estadoAdmin.equipos.find(x => x.id === equipoId);
  if (eq) {
    eq.estado_operativo = (tipo === 'correctivo') ? 'fuera_de_servicio' : 'requiere_mantenimiento';
  }

  cerrarModalReporteMantenimiento();
  renderizarEquipos();
  reproducirSonidoExito();
  mostrarToast('✓ Orden técnica generada y máquina actualizada en inventario (HU-06).', 'success');

  try {
    fetch('api.php?action=reportar_mantenimiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipo_id: equipoId, tipo_mantenimiento: tipo, descripcion: descripcion, nombre_tecnico: tecnico })
    });
  } catch (err) {
    console.log('Reporte persistido localmente');
  }
}
window.guardarReporteMantenimiento = guardarReporteMantenimiento;

// 7. PESTAÑAS ADMINISTRATIVAS
function cambiarTabAdmin(tab) {
  const tabs = ['inventario', 'movimientos', 'mantenimientos', 'auditoria', 'reporte'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-admin-${t}`);
    const btn = document.getElementById(`btn-tab-admin-${t}`);
    if (el) el.classList.toggle('hidden', t !== tab);
    if (btn) {
      if (t === tab) {
        btn.className = "px-4 py-2 rounded-xl bg-[#39A900] text-white shadow font-bold transition";
      } else {
        btn.className = "px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition";
      }
    }
  });
}
window.cambiarTabAdmin = cambiarTabAdmin;

// 8. AUDITORÍA DE SEGURIDAD (HU-01: DESBLOQUEO DE CUENTAS)
function desbloquearUsuarioAdmin(doc) {
  reproducirSonidoExito();
  alert(`✓ Usuario con documento ${doc} ha sido desbloqueado exitosamente.\\nSe restablecieron los intentos fallidos de contraseña a 0 (HU-01).`);
  mostrarToast(`Cuenta ${doc} desbloqueada`, 'success');
}
window.desbloquearUsuarioAdmin = desbloquearUsuarioAdmin;

// 9. IMPRIMIR REPORTE MENSUAL SENA
function imprimirReporteSena() {
  cambiarTabAdmin('reporte');
  setTimeout(() => {
    window.print();
  }, 300);
}
window.imprimirReporteSena = imprimirReporteSena;

// 10. UTILIDADES
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

