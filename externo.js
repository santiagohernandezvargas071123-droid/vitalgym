/**
 * ============================================================================
 * VITALGYM SENA - PANEL USUARIO EXTERNO / ESTUDIANTE INTERNO Y EXTERNO
 * ============================================================================
 */

const estadoExterno = {
  usuario: {
    id: 20,
    nombres: 'Carlos Andrés',
    apellidos: 'Rojas Pérez',
    numero_documento: '1088990011',
    correo: 'externo@vitalgym.com',
    rol: 'socio',
    tipo_estudiante: 'externo', // 'interno' | 'externo'
    tipo_confirmado: false,
    plan: 'Pase Deportivo SENA ($0 COP)',
    imc: 23.4,
    asistencias: 8
  },
  diaActivo: 'dia1',
  ejerciciosCompletados: {},
  clases: [
    { id: 1, nombre: 'Spinning Potencia SENA', instructor: 'Martha Rivera', zona: 'Salón Spinning', horario: 'Lunes y Miércoles · 6:00 PM', cupos: 6, maximo: 20, reservada: true },
    { id: 2, nombre: 'Funcional HIIT Metabólico', instructor: 'Martha Rivera', zona: 'Zona Funcional', horario: 'Martes y Jueves · 7:00 AM', cupos: 9, maximo: 18, reservada: false },
    { id: 3, nombre: 'Yoga & Movilidad Zen', instructor: 'Laura Gómez', zona: 'Sala Zen', horario: 'Viernes · 5:00 PM', cupos: 12, maximo: 16, reservada: false },
    { id: 4, nombre: 'Circuito Fuerza & Core', instructor: 'Martha Rivera', zona: 'Musculación', horario: 'Sábado · 9:00 AM', cupos: 5, maximo: 15, reservada: false }
  ],
  rutinas: {
    dia1: [
      { id: 'd1-1', nombre: 'Press de Pecho en Máquina / Barra', series: '4 x 10–12 reps', descanso: '90s', grupo: 'Pectoral' },
      { id: 'd1-2', nombre: 'Jalón al Pecho en Polea Alta', series: '4 x 12 reps', descanso: '75s', grupo: 'Espalda' },
      { id: 'd1-3', nombre: 'Press Militar con Mancuernas', series: '3 x 12 reps', descanso: '60s', grupo: 'Hombros' },
      { id: 'd1-4', nombre: 'Curl de Bíceps + Extensión Tríceps Polea', series: '3 x 12 reps', descanso: '60s', grupo: 'Brazos' }
    ],
    dia2: [
      { id: 'd2-1', nombre: 'Prensa de Pierna 45° Hammer Strength', series: '4 x 12 reps', descanso: '90s', grupo: 'Cuádriceps' },
      { id: 'd2-2', nombre: 'Peso Muerto Rumano con Mancuernas', series: '4 x 10 reps', descanso: '90s', grupo: 'Isquiotibiales' },
      { id: 'd2-3', nombre: 'Zancadas Estáticas Alternadas', series: '3 x 12 c/pierna', descanso: '60s', grupo: 'Glúteos' },
      { id: 'd2-4', nombre: 'Elevación de Talones de Pie', series: '4 x 15 reps', descanso: '45s', grupo: 'Pantorrilla' }
    ],
    dia3: [
      { id: 'd3-1', nombre: 'Caminadora Matrix T70 (Intervalos)', series: '20 min · Zona 2–3', descanso: 'Continuo', grupo: 'Cardio' },
      { id: 'd3-2', nombre: 'Remo Concept2 Metabólico', series: '4 x 500 m', descanso: '60s', grupo: 'Resistencia' },
      { id: 'd3-3', nombre: 'Plancha Abdominal Isométrica', series: '3 x 45 seg', descanso: '45s', grupo: 'Core' },
      { id: 'd3-4', nombre: 'Movilidad Articular & Estiramiento', series: '10 minutos', descanso: 'Final', grupo: 'Recuperación' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  cargarEstadoExterno();
  renderizarPerfilExterno();
  renderizarRutinaExterno();
  renderizarClasesExterno();

  // Si aún no ha respondido si es estudiante interno o externo, preguntar al abrir el panel
  if (!estadoExterno.usuario.tipo_confirmado) {
    setTimeout(() => abrirModalTipoEstudiante(), 350);
  }
});

function cargarEstadoExterno() {
  try {
    const sesionStr = localStorage.getItem('vitalgym_sesion');
    if (sesionStr) {
      const u = JSON.parse(sesionStr);
      if (u && u.nombres) {
        estadoExterno.usuario.nombres = u.nombres || estadoExterno.usuario.nombres;
        estadoExterno.usuario.apellidos = u.apellidos || '';
        estadoExterno.usuario.numero_documento = u.numero_documento || estadoExterno.usuario.numero_documento;
        estadoExterno.usuario.correo = u.correo || estadoExterno.usuario.correo;
        estadoExterno.usuario.plan = u.plan || estadoExterno.usuario.plan;
        if (u.tipo_estudiante === 'interno' || u.tipo_estudiante === 'externo') {
          estadoExterno.usuario.tipo_estudiante = u.tipo_estudiante;
          estadoExterno.usuario.tipo_confirmado = true;
        }
        if (u.imc) estadoExterno.usuario.imc = parseFloat(u.imc) || 23.4;
        if (u.asistencias) estadoExterno.usuario.asistencias = parseInt(u.asistencias, 10) || 8;
      }
    }

    const prefGuardada = localStorage.getItem('vitalgym_tipo_estudiante');
    if (prefGuardada === 'interno' || prefGuardada === 'externo') {
      estadoExterno.usuario.tipo_estudiante = prefGuardada;
      estadoExterno.usuario.tipo_confirmado = true;
    }

    const ejGuardados = localStorage.getItem('vitalgym_ext_ejercicios');
    if (ejGuardados) {
      estadoExterno.ejerciciosCompletados = JSON.parse(ejGuardados) || {};
    }

    const clasesGuardadas = localStorage.getItem('vitalgym_ext_clases');
    if (clasesGuardadas) {
      const parsed = JSON.parse(clasesGuardadas);
      if (Array.isArray(parsed) && parsed.length > 0) {
        estadoExterno.clases = parsed;
      }
    }
  } catch (err) {
    console.warn('Error cargando sesión externa:', err);
  }
}

function guardarEstadoExterno() {
  try {
    const sesionActual = JSON.parse(localStorage.getItem('vitalgym_sesion') || '{}');
    const actualizada = {
      ...sesionActual,
      nombres: estadoExterno.usuario.nombres,
      apellidos: estadoExterno.usuario.apellidos,
      numero_documento: estadoExterno.usuario.numero_documento,
      correo: estadoExterno.usuario.correo,
      rol: sesionActual.rol || 'socio',
      tipo_estudiante: estadoExterno.usuario.tipo_estudiante,
      imc: String(estadoExterno.usuario.imc),
      asistencias: estadoExterno.usuario.asistencias,
      codigo_qr_token: generarTokenQR()
    };
    localStorage.setItem('vitalgym_sesion', JSON.stringify(actualizada));
    localStorage.setItem('vitalgym_tipo_estudiante', estadoExterno.usuario.tipo_estudiante);
    localStorage.setItem('vitalgym_ext_ejercicios', JSON.stringify(estadoExterno.ejerciciosCompletados));
    localStorage.setItem('vitalgym_ext_clases', JSON.stringify(estadoExterno.clases));
  } catch (err) {
    console.warn('No se pudo persistir el estado:', err);
  }
}

function generarTokenQR() {
  const prefijo = estadoExterno.usuario.tipo_estudiante === 'interno' ? 'QR-INT' : 'QR-EXT';
  return `${prefijo}-${estadoExterno.usuario.numero_documento || '1088990011'}`;
}

function seleccionarModalidadEstudiante(tipo, mostrarAviso = false) {
  if (tipo !== 'interno' && tipo !== 'externo') return;
  estadoExterno.usuario.tipo_estudiante = tipo;
  estadoExterno.usuario.tipo_confirmado = true;
  guardarEstadoExterno();
  renderizarPerfilExterno();

  if (mostrarAviso) {
    const etiqueta = tipo === 'interno' ? 'Estudiante Interno (Internado La Angostura)' : 'Estudiante Externo (Jornada Diurna / Comunidad)';
    mostrarToastExterno(`Modalidad actualizada: ${etiqueta}`);
  }
}
window.seleccionarModalidadEstudiante = seleccionarModalidadEstudiante;

function abrirModalTipoEstudiante() {
  const modal = document.getElementById('modal-tipo-estudiante');
  if (modal) modal.classList.remove('hidden');
}
window.abrirModalTipoEstudiante = abrirModalTipoEstudiante;

function cerrarModalTipoEstudiante() {
  const modal = document.getElementById('modal-tipo-estudiante');
  if (modal) modal.classList.add('hidden');
}
window.cerrarModalTipoEstudiante = cerrarModalTipoEstudiante;

function renderizarPerfilExterno() {
  const u = estadoExterno.usuario;
  const esInterno = u.tipo_estudiante === 'interno';
  const nombreCompleto = `${u.nombres} ${u.apellidos}`.trim();
  const iniciales = ((u.nombres || 'U').charAt(0) + (u.apellidos ? u.apellidos.charAt(0) : 'E')).toUpperCase();
  const qrToken = generarTokenQR();

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt('ext-header-avatar', iniciales);
  setTxt('ext-banner-avatar', iniciales);
  setTxt('carnet-iniciales', iniciales);
  setTxt('ext-header-nombre', nombreCompleto);
  setTxt('ext-banner-nombre', nombreCompleto);
  setTxt('carnet-nombre', nombreCompleto);
  setTxt('ext-banner-doc', u.numero_documento);
  setTxt('carnet-doc', `Doc: ${u.numero_documento}`);
  setTxt('carnet-qr-token', qrToken);
  setTxt('kpi-asistencias', String(u.asistencias));
  setTxt('kpi-imc', Number(u.imc).toFixed(1));
  setTxt('kpi-imc-estado', clasificarImcTexto(u.imc));
  setTxt('kpi-clases', String(estadoExterno.clases.filter(c => c.reservada).length));

  const headerBadge = document.getElementById('header-badge-modalidad');
  const bannerBadge = document.getElementById('ext-banner-badge-tipo');
  const carnetChip = document.getElementById('carnet-chip-tipo');
  const btnInt = document.getElementById('btn-switch-interno');
  const btnExt = document.getElementById('btn-switch-externo');

  if (esInterno) {
    setTxt('ext-header-sub', 'Estudiante Interno · Internado');
    setTxt('carnet-subtitulo', 'Pase Estudiante Interno');
    setTxt('kpi-modalidad', 'Est. Interno');
    setTxt('kpi-modalidad-sub', 'Internado SENA');
    setTxt('ext-switch-nota', 'Interno: acceso extendido en madrugada (5:30 AM) y noche hasta 9:00 PM.');
    setTxt('titulo-condiciones-modalidad', 'Beneficios Estudiante Interno');

    const horarioEl = document.getElementById('ext-banner-horario-texto');
    if (horarioEl) {
      horarioEl.innerHTML = `<svg class="w-3.5 h-3.5 text-[#65e33d] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Horario Internado: Lun–Vie 5:30 AM – 9:00 PM · Sáb 7:00 AM – 2:00 PM</span>`;
    }

    if (headerBadge) {
      headerBadge.textContent = 'INTERNO';
      headerBadge.className = 'text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-[#236900] border border-emerald-200';
    }
    if (bannerBadge) {
      bannerBadge.textContent = 'Estudiante Interno · Internado SENA';
      bannerBadge.className = 'text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#39A900]/30 text-[#65e33d] border border-[#5bce48]/45';
    }
    if (carnetChip) {
      carnetChip.textContent = 'ESTUDIANTE INTERNO';
      carnetChip.className = 'inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-[#236900] border border-emerald-200';
    }
    if (btnInt && btnExt) {
      btnInt.className = 'py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 bg-[#39A900] text-white shadow-md';
      btnExt.className = 'py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10';
    }
  } else {
    setTxt('ext-header-sub', 'Estudiante Externo');
    setTxt('carnet-subtitulo', 'Pase Estudiante Externo');
    setTxt('kpi-modalidad', 'Est. Externo');
    setTxt('kpi-modalidad-sub', 'Jornada Diurna');
    setTxt('ext-switch-nota', 'Externo: jornada diurna (6:00 AM – 8:00 PM) y reserva de clases.');
    setTxt('titulo-condiciones-modalidad', 'Beneficios Estudiante Externo');

    const horarioEl = document.getElementById('ext-banner-horario-texto');
    if (horarioEl) {
      horarioEl.innerHTML = `<svg class="w-3.5 h-3.5 text-[#65e33d] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Horario Externo: Lun–Vie 6:00 AM – 8:00 PM · Sáb 7:00 AM – 1:00 PM</span>`;
    }

    if (headerBadge) {
      headerBadge.textContent = 'EXTERNO';
      headerBadge.className = 'text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200';
    }
    if (bannerBadge) {
      bannerBadge.textContent = 'Estudiante Externo · Diurno / Comunidad';
      bannerBadge.className = 'text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/35';
    }
    if (carnetChip) {
      carnetChip.textContent = 'ESTUDIANTE EXTERNO';
      carnetChip.className = 'inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200';
    }
    if (btnInt && btnExt) {
      btnExt.className = 'py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 bg-[#39A900] text-white shadow-md';
      btnInt.className = 'py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10';
    }
  }

  const listaBeneficios = document.getElementById('lista-beneficios-modalidad');
  if (listaBeneficios) {
    const items = esInterno
      ? [
          'Acceso prioritario en franja temprana (5:30 AM) y nocturna (hasta 9:00 PM).',
          'Uso gratuito de casilleros durante la estancia en el internado.',
          'Carnet QR de Internado sincronizado con Bienestar al Aprendiz.',
          'Reserva preferencial en clases grupales y valoración IMC mensual.'
        ]
      : [
          'Acceso en jornada diurna (6:00 AM – 8:00 PM) y sábados (7:00 AM – 1:00 PM).',
          'Ingreso ágil por portería y recepción presentando tu Carnet QR Externo.',
          'Acceso completo a zona de musculación, cardio y salón de spinning.',
          'Seguimiento de IMC estándar OMS y rutinas guiadas sin costo.'
        ];

    listaBeneficios.innerHTML = items.map(txt => `
      <li class="flex items-start gap-2.5">
        <svg class="w-4 h-4 text-[#39A900] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        <span>${txt}</span>
      </li>
    `).join('');
  }
}

function cambiarDiaRutinaExterno(dia) {
  estadoExterno.diaActivo = dia;
  ['dia1', 'dia2', 'dia3'].forEach(d => {
    const btn = document.getElementById(`ext-btn-${d}`);
    if (!btn) return;
    if (d === dia) {
      btn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#39A900] text-white shadow-sm transition';
    } else {
      btn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition';
    }
  });
  renderizarRutinaExterno();
}
window.cambiarDiaRutinaExterno = cambiarDiaRutinaExterno;

function renderizarRutinaExterno() {
  const cont = document.getElementById('ext-lista-ejercicios');
  if (!cont) return;
  const lista = estadoExterno.rutinas[estadoExterno.diaActivo] || [];
  let hechos = 0;

  cont.innerHTML = lista.map(ej => {
    const checked = !!estadoExterno.ejerciciosCompletados[ej.id];
    if (checked) hechos++;
    return `
      <label class="flex items-center justify-between gap-4 p-4 rounded-2xl border ${checked ? 'bg-emerald-50/70 border-[#39A900]/40' : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'} cursor-pointer transition">
        <div class="flex items-center gap-3.5">
          <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleEjercicioExterno('${ej.id}')" class="h-5 w-5 rounded-md border-slate-300 text-[#39A900] focus:ring-[#39A900]">
          <div>
            <p class="text-sm font-bold ${checked ? 'line-through text-slate-400' : 'text-slate-900'}">${ej.nombre}</p>
            <p class="text-xs text-slate-500 mt-0.5">${ej.series} · Descanso ${ej.descanso}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
          ${ej.grupo}
        </span>
      </label>
    `;
  }).join('');

  const pct = lista.length ? Math.round((hechos / lista.length) * 100) : 0;
  const barra = document.getElementById('ext-rutina-progreso-barra');
  const txt = document.getElementById('ext-rutina-progreso-texto');
  if (barra) barra.style.width = `${pct}%`;
  if (txt) txt.textContent = `${pct}% completado (${hechos}/${lista.length})`;
}

function toggleEjercicioExterno(id) {
  estadoExterno.ejerciciosCompletados[id] = !estadoExterno.ejerciciosCompletados[id];
  guardarEstadoExterno();
  renderizarRutinaExterno();
}
window.toggleEjercicioExterno = toggleEjercicioExterno;

function renderizarClasesExterno() {
  const cont = document.getElementById('ext-grid-clases');
  if (!cont) return;

  cont.innerHTML = estadoExterno.clases.map(cl => `
    <div class="p-5 rounded-2xl border ${cl.reservada ? 'border-[#39A900] bg-emerald-50/30' : 'border-slate-200/80 bg-slate-50/40'} flex flex-col justify-between gap-4 transition">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[#236900]">${cl.zona}</span>
          <span class="font-mono text-[11px] font-bold ${cl.cupos > 0 ? 'text-slate-600' : 'text-rose-600'}">${cl.cupos} libres</span>
        </div>
        <h4 class="font-display text-base font-extrabold text-slate-900">${cl.nombre}</h4>
        <p class="text-xs text-slate-500">${cl.horario} · ${cl.instructor}</p>
      </div>
      <button type="button" onclick="toggleReservaClaseExterna(${cl.id})" class="w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition active:scale-95 ${
        cl.reservada
          ? 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50'
          : 'bg-[#39A900] hover:bg-[#2e8700] text-white shadow-sm'
      }">
        ${cl.reservada ? 'Cupo Reservado · Cancelar' : 'Reservar Cupo Gratis'}
      </button>
    </div>
  `).join('');

  const kpiClases = document.getElementById('kpi-clases');
  if (kpiClases) {
    kpiClases.textContent = String(estadoExterno.clases.filter(c => c.reservada).length);
  }
}

function toggleReservaClaseExterna(id) {
  const clase = estadoExterno.clases.find(c => c.id === id);
  if (!clase) return;
  if (clase.reservada) {
    clase.reservada = false;
    clase.cupos += 1;
    mostrarToastExterno(`Reserva cancelada en ${clase.nombre}`);
  } else if (clase.cupos > 0) {
    clase.reservada = true;
    clase.cupos -= 1;
    mostrarToastExterno(`Cupo confirmado en ${clase.nombre}`);
  }
  guardarEstadoExterno();
  renderizarClasesExterno();
}
window.toggleReservaClaseExterna = toggleReservaClaseExterna;

function registrarAsistenciaExterna() {
  estadoExterno.usuario.asistencias += 1;
  guardarEstadoExterno();
  renderizarPerfilExterno();
  const tipoLabel = estadoExterno.usuario.tipo_estudiante === 'interno' ? 'Interno' : 'Externo';
  mostrarToastExterno(`Ingreso registrado (${tipoLabel}) · Total: ${estadoExterno.usuario.asistencias} asistencias`);
}
window.registrarAsistenciaExterna = registrarAsistenciaExterna;

function actualizarImcExterno(e) {
  e.preventDefault();
  const peso = parseFloat(document.getElementById('ext-peso').value);
  const alturaCm = parseFloat(document.getElementById('ext-altura').value);
  if (!peso || !alturaCm || alturaCm < 80) return;
  const alturaM = alturaCm / 100;
  const imc = Number((peso / (alturaM * alturaM)).toFixed(1));
  estadoExterno.usuario.imc = imc;
  guardarEstadoExterno();
  renderizarPerfilExterno();
  mostrarToastExterno(`IMC actualizado: ${imc} (${clasificarImcTexto(imc)})`);
}
window.actualizarImcExterno = actualizarImcExterno;

function clasificarImcTexto(imc) {
  if (imc < 18.5) return 'Bajo Peso';
  if (imc < 25) return 'Peso Saludable';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidad';
}

function cerrarSesionExterno() {
  localStorage.removeItem('vitalgym_sesion');
}
window.cerrarSesionExterno = cerrarSesionExterno;

function mostrarToastExterno(mensaje) {
  const toast = document.getElementById('ext-toast');
  const msg = document.getElementById('ext-toast-msg');
  if (!toast || !msg) return;
  msg.textContent = mensaje;
  toast.classList.remove('hidden');
  clearTimeout(window.__extToastTimer);
  window.__extToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}
