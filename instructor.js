/**
 * VITALGYM - MÓDULO INSTRUCTOR (instructor.js)
 * SENA Centro de Formación Agroindustrial - La Angostura (Ficha ADSO 3312595)
 */

// 1. ESTADO DEL INSTRUCTOR Y EVALUACIONES
const estadoInstructor = {
  instructor: {
    nombres: 'Martha',
    apellidos: 'Rivera',
    rol: 'entrenador',
    ficha: 'INSTRUCTORA TITULAR SENA'
  },

  aprendices: {
    4: {
      id: 4,
      nombres: 'Santiago',
      apellidos: 'Hernández Vargas',
      documento: '1107530057',
      ficha: '3312595',
      peso: 78.5,
      estatura: 175,
      grasa: 18.5,
      musculo: 42.0,
      pecho: 102,
      cintura: 84,
      cadera: 98,
      objetivos: 'Hipertrofia muscular y progresión en press de banca.',
      historicoPeso: [84.0, 82.5, 81.0, 78.5],
      historicoGrasa: [23.5, 21.8, 20.0, 18.5]
    },
    5: {
      id: 5,
      nombres: 'Leonardo',
      apellidos: 'González Perdomo',
      documento: '1098765432',
      ficha: '3312595',
      peso: 72.0,
      estatura: 170,
      grasa: 16.0,
      musculo: 40.5,
      pecho: 96,
      cintura: 79,
      cadera: 93,
      objetivos: 'Definición muscular y resistencia cardiovascular.',
      historicoPeso: [76.0, 74.5, 73.0, 72.0],
      historicoGrasa: [19.0, 18.0, 17.0, 16.0]
    },
    6: {
      id: 6,
      nombres: 'Germán',
      apellidos: 'Mouse',
      documento: '1012345678',
      ficha: '3312595',
      peso: 88.0,
      estatura: 178,
      grasa: 26.0,
      musculo: 36.0,
      pecho: 106,
      cintura: 94,
      cadera: 104,
      objetivos: 'Pérdida de peso y reacondicionamiento físico.',
      historicoPeso: [92.0, 90.5, 89.0, 88.0],
      historicoGrasa: [28.0, 27.2, 26.5, 26.0]
    }
  },

  aprendizSeleccionadoId: 4,
  graficoInstancia: null
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
  restaurarSesionInstructor();
  iniciarGraficoAntropometria();
  seleccionarAprendizEvaluacion(4);
});

function restaurarSesionInstructor() {
  try {
    const sesion = localStorage.getItem('vitalgym_sesion');
    if (sesion) {
      const u = JSON.parse(sesion);
      if (u) {
        const nombre = `${u.nombres || 'Martha'} ${u.apellidos || 'Rivera'}`;
        const iniciales = ((u.nombres ? u.nombres.charAt(0) : 'M') + (u.apellidos ? u.apellidos.charAt(0) : 'R')).toUpperCase();
        
        const avatarEl = document.getElementById('auth-instructor-avatar');
        const nameEl = document.getElementById('auth-instructor-name');
        const roleEl = document.getElementById('auth-instructor-role');
        const evaluadorEl = document.getElementById('evaluador-instructor-nombre');

        if (avatarEl) avatarEl.textContent = iniciales;
        if (nameEl) nameEl.textContent = nombre;
        if (roleEl) roleEl.textContent = u.rol === 'entrenador' ? 'Instructora Titular SENA' : (u.rol || 'Instructor');
        if (evaluadorEl) evaluadorEl.textContent = `Evaluador: ${nombre}`;
      }
    }
  } catch (e) {
    console.error('Error cargando instructor:', e);
  }
}

// 4. SELECCIÓN DE APRENDIZ A EVALUAR
function seleccionarAprendizEvaluacion(id) {
  estadoInstructor.aprendizSeleccionadoId = Number(id);
  const ap = estadoInstructor.aprendices[id];
  if (!ap) return;

  const nombreGrafico = document.getElementById('nombre-aprendiz-grafico');
  if (nombreGrafico) {
    nombreGrafico.textContent = `${ap.nombres} ${ap.apellidos}`;
  }

  // Cargar valores en el formulario
  const p = document.getElementById('input-peso'); if (p) p.value = ap.peso;
  const e = document.getElementById('input-estatura'); if (e) e.value = ap.estatura;
  const g = document.getElementById('input-grasa'); if (g) g.value = ap.grasa;
  const m = document.getElementById('input-musculo'); if (m) m.value = ap.musculo;
  const pe = document.getElementById('input-pecho'); if (pe) pe.value = ap.pecho;
  const ci = document.getElementById('input-cintura'); if (ci) ci.value = ap.cintura;
  const ca = document.getElementById('input-cadera'); if (ca) ca.value = ap.cadera;
  const ob = document.getElementById('input-objetivos'); if (ob) ob.value = ap.objetivos;

  // Actualizar cálculo de IMC y Gráfica evolutiva
  calcularImcEnVivo();
  actualizarGrafico(ap.historicoPeso, ap.historicoGrasa);
}
window.seleccionarAprendizEvaluacion = seleccionarAprendizEvaluacion;

// 5. CÁLCULO DE IMC EN VIVO (HU-04)
function calcularImcEnVivo() {
  const pesoInput = document.getElementById('input-peso');
  const estaturaInput = document.getElementById('input-estatura');
  const badgeImc = document.getElementById('badge-imc-resultado');
  if (!pesoInput || !estaturaInput || !badgeImc) return;

  const peso = parseFloat(pesoInput.value);
  const estatura = parseFloat(estaturaInput.value);

  if (peso > 20 && estatura > 100) {
    const estaturaMetros = estatura / 100;
    const imc = (peso / (estaturaMetros * estaturaMetros)).toFixed(2);

    let clasificacion = 'Normal / Rango Óptimo';
    let claseColor = 'bg-emerald-50 text-[#236900] border-emerald-300';

    if (imc < 18.5) {
      clasificacion = 'Bajo peso';
      claseColor = 'bg-sky-50 text-sky-700 border-sky-300';
    } else if (imc >= 25 && imc < 30) {
      clasificacion = 'Sobrepeso';
      claseColor = 'bg-amber-50 text-amber-800 border-amber-300';
    } else if (imc >= 30) {
      clasificacion = 'Obesidad';
      claseColor = 'bg-rose-50 text-rose-800 border-rose-300';
    }

    badgeImc.className = `p-3.5 rounded-2xl border ${claseColor} text-center shadow-inner transition-all`;
    badgeImc.innerHTML = `
      <span class="text-[10px] uppercase tracking-wider block font-bold">Índice de Masa Corporal (IMC)</span>
      <strong class="text-2xl font-black">${imc}</strong>
      <span class="block text-xs font-semibold">${clasificacion}</span>
    `;
  }
}
window.calcularImcEnVivo = calcularImcEnVivo;

// 6. GUARDAR VALORACIÓN ANTROPOMÉTRICA (HU-04)
async function guardarValoracionAntropometrica(e) {
  e.preventDefault();
  const peso = parseFloat(document.getElementById('input-peso').value);
  const estatura = parseFloat(document.getElementById('input-estatura').value);
  const checkConsentimiento = document.getElementById('check-consentimiento');

  if (!checkConsentimiento || !checkConsentimiento.checked) {
    alert('Es obligatorio contar con la autorización de tratamiento de datos personales (Ley 1581 de 2012).');
    return;
  }

  const id = estadoInstructor.aprendizSeleccionadoId;
  const ap = estadoInstructor.aprendices[id];
  if (ap) {
    ap.peso = peso;
    ap.estatura = estatura;
    ap.grasa = parseFloat(document.getElementById('input-grasa').value) || ap.grasa;
    ap.musculo = parseFloat(document.getElementById('input-musculo').value) || ap.musculo;
    ap.pecho = parseFloat(document.getElementById('input-pecho').value) || ap.pecho;
    ap.cintura = parseFloat(document.getElementById('input-cintura').value) || ap.cintura;
    ap.cadera = parseFloat(document.getElementById('input-cadera').value) || ap.cadera;
    ap.objetivos = document.getElementById('input-objetivos').value;

    // Actualizar último valor en el histórico
    ap.historicoPeso[ap.historicoPeso.length - 1] = peso;
    ap.historicoGrasa[ap.historicoGrasa.length - 1] = ap.grasa;
    actualizarGrafico(ap.historicoPeso, ap.historicoGrasa);
  }

  reproducirSonidoExito();
  mostrarToast(`✓ Ficha antropométrica de ${ap.nombres} actualizada exitosamente (HU-04).`, 'success');

  try {
    fetch('api.php?action=guardar_valoracion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        socio_id: id,
        peso_kg: peso,
        estatura_cm: estatura,
        porcentaje_grasa: ap.grasa,
        porcentaje_masa_muscular: ap.musculo,
        pecho_cm: ap.pecho,
        cintura_cm: ap.cintura
      })
    });
  } catch (err) {
    console.log('Valoración guardada localmente');
  }
}
window.guardarValoracionAntropometrica = guardarValoracionAntropometrica;

// 7. GRÁFICA COMPARATIVA EVOLUTIVA (CHART.JS EN VERDE SENA)
function iniciarGraficoAntropometria() {
  const canvas = document.getElementById('chart-antropometria');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');
  estadoInstructor.graficoInstancia = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Julio', 'Agosto', 'Septiembre', 'Octubre'],
      datasets: [
        {
          label: 'Peso Corporal (kg)',
          data: [84.0, 82.5, 81.0, 78.5],
          borderColor: '#39A900',
          backgroundColor: 'rgba(57, 169, 0, 0.12)',
          tension: 0.3,
          fill: true
        },
        {
          label: '% Grasa Corporal',
          data: [23.5, 21.8, 20.0, 18.5],
          borderColor: '#0284c7',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#334155', font: { size: 11, weight: 'bold' } } }
      },
      scales: {
        x: { grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#64748b' } },
        y: { grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { color: '#64748b' } }
      }
    }
  });
}

function actualizarGrafico(datosPeso, datosGrasa) {
  if (estadoInstructor.graficoInstancia) {
    estadoInstructor.graficoInstancia.data.datasets[0].data = datosPeso;
    estadoInstructor.graficoInstancia.data.datasets[1].data = datosGrasa;
    estadoInstructor.graficoInstancia.update();
  }
}

// 8. PESTAÑAS DEL INSTRUCTOR
function cambiarTabEntrenador(tab) {
  const tabs = ['valoracion', 'prescripcion', 'fotografico'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-entrenador-${t}`);
    const btn = document.getElementById(`btn-tab-entrenador-${t}`);
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
window.cambiarTabEntrenador = cambiarTabEntrenador;

// 9. PRESCRIPCIÓN DE RUTINAS (HU-05)
function guardarPrescripcionRutina(e) {
  e.preventDefault();
  const nombrePlan = document.getElementById('presc-nombre-plan').value;
  const duracion = document.getElementById('presc-duracion').value;
  const id = estadoInstructor.aprendizSeleccionadoId;
  const ap = estadoInstructor.aprendices[id];

  reproducirSonidoExito();
  mostrarToast(`✓ ¡Rutina "${nombrePlan}" formulada para ${ap.nombres}! (${duracion} semanas)`, 'success');
  cambiarTabEntrenador('valoracion');
}
window.guardarPrescripcionRutina = guardarPrescripcionRutina;

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

