/**
 * VITALGYM - ASISTENTE VIRTUAL VITALBOT
 * SENA Centro de Formación Agroindustrial - La Angostura (Ficha ADSO 3312595)
 */

(function () {
  'use strict';

  const respuestasVitalBot = [
    {
      claves: ['hola', 'buenos dias', 'buenas tardes', 'buenas', 'saludos', 'hey', 'inicio'],
      responder: function (user) {
        var nombre = user && user.nombres ? user.nombres : 'Santiago';
        return '¡Hola ' + nombre + '! 👋 Soy **VitalBot**, tu asistente y entrenador virtual en **VitalGym SENA La Angostura**.\n\nPuedo ayudarte con tus rutinas de entrenamiento, horarios de sede, ranking de puntos, cálculo de IMC o dudas de tu plan. ¿Qué consulta deseas hacer hoy?';
      }
    },
    {
      claves: ['rutina', 'ejercicio', 'entrenamiento', 'toca hoy', 'push', 'pull', 'legs', 'pecho', 'espalda', 'pierna'],
      responder: function () {
        return '🏋️‍♂️ **Plan de Entrenamiento Push-Pull-Legs (HU-05):**\n\n' +
          '• **Día 1 (Empuje):** Press banca plano (4x8-10), Press militar hombros (3x10-12), Elevaciones laterales (4x12-15), Extensión tríceps polea (3x12-15).\n' +
          '• **Día 2 (Tracción):** Jalón al pecho (4x10-12), Remo con barra Pendlay (4x8-10), Curl bíceps con barra Z (3x10-12).\n' +
          '• **Día 3 (Pierna & Core):** Sentadilla trasera con barra (4x6-8), Prensa 45° (4x10-12), Plancha abdominal isométrica (3x45s).\n\n' +
          '💡 *Descansa de 90 a 120s entre series pesadas y mantén una cadencia controlada (tempo 3-0-1-0).*';
      }
    },
    {
      claves: ['puntos', 'ranking', 'lideres', 'constancia', 'posicion', 'oro', 'plata', 'bronce'],
      responder: function (user) {
        var puntos = user && user.puntos_constancia ? user.puntos_constancia : 260;
        return '🏆 **Sistema de Constancia y Gamificación (HU-09):**\n\n' +
          '• Acumulas actualmente: **' + puntos + ' Puntos de Constancia**.\n' +
          '• **¿Cómo sumar más puntos?**\n' +
          '  - +10 pts por cada sesión de entrenamiento completada.\n' +
          '  - +80 a +100 pts al finalizar los retos mensuales del SENA.\n' +
          '  - +5 pts al registrar tu asistencia puntual por torniquete.\n\n' +
          '🥇 *¡Lideras el Ranking ADSO con 260 pts e insignia Oro Institucional!*';
      }
    },
    {
      claves: ['horario', 'horarios', 'abren', 'cierran', 'atencion', 'hora'],
      responder: function () {
        return '⏰ **Horarios de Atención VitalGym SENA:**\n\n' +
          '• **Lunes a Viernes:** 06:00 AM – 09:00 PM (Jornada Continua)\n' +
          '• **Sábados:** 07:00 AM – 01:00 PM\n' +
          '• **Domingos y Festivos:** Mantenimiento técnico preventivo.\n\n' +
          '📍 *Ubicación:* Complejo Deportivo, Centro de Formación Agroindustrial La Angostura (Campoalegre, Huila).';
      }
    },
    {
      claves: ['aforo', 'capacidad', 'personas', 'torniquete', 'ocupacion'],
      responder: function () {
        return '👥 **Control de Aforo en Tiempo Real (HU-03):**\n\n' +
          '• **Capacidad Máxima Permitida:** 35 personas simultáneas.\n' +
          '• **Ocupación Actual Promedio:** 14 a 22 aprendices activos.\n' +
          '• **Validación:** Ingreso automático mediante documento de identidad o lector de Código QR institucional en torniquete.';
      }
    },
    {
      claves: ['planes', 'plan', 'precio', 'costo', 'membresia', 'gratis', 'pagar'],
      responder: function () {
        return '💳 **Planes Institucionales VitalGym:**\n\n' +
          '🎉 **¡100% Gratuito para toda la Comunidad SENA!**\n' +
          '• **Plan Bronce:** Acceso libre a zonas de musculación, cardio y casilleros.\n' +
          '• **Plan Plata:** Incluye valoración antropométrica y reserva de clases grupales.\n' +
          '• **Plan Oro Institucional:** Acceso total, rutinas personalizadas, retos y ranking de líderes.\n\n' +
          'Todo aprendiz de la Ficha ADSO 3312595 cuenta con Plan Oro activo automáticamente.';
      }
    },
    {
      claves: ['clase', 'clases', 'spinning', 'funcional', 'yoga', 'reserva', 'cupo'],
      responder: function () {
        return '🧘‍♀️ **Clases Grupales Dirigidas (HU-07):**\n\n' +
          '1. **Spinning Indoor Pro:** Lunes, Miércoles y Viernes · 06:30 AM (Instructora Martha Rivera).\n' +
          '2. **Funcional & HIIT La Angostura:** Martes y Jueves · 07:00 AM.\n' +
          '3. **Yoga & Flexibilidad Zen:** Sábados · 08:00 AM.\n\n' +
          'Puedes reservar tu cupo con 1 clic en la sección de Clases Grupales del portal.';
      }
    },
    {
      claves: ['imc', 'peso', 'estatura', 'antropometrica', 'grasa', 'musculo'],
      responder: function () {
        return '📊 **Valoración Antropométrica (HU-04):**\n\n' +
          'El Índice de Masa Corporal (IMC) se calcula: **Peso (kg) ÷ [Estatura (m)]²**.\n\n' +
          '• **< 18.5:** Bajo Peso\n' +
          '• **18.5 – 24.9:** Peso Normal / Saludable\n' +
          '• **25.0 – 29.9:** Sobrepeso (Grado I)\n' +
          '• **≥ 30.0:** Obesidad\n\n' +
          'Santiago Hernández registra **IMC 25.6** con 78.5 kg y 175 cm, mostrando un aumento progresivo de masa muscular magra (+2.4% este mes).';
      }
    },
    {
      claves: ['nutricion', 'dieta', 'comer', 'proteina', 'suplemento', 'creatina'],
      responder: function () {
        return '🥗 **Consejos Nutricionales VitalGym:**\n\n' +
          '• **Proteína Diaria:** Consume entre 1.6g y 2.0g de proteína por kg de peso corporal (huevos, pollo, atún, legumbres, queso campesino).\n' +
          '• **Hidratación:** Mínimo 2.5 a 3 litros de agua al día, especialmente en el clima cálido de La Angostura.\n' +
          '• **Pre-entreno:** Carbohidratos complejos 1 hora antes (avena, banano o fruta).\n' +
          '• **Descanso:** Duerme entre 7 y 8 horas; el músculo se repara y crece durante el sueño profundo.';
      }
    },
    {
      claves: ['santiago', 'quien soy', 'mi cuenta', '1107530057', 'perfil'],
      responder: function () {
        return '👤 **Ficha del Aprendiz Autenticado:**\n\n' +
          '• **Nombre:** Santiago Hernández Vargas\n' +
          '• **Documento:** 1107530057 (Convenio ADSO 3312595)\n' +
          '• **Membresía:** Plan Oro Activo (Sin Costo)\n' +
          '• **Puntaje Actual:** 260 Puntos (Puesto #1 en el Ranking)\n' +
          '• **Asistencias del Mes:** 20 sesiones completadas\n' +
          '• **Código QR:** QR-APR-1107530057';
      }
    },
    {
      claves: ['gracias', 'muchas gracias', 'vale', 'ok', 'listo', 'perfecto'],
      responder: function () {
        return '¡Con mucho gusto! 💪 Recuerda que la constancia y la disciplina vencen al talento. ¡A darle con toda en el entrenamiento de hoy! Si tienes más preguntas, aquí estaré. 🔥';
      }
    }
  ];

  function procesarPreguntaVitalBot(texto) {
    var textoLimpio = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    var sesion = null;
    try {
      sesion = JSON.parse(localStorage.getItem('vitalgym_sesion') || 'null');
    } catch (_) {}

    for (var i = 0; i < respuestasVitalBot.length; i++) {
      var item = respuestasVitalBot[i];
      for (var j = 0; j < item.claves.length; j++) {
        var clave = item.claves[j];
        var claveLimpia = clave.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (textoLimpio.indexOf(claveLimpia) !== -1) {
          return item.responder(sesion);
        }
      }
    }

    return 'Entendido. Como asistente virtual de **VitalGym SENA**, puedo resolver tus dudas sobre:\n\n' +
      '• 🏋️ **Rutinas:** Ejercicios del día, series, repeticiones y descansos.\n' +
      '• 🏆 **Puntos:** Cómo subir en el ranking y completar retos.\n' +
      '• ⏰ **Horarios & Aforo:** Capacidad de torniquetes y sedes.\n' +
      '• 💳 **Planes:** Membresías gratuitas institucionales SENA.\n' +
      '• 📊 **Valoración IMC:** Métricas y evolución corporal.\n\n' +
      '*Intenta preguntarme: "¿Cuál es mi rutina?", "¿Cómo gano puntos?" o "¿Qué horarios tienen?"*';
  }

  function toggleVitalBot() {
    var ventana = document.getElementById('vitalbot-chat-window');
    var iconBot = document.getElementById('vitalbot-icon-bot');
    var iconClose = document.getElementById('vitalbot-icon-close');
    var pildora = document.getElementById('vitalbot-pildora-aviso');
    var input = document.getElementById('vitalbot-input');
    if (!ventana) return;

    var estaCerrado = ventana.style.display === 'none' || 
                      ventana.classList.contains('pointer-events-none') || 
                      ventana.style.opacity === '0' ||
                      getComputedStyle(ventana).display === 'none' ||
                      getComputedStyle(ventana).opacity === '0';

    if (estaCerrado) {
      // Abrir
      ventana.style.display = 'flex';
      ventana.style.opacity = '1';
      ventana.style.pointerEvents = 'auto';
      ventana.style.transform = 'scale(1)';
      ventana.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
      if (iconBot) iconBot.style.display = 'none';
      if (iconClose) iconClose.style.display = 'inline';
      if (pildora) pildora.style.display = 'none';
      if (input) setTimeout(function () { input.focus(); }, 150);
    } else {
      // Cerrar
      ventana.style.opacity = '0';
      ventana.style.pointerEvents = 'none';
      ventana.style.transform = 'scale(0.95)';
      setTimeout(function () {
        if (ventana.style.opacity === '0') {
          ventana.style.display = 'none';
        }
      }, 300);
      ventana.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
      if (iconBot) iconBot.style.display = 'inline';
      if (iconClose) iconClose.style.display = 'none';
      if (pildora) pildora.style.display = 'flex';
    }
  }

  function enviarPreguntaRapida(pregunta) {
    var input = document.getElementById('vitalbot-input');
    if (input) {
      input.value = pregunta;
      enviarMensajeVitalBot(null);
    }
  }

  function limpiarChatVitalBot() {
    var contenedor = document.getElementById('vitalbot-mensajes');
    if (!contenedor) return;
    contenedor.innerHTML = 
      '<div style="display:flex; align-items:flex-start; gap:8px;">' +
        '<div style="width:28px; height:28px; border-radius:50%; background:#dcfce7; display:flex; align-items:center; justify-content:center; font-size:14px; border:1px solid #86efac; flex-shrink:0;">' +
          '🤖' +
        '</div>' +
        '<div style="background:white; padding:12px 14px; border-radius:16px; border-top-left-radius:0; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05); color:#1e293b; max-width:85%; line-height:1.5;">' +
          '<p>Conversación reiniciada. ¿En qué más te puedo ayudar hoy? 💪</p>' +
        '</div>' +
      '</div>' +
      '<div id="vitalbot-chips-sugeridos" style="padding-left:36px; display:flex; flex-wrap:wrap; gap:6px;">' +
        '<button type="button" onclick="enviarPreguntaRapida(\'¿Cuál es mi rutina de hoy?\')" style="padding:6px 10px; border-radius:10px; background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; font-size:11px; font-weight:bold; cursor:pointer;">' +
          '🏋️‍♂️ ¿Cuál es mi rutina?' +
        '</button>' +
        '<button type="button" onclick="enviarPreguntaRapida(\'¿Cómo gano puntos de ranking?\')" style="padding:6px 10px; border-radius:10px; background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; font-size:11px; font-weight:bold; cursor:pointer;">' +
          '🏆 Puntos y Ranking' +
        '</button>' +
      '</div>';
  }

  function enviarMensajeVitalBot(e) {
    if (e && e.preventDefault) e.preventDefault();
    var input = document.getElementById('vitalbot-input');
    var contenedor = document.getElementById('vitalbot-mensajes');
    var escribiendo = document.getElementById('vitalbot-escribiendo');
    if (!input || !contenedor) return;

    var texto = input.value.trim();
    if (!texto) return;

    var escapeHtml = function (str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    var mensajeUsuarioHTML = 
      '<div style="display:flex; align-items:flex-start; justify-content:flex-end; gap:8px;">' +
        '<div style="background:linear-gradient(135deg, #236900, #39A900); color:white; padding:10px 14px; border-radius:16px; border-top-right-radius:0; box-shadow:0 2px 4px rgba(0,0,0,0.1); max-width:85%; line-height:1.5; font-size:12px;">' +
          escapeHtml(texto) +
        '</div>' +
        '<div style="width:28px; height:28px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:#475569; flex-shrink:0;">' +
          '👤' +
        '</div>' +
      '</div>';

    contenedor.insertAdjacentHTML('beforeend', mensajeUsuarioHTML);
    input.value = '';
    contenedor.scrollTop = contenedor.scrollHeight;

    if (escribiendo) escribiendo.style.display = 'block';

    setTimeout(function () {
      if (escribiendo) escribiendo.style.display = 'none';
      var respuestaTexto = procesarPreguntaVitalBot(texto);
      var formatted = respuestaTexto
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<div style="margin:8px 0;"></div>')
        .replace(/\n/g, '<br/>');

      var mensajeBotHTML = 
        '<div style="display:flex; align-items:flex-start; gap:8px;">' +
          '<div style="width:28px; height:28px; border-radius:50%; background:#dcfce7; display:flex; align-items:center; justify-content:center; font-size:14px; border:1px solid #86efac; flex-shrink:0;">' +
            '🤖' +
          '</div>' +
          '<div style="background:white; padding:12px 14px; border-radius:16px; border-top-left-radius:0; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05); color:#1e293b; max-width:85%; line-height:1.5; font-size:12px;">' +
            formatted +
          '</div>' +
        '</div>';

      contenedor.insertAdjacentHTML('beforeend', mensajeBotHTML);
      contenedor.scrollTop = contenedor.scrollHeight;
    }, 400);
  }

  // Exportar al objeto window global
  window.toggleVitalBot = toggleVitalBot;
  window.enviarPreguntaRapida = enviarPreguntaRapida;
  window.enviarMensajeVitalBot = enviarMensajeVitalBot;
  window.limpiarChatVitalBot = limpiarChatVitalBot;

  // Iniciar estado cerrado por defecto asegurando display:none al inicio
  document.addEventListener('DOMContentLoaded', function () {
    var ventana = document.getElementById('vitalbot-chat-window');
    if (ventana) {
      ventana.style.display = 'none';
    }
  });
})();