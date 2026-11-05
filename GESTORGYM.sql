-- ============================================================================
-- PLATAFORMA DE GESTIÓN INTEGRAL DE GIMNASIO (GESTOR GYM)
-- SENA - Centro de Formación Agroindustrial (Regional Huila - Sede La Angostura)
-- Proyecto ADSO - Ficha: 3312595 | Instructora: Martha Rivera
-- Base de Datos: gestorgym
-- Motor: MariaDB 10.3+ / MySQL 8.0+
-- Codificación: utf8mb4 (Unicode Multilingual)111
-- Motor de Almacenamiento: InnoDB (Transaccional, ACID)
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ----------------------------------------------------------------------------
-- CREACIÓN / SELECCIÓN DE LA BASE DE DATOS
-- ----------------------------------------------------------------------------
-- ----------------------------------------------------------------------------
-- SELECCIÓN DE BASE DE DATOS (COMPATIBLE CON PHPMYADMIN / INFINITYFREE / XAMPP / LARAGON)
-- En phpMyAdmin, haga clic en su base de datos a la izquierda antes de importar.
-- ----------------------------------------------------------------------------
-- Base de datos ya seleccionada en phpMyAdmin

-- ----------------------------------------------------------------------------
-- LIMPIEZA DE TABLAS Y VISTAS PREVIAS
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS 
    `vista_tabla_lideres`, `vista_aforo_actual`, `vista_disponibilidad_clases`, 
    `vista_reporte_mensual_sena`, `vista_estado_acceso_socios`, 
    `vista_alertas_mantenimiento`, `vista_resumen_inventario_zonas`,
    `v_member_access_status`, `v_equipment_maintenance_alerts`, `v_inventory_summary_by_zone`;

DROP TABLE IF EXISTS 
    `inscripciones_retos`, `retos_deportivos`, `reservas_clases`,
    `registros_entrenamiento`, `items_rutina`, `asignaciones_rutinas`, `fotos_progreso`, 
    `fichas_antropometricas`, `planes_acondicionamiento`, `registros_acceso`, `membresias`, 
    `horarios_clases`, `clases_grupales`, `prospectos`, `bitacora_mantenimientos`, 
    `movimientos_equipos`, `equipos`, `categorias_equipos`, `ejercicios`, 
    `rutinas`, `planes`, `usuarios`, `auditoria_acciones`;

DROP TABLE IF EXISTS 
    `workout_logs`, `routine_items`, `user_routines`, `user_progress_photos`, 
    `user_metrics`, `fitness_plans`, `access_logs`, `memberships`, 
    `class_schedules`, `group_classes`, `leads`, `maintenance_logs`, 
    `equipment_movements`, `equipment`, `equipment_categories`, `exercises`, 
    `routines`, `plans`, `users`, `audit_logs`;

-- ============================================================================
-- MÓDULO 1: LANDING PAGE PÚBLICA, CAPTACIÓN Y CLASES GRUPALES
-- ============================================================================

-- 1.1 Formulario de Captación de Prospectos (Clientes Potenciales / Leads)
CREATE TABLE IF NOT EXISTS `prospectos` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nombre_completo` VARCHAR(150) NOT NULL COMMENT 'Nombre completo del prospecto',
    `telefono` VARCHAR(25) NOT NULL COMMENT 'Teléfono / WhatsApp de contacto',
    `correo` VARCHAR(150) NULL COMMENT 'Correo electrónico opcional',
    `horario_preferido` ENUM('manana', 'tarde', 'noche') NOT NULL DEFAULT 'manana' COMMENT 'Horario preferido para entrenar',
    `sede_interes` VARCHAR(100) NULL COMMENT 'Sede o sucursal de preferencia (Ej: Sede La Angostura)',
    `estado` ENUM('pendiente', 'contactado', 'clase_prueba', 'convertido', 'descartado') NOT NULL DEFAULT 'pendiente' COMMENT 'Estado comercial',
    `notas` TEXT NULL COMMENT 'Observaciones del asesor comercial',
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_prospectos_estado_fecha` (`estado`, `fecha_registro`),
    INDEX `idx_prospectos_telefono` (`telefono`)
) ENGINE=InnoDB COMMENT='Registro de prospectos y solicitudes de informaciÃ³n o clase de prueba';

-- ============================================================================
-- MÓDULO 2: GESTIÓN DE USUARIOS, ASISTENCIA, MEMBRESÃAS Y SEGUIMIENTO FÃSICO
-- ============================================================================

-- 2.1 Usuarios del Sistema (HU-01: AutenticaciÃ³n, bloqueo por intentos y roles)
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `numero_documento` VARCHAR(30) NOT NULL COMMENT 'Documento de identidad o cÃ©dula',
    `nombres` VARCHAR(80) NOT NULL,
    `apellidos` VARCHAR(80) NOT NULL,
    `correo` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(25) NULL,
    `clave_hash` VARCHAR(255) NOT NULL,
    `rol` ENUM('administrador', 'entrenador', 'recepcionista', 'aprendiz', 'socio') NOT NULL DEFAULT 'aprendiz' COMMENT 'Rol en la plataforma (HU-01)',
    `ficha_sena` VARCHAR(30) NULL COMMENT 'CÃ³digo de ficha de formaciÃ³n SENA (Ej: 3312595 ADSO)',
    `codigo_qr_token` VARCHAR(64) NOT NULL COMMENT 'Token Ãºnico para validaciÃ³n de acceso por cÃ³digo QR (HU-03)',
    `activo` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Activo, 0 = Inactivo / Dado de baja',
    `intentos_fallidos` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Contador de fallos de contraseÃ±a (HU-01: bloqueo a 3 intentos)',
    `bloqueado_hasta` DATETIME NULL COMMENT 'Fecha/hora hasta la cual se bloquea el login tras 3 intentos fallidos (HU-01)',
    `puntos_constancia` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Puntos acumulados por entrenar y cumplir retos (HU-05, HU-09)',
    `fecha_nacimiento` DATE NULL,
    `genero` ENUM('masculino', 'femenino', 'otro') NULL,
    `contacto_emergencia_nombre` VARCHAR(120) NULL,
    `contacto_emergencia_telefono` VARCHAR(25) NULL,
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_usuarios_correo` (`correo`),
    UNIQUE KEY `uk_usuarios_documento` (`numero_documento`),
    UNIQUE KEY `uk_usuarios_qr_token` (`codigo_qr_token`),
    INDEX `idx_usuarios_rol_activo` (`rol`, `activo`),
    INDEX `idx_usuarios_nombres` (`apellidos`, `nombres`),
    INDEX `idx_usuarios_puntos` (`puntos_constancia` DESC)
) ENGINE=InnoDB COMMENT='Cuentas de usuarios, autenticaciÃ³n, seguridad y puntos de constancia';

-- 1.2 CatÃ¡logo de Clases Grupales (HU-07: Clases dirigidas como cardio, funcional, spinning)
CREATE TABLE IF NOT EXISTS `clases_grupales` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL COMMENT 'Spinning Indoor, Entrenamiento Funcional, Yoga, etc.',
    `descripcion` TEXT NULL,
    `instructor_id` BIGINT UNSIGNED NULL COMMENT 'Instructor titular asignado',
    `aforo_maximo` SMALLINT UNSIGNED NOT NULL DEFAULT 25 COMMENT 'Capacidad máxima de la sala (HU-07)',
    `zona_salon` VARCHAR(80) NOT NULL DEFAULT 'SalÃ³n Principal' COMMENT 'UbicaciÃ³n fÃ­sica',
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_clases_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='CatÃ¡logo de clases grupales dirigidas';

-- 1.3 Parrilla Horaria Semanal de Clases Grupales
CREATE TABLE IF NOT EXISTS `horarios_clases` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `clase_id` INT UNSIGNED NOT NULL,
    `dia_semana` ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo') NOT NULL,
    `hora_inicio` TIME NOT NULL,
    `hora_fin` TIME NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    INDEX `idx_horarios_dia_hora` (`dia_semana`, `hora_inicio`),
    INDEX `idx_horarios_clase` (`clase_id`),
    CONSTRAINT `fk_horarios_clase` FOREIGN KEY (`clase_id`) REFERENCES `clases_grupales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Parrilla horaria semanal programada de clases';

-- 1.4 Reservas de Clases Grupales por Aprendices (HU-07: Control de aforo y cancelaciÃ³n anticipada)
CREATE TABLE IF NOT EXISTS `reservas_clases` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `horario_clase_id` BIGINT UNSIGNED NOT NULL COMMENT 'Horario seleccionado',
    `aprendiz_id` BIGINT UNSIGNED NOT NULL COMMENT 'Aprendiz que reserva su cupo',
    `fecha_clase` DATE NOT NULL COMMENT 'Fecha especÃ­fica de la sesiÃ³n reservada',
    `estado` ENUM('reservada', 'asistio', 'cancelada', 'no_asistio') NOT NULL DEFAULT 'reservada' COMMENT 'Estado de la reserva',
    `fecha_reserva` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_cancelacion` DATETIME NULL COMMENT 'Fecha/hora si cancela (mÃ­nimo 1h antes segÃºn HU-07)',
    `motivo_cancelacion` VARCHAR(255) NULL,
    INDEX `idx_reservas_fecha_horario` (`horario_clase_id`, `fecha_clase`, `estado`),
    INDEX `idx_reservas_aprendiz` (`aprendiz_id`),
    UNIQUE KEY `uk_reserva_unica` (`horario_clase_id`, `aprendiz_id`, `fecha_clase`),
    CONSTRAINT `fk_reservas_horario` FOREIGN KEY (`horario_clase_id`) REFERENCES `horarios_clases` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reservas_aprendiz` FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Reservas de cupos para clases grupales con aforo (HU-07)';

-- 2.2 CatÃ¡logo de Planes de Acondicionamiento FÃ­sico (HU-02: ParametrizaciÃ³n y vigencia)
CREATE TABLE IF NOT EXISTS `planes` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL COMMENT 'Plan Mensual, Trimestral, Anual VIP, etc.',
    `descripcion` VARCHAR(255) NULL,
    `duracion_dias` INT UNSIGNED NOT NULL COMMENT 'Vigencia en dÃ­as (HU-02)',
    `precio` DECIMAL(10, 2) NOT NULL COMMENT 'Precio o costo del plan (HU-02)',
    `horario_acceso` ENUM('todo_el_dia', 'solo_manana', 'hora_valle') NOT NULL DEFAULT 'todo_el_dia' COMMENT 'Franja horaria autorizada',
    `activo` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Activo en catÃ¡logo, 0 = Inactivo (HU-02 escenario 4)',
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='CatÃ¡logo y parametrizaciÃ³n de planes de acondicionamiento físico (HU-02)';

-- 2.3 MembresÃ­as / Suscripciones de Socios y Aprendices
CREATE TABLE IF NOT EXISTS `membresias` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` BIGINT UNSIGNED NOT NULL COMMENT 'Aprendiz / Socio titular',
    `plan_id` INT UNSIGNED NOT NULL COMMENT 'Plan contratado o asignado',
    `fecha_inicio` DATE NOT NULL COMMENT 'Fecha de inicio de vigencia',
    `fecha_fin` DATE NOT NULL COMMENT 'Fecha de finalizaciÃ³n de vigencia',
    `estado` ENUM('activa', 'vencida', 'suspendida', 'cancelada') NOT NULL DEFAULT 'activa' COMMENT 'Estado contractual',
    `metodo_pago` ENUM('efectivo', 'tarjeta', 'transferencia', 'pasarela', 'convenio_sena') NOT NULL,
    `monto_pagado` DECIMAL(10, 2) NOT NULL,
    `notas` VARCHAR(255) NULL,
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_membresias_consulta` (`usuario_id`, `estado`, `fecha_fin`),
    INDEX `idx_membresias_estado` (`estado`),
    CONSTRAINT `fk_membresias_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_membresias_plan` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Registro y vigencia de planes asignados a los usuarios';

-- 2.4 Control de Acceso, Entrada y Salida (HU-03: Permanencia y Aforo en tiempo real)
CREATE TABLE IF NOT EXISTS `registros_acceso` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que ingresa',
    `fecha_hora_acceso` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora exacta de entrada (HU-03)',
    `fecha_hora_salida` DATETIME NULL COMMENT 'Fecha y hora de salida registrada (HU-03 escenario 3)',
    `minutos_permanencia` INT UNSIGNED NULL COMMENT 'Tiempo de permanencia en minutos calculado al salir (HU-03)',
    `metodo_acceso` ENUM('escaneo_qr', 'documento_identidad', 'manual_recepcion') NOT NULL DEFAULT 'escaneo_qr',
    `acceso_concedido` TINYINT(1) NOT NULL COMMENT '1 = Autorizado, 0 = Denegado (HU-03)',
    `motivo_rechazo` VARCHAR(150) NULL COMMENT 'Causa de rechazo: Plan vencido, inactivo, etc.',
    `verificado_por_id` BIGINT UNSIGNED NULL COMMENT 'Recepcionista o administrador supervisor (HU-03)',
    INDEX `idx_accesos_usuario_fecha` (`usuario_id`, `fecha_hora_acceso`),
    INDEX `idx_accesos_fecha` (`fecha_hora_acceso`),
    INDEX `idx_accesos_concedido` (`acceso_concedido`),
    INDEX `idx_accesos_aforo` (`fecha_hora_salida`, `acceso_concedido`),
    CONSTRAINT `fk_accesos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_accesos_verificador` FOREIGN KEY (`verificado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Control de entrada y salida, tiempo de permanencia y aforo (HU-03)';

-- 2.5 Planes de Acondicionamiento FÃ­sico Personalizados (PrescripciÃ³n por Entrenador)
CREATE TABLE IF NOT EXISTS `planes_acondicionamiento` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `socio_id` BIGINT UNSIGNED NOT NULL COMMENT 'Aprendiz evaluado',
    `instructor_id` BIGINT UNSIGNED NOT NULL COMMENT 'Instructor responsable de formular el plan',
    `titulo` VARCHAR(150) NOT NULL COMMENT 'TÃ­tulo del plan personalizado',
    `objetivo` ENUM('perdida_grasa', 'hipertrofia', 'fuerza', 'rehabilitacion', 'resistencia', 'acondicionamiento_general') NOT NULL,
    `categoria_referencia_imc` VARCHAR(50) NULL COMMENT 'ClasificaciÃ³n de referencia IMC al formular',
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `duracion_semanas` TINYINT UNSIGNED NOT NULL DEFAULT 8,
    `estado` ENUM('activo', 'completado', 'pausado', 'abandonado') NOT NULL DEFAULT 'activo',
    `recomendaciones` TEXT NULL COMMENT 'Indicaciones nutricionales y descansos',
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_planes_acond_socio` (`socio_id`, `estado`),
    INDEX `idx_planes_acond_instructor` (`instructor_id`),
    CONSTRAINT `fk_planes_acond_socio` FOREIGN KEY (`socio_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_planes_acond_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='PrescripciÃ³n de acondicionamiento físico segÃºn valoraciÃ³n antropométrica';

-- 2.6 Ficha Antropométrica y Seguimiento FÃ­sico (HU-04: Cálculo de IMC y grÃ¡fica evolutiva)
CREATE TABLE IF NOT EXISTS `fichas_antropometricas` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `socio_id` BIGINT UNSIGNED NOT NULL COMMENT 'Aprendiz evaluado',
    `evaluador_id` BIGINT UNSIGNED NULL COMMENT 'Instructor que realiza la valoraciÃ³n (HU-04)',
    `plan_acondicionamiento_id` BIGINT UNSIGNED NULL COMMENT 'Plan vinculado opcional',
    `fecha_medicion` DATE NOT NULL COMMENT 'Fecha de la toma de medidas',
    `peso_kg` DECIMAL(5, 2) NOT NULL COMMENT 'Peso en kilogramos (HU-04)',
    `estatura_cm` DECIMAL(5, 2) NOT NULL COMMENT 'Estatura en centÃ­metros (HU-04)',
    `imc` DECIMAL(4, 2) GENERATED ALWAYS AS (ROUND(`peso_kg` / ((`estatura_cm` / 100) * (`estatura_cm` / 100)), 2)) STORED COMMENT 'IMC calculado automáticamente (HU-04)',
    `clasificacion_imc` VARCHAR(30) NULL COMMENT 'Bajo peso, Normal, Sobrepeso, Obesidad I/II/III (HU-04)',
    `porcentaje_grasa` DECIMAL(4, 2) NULL COMMENT 'Porcentaje de grasa corporal para comparativa evolutiva (HU-04)',
    `porcentaje_masa_muscular` DECIMAL(4, 2) NULL COMMENT 'Porcentaje de masa muscular para grÃ¡fica evolutiva (HU-04)',
    `grasa_visceral` TINYINT UNSIGNED NULL COMMENT 'Nivel de grasa visceral (1 a 30)',
    `pecho_cm` DECIMAL(5, 2) NULL COMMENT 'PerÃ­metro pecho (cm)',
    `cintura_cm` DECIMAL(5, 2) NULL COMMENT 'PerÃ­metro cintura (cm)',
    `cadera_cm` DECIMAL(5, 2) NULL COMMENT 'PerÃ­metro cadera (cm)',
    `brazo_cm` DECIMAL(5, 2) NULL COMMENT 'PerÃ­metro brazo contraÃ­do (cm)',
    `muslo_cm` DECIMAL(5, 2) NULL COMMENT 'PerÃ­metro muslo (cm)',
    `pantorrilla_cm` DECIMAL(5, 2) NULL COMMENT 'PerÃ­metro pantorrilla (cm)',
    `objetivos_individuales` TEXT NULL COMMENT 'Objetivos físicos planteados por el aprendiz',
    `notas` TEXT NULL COMMENT 'Observaciones tÃ©cnicas y evoluciÃ³n postural',
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_fichas_socio_fecha` (`socio_id`, `fecha_medicion`),
    INDEX `idx_fichas_evaluador` (`evaluador_id`),
    CONSTRAINT `fk_fichas_socio` FOREIGN KEY (`socio_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_fichas_evaluador` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_fichas_plan` FOREIGN KEY (`plan_acondicionamiento_id`) REFERENCES `planes_acondicionamiento` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Historial de valoraciones antropométricas y evoluciÃ³n fÃ­sica (HU-04)';

-- 2.7 Registro FotogrÃ¡fico de Progreso (Con Consentimiento Expreso de Datos)
CREATE TABLE IF NOT EXISTS `fotos_progreso` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `socio_id` BIGINT UNSIGNED NOT NULL COMMENT 'Aprendiz titular de la imagen',
    `ficha_antropometrica_id` BIGINT UNSIGNED NULL COMMENT 'ValoraciÃ³n antropométrica vinculada',
    `url_foto` VARCHAR(255) NOT NULL COMMENT 'Ruta o URL del archivo fotogrÃ¡fico',
    `angulo_foto` ENUM('frente', 'perfil', 'espalda', 'detalle') NOT NULL DEFAULT 'frente',
    `consentimiento_datos` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = AutorizaciÃ³n expresa del titular segÃºn ley de protecciÃ³n de datos',
    `fecha_consentimiento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_captura` DATE NOT NULL,
    `notas` VARCHAR(255) NULL,
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_fotos_socio_fecha` (`socio_id`, `fecha_captura`),
    CONSTRAINT `fk_fotos_socio` FOREIGN KEY (`socio_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_fotos_ficha` FOREIGN KEY (`ficha_antropometrica_id`) REFERENCES `fichas_antropometricas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Registro fotogrÃ¡fico del progreso bajo autorizaciÃ³n legal del titular';

-- ============================================================================
-- MÓDULO 3: BIBLIOTECA DE EJERCICIOS, RUTINAS Y GAMIFICACIÃ“N (PUNTOS)
-- ============================================================================

-- 3.1 Biblioteca de Ejercicios
CREATE TABLE IF NOT EXISTS `ejercicios` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(150) NOT NULL,
    `grupo_muscular` ENUM('pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'core', 'cardio', 'cuerpo_completo') NOT NULL,
    `equipamiento_necesario` VARCHAR(100) NULL COMMENT 'Mancuernas, Barra, MÃ¡quina guiada, Polea, Peso corporal, etc.',
    `nivel_dificultad` ENUM('principiante', 'intermedio', 'avanzado') NOT NULL DEFAULT 'principiante',
    `instrucciones` TEXT NULL COMMENT 'ExplicaciÃ³n tÃ©cnica del movimiento',
    `url_video` VARCHAR(255) NULL COMMENT 'Enlace al video explicativo o guÃ­a visual (HU-05)',
    `url_miniatura` VARCHAR(255) NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    INDEX `idx_ejercicios_grupo` (`grupo_muscular`),
    INDEX `idx_ejercicios_nivel` (`nivel_dificultad`)
) ENGINE=InnoDB COMMENT='CatÃ¡logo tÃ©cnico de ejercicios con guÃ­a visual';

-- 3.2 Constructor de Rutinas (HU-05: Plantillas estÃ¡ndar y rutinas de instructor)
CREATE TABLE IF NOT EXISTS `rutinas` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `entrenador_id` BIGINT UNSIGNED NULL COMMENT 'Instructor creador / autor',
    `nombre` VARCHAR(150) NOT NULL COMMENT 'Push-Pull-Legs, Torso-Pierna, Full Body, etc.',
    `descripcion` TEXT NULL,
    `objetivo` ENUM('hipertrofia', 'perdida_grasa', 'fuerza', 'resistencia', 'acondicionamiento_general') NOT NULL,
    `nivel` ENUM('principiante', 'intermedio', 'avanzado') NOT NULL,
    `es_plantilla` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = Plantilla estÃ¡ndar reutilizable, 0 = Rutina personalizada',
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_rutinas_plantillas` (`es_plantilla`, `objetivo`, `nivel`),
    INDEX `idx_rutinas_entrenador` (`entrenador_id`),
    CONSTRAINT `fk_rutinas_entrenador` FOREIGN KEY (`entrenador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Encabezado de rutinas de entrenamiento';

-- 3.3 Ãtems / Ejercicios de la Rutina (HU-05: Series, repeticiones, descansos y guÃ­a visual)
CREATE TABLE IF NOT EXISTS `items_rutina` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `rutina_id` BIGINT UNSIGNED NOT NULL,
    `ejercicio_id` INT UNSIGNED NOT NULL,
    `numero_dia` TINYINT UNSIGNED NOT NULL COMMENT 'DÃ­a asignado en la semana o ciclo (1 a 7) (HU-05)',
    `orden_ejecucion` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Secuencia de ejecuciÃ³n en la sesiÃ³n',
    `series` TINYINT UNSIGNED NOT NULL COMMENT 'NÃºmero de series (HU-05)',
    `repeticiones` VARCHAR(30) NOT NULL COMMENT 'Repeticiones pactadas (ej: 10-12, Al fallo, 15, 4x6) (HU-05)',
    `cadencia_tempo` VARCHAR(20) NULL COMMENT 'Ej: 3-0-1-0',
    `esfuerzo_objetivo_rpe` VARCHAR(30) NULL COMMENT 'Ej: RPE 8, RIR 2',
    `descanso_segundos` SMALLINT UNSIGNED NOT NULL DEFAULT 60 COMMENT 'Pausa entre series en segundos (HU-05)',
    `notas` VARCHAR(255) NULL COMMENT 'Instrucciones: Drop-set, biserie, etc.',
    INDEX `idx_items_rutina_orden` (`rutina_id`, `numero_dia`, `orden_ejecucion`),
    INDEX `idx_items_rutina_ejercicio` (`ejercicio_id`),
    CONSTRAINT `fk_items_rutina_padre` FOREIGN KEY (`rutina_id`) REFERENCES `rutinas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_rutina_ejercicio` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Detalle granular de ejercicios configurados en la rutina (HU-05)';

-- 3.4 Asignación de Rutinas a Aprendices (HU-05: 'Mis Rutinas')
CREATE TABLE IF NOT EXISTS `asignaciones_rutinas` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `socio_id` BIGINT UNSIGNED NOT NULL COMMENT 'Aprendiz asignado',
    `rutina_id` BIGINT UNSIGNED NOT NULL,
    `asignado_por_id` BIGINT UNSIGNED NULL COMMENT 'Instructor que prescribe la rutina',
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `es_rutina_actual` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Rutina activa actualmente desplegada en Mis Rutinas (HU-05)',
    `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_asignaciones_activa` (`socio_id`, `es_rutina_actual`),
    INDEX `idx_asignaciones_fechas` (`socio_id`, `fecha_inicio`, `fecha_fin`),
    CONSTRAINT `fk_asignaciones_socio` FOREIGN KEY (`socio_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_asignaciones_rutina` FOREIGN KEY (`rutina_id`) REFERENCES `rutinas` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_asignaciones_entrenador` FOREIGN KEY (`asignado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Historial de rutinas asignadas a los aprendices (HU-05)';

-- 3.5 Registro de Entrenamientos y FinalizaciÃ³n de SesiÃ³n (HU-05: Puntos de constancia)
CREATE TABLE IF NOT EXISTS `registros_entrenamiento` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `socio_id` BIGINT UNSIGNED NOT NULL COMMENT 'Aprendiz que ejecuta la sesiÃ³n',
    `item_rutina_id` BIGINT UNSIGNED NULL COMMENT 'VÃ­nculo opcional con el Ã­tem programado',
    `ejercicio_id` INT UNSIGNED NOT NULL,
    `fecha_hora_completado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Momento del levantamiento',
    `numero_serie` TINYINT UNSIGNED NOT NULL,
    `peso_utilizado_kg` DECIMAL(6, 2) NOT NULL COMMENT 'Carga o peso efectivo levantado',
    `repeticiones_logradas` TINYINT UNSIGNED NOT NULL COMMENT 'Repeticiones reales alcanzadas',
    `esfuerzo_rpe` TINYINT UNSIGNED NULL COMMENT 'Escala Borg 1-10',
    `sesion_finalizada` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Marcado como Entrenamiento Finalizado (HU-05 escenario 3)',
    `puntos_otorgados` INT UNSIGNED NOT NULL DEFAULT 10 COMMENT 'Puntos de constancia ganados en la sesiÃ³n (HU-05)',
    `notas` VARCHAR(255) NULL,
    INDEX `idx_registros_progreso` (`socio_id`, `ejercicio_id`, `fecha_hora_completado`),
    INDEX `idx_registros_fecha` (`fecha_hora_completado`),
    CONSTRAINT `fk_registros_socio` FOREIGN KEY (`socio_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_registros_item` FOREIGN KEY (`item_rutina_id`) REFERENCES `items_rutina` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_registros_ejercicio` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Registro de series completadas y puntos de constancia (HU-05)';

-- ============================================================================
-- MÓDULO 4: INVENTARIO DE MÃQUINAS Y MANTENIMIENTO (HU-06)
-- ============================================================================

-- 4.1 CategorÃ­as de Equipos
CREATE TABLE IF NOT EXISTS `categorias_equipos` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(80) NOT NULL UNIQUE COMMENT 'Musculación Guiada, Cardio, Peso Libre, Spinning, etc.',
    `descripcion` VARCHAR(255) NULL
) ENGINE=InnoDB COMMENT='ClasificaciÃ³n de tipos de equipamiento deportivo';

-- 4.2 CatÃ¡logo de Activos y Equipos Institucionales (HU-06: Registro de mÃ¡quina nueva y estados)
CREATE TABLE IF NOT EXISTS `equipos` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `codigo_activo` VARCHAR(50) NOT NULL COMMENT 'CÃ³digo/Tag interno Ãºnico (imprimible en etiquetas QR o barras)',
    `categoria_id` INT UNSIGNED NOT NULL,
    `nombre` VARCHAR(120) NOT NULL COMMENT 'Nombre de la mÃ¡quina o equipo (HU-06)',
    `marca` VARCHAR(80) NULL COMMENT 'Marca del fabricante (HU-06)',
    `modelo` VARCHAR(80) NULL COMMENT 'Modelo tÃ©cnico (HU-06)',
    `numero_serie` VARCHAR(100) NULL COMMENT 'NÃºmero de serie de fÃ¡brica (HU-06)',
    `fecha_compra` DATE NULL COMMENT 'Fecha de adquisiciÃ³n (HU-06)',
    `precio_compra` DECIMAL(10, 2) NULL,
    `dias_ciclo_mantenimiento` SMALLINT UNSIGNED NOT NULL DEFAULT 30 COMMENT 'Frecuencia de dÃ­as para alerta de mantenimiento preventivo (HU-06)',
    `fecha_ultimo_mantenimiento` DATE NULL COMMENT 'Fecha del Ãºltimo mantenimiento realizado',
    `vida_util_meses` INT UNSIGNED NULL COMMENT 'Vida Ãºtil estimada en meses',
    `zona_ubicacion` VARCHAR(80) NOT NULL DEFAULT 'Piso Principal' COMMENT 'Zona o Ã¡rea fÃ­sica asignada',
    `estado_operativo` ENUM('operativo', 'requiere_mantenimiento', 'en_reparacion', 'fuera_de_servicio', 'baja_definitiva') NOT NULL DEFAULT 'operativo' COMMENT 'Estado operativo (HU-06)',
    `usuario_responsable_id` BIGINT UNSIGNED NULL COMMENT 'Administrador responsable del activo',
    `notas` TEXT NULL,
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_equipos_codigo` (`codigo_activo`),
    INDEX `idx_equipos_estado_zona` (`estado_operativo`, `zona_ubicacion`),
    INDEX `idx_equipos_categoria` (`categoria_id`),
    INDEX `idx_equipos_responsable` (`usuario_responsable_id`),
    CONSTRAINT `fk_equipos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_equipos` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_equipos_responsable` FOREIGN KEY (`usuario_responsable_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Inventario general de mÃ¡quinas y equipos del gimnasio (HU-06)';

-- 4.3 Registro de Entradas, Salidas y Traslados de Equipos
CREATE TABLE IF NOT EXISTS `movimientos_equipos` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `equipo_id` BIGINT UNSIGNED NOT NULL,
    `tipo_movimiento` ENUM('entrada', 'salida', 'traslado', 'baja', 'salida_taller', 'reingreso_taller') NOT NULL,
    `cantidad` INT UNSIGNED NOT NULL DEFAULT 1,
    `estado_fisico` ENUM('nuevo', 'excelente', 'bueno', 'regular', 'danado', 'chatarra') NOT NULL DEFAULT 'bueno',
    `ubicacion_origen` VARCHAR(100) NULL,
    `ubicacion_destino` VARCHAR(100) NULL,
    `motivo` TEXT NOT NULL COMMENT 'JustificaciÃ³n: Compra, prÃ©stamo, baja, reparaciÃ³n externa, etc.',
    `usuario_responsable_id` BIGINT UNSIGNED NOT NULL COMMENT 'Administrador o tÃ©cnico que realiza/entrega el elemento',
    `autorizado_por_id` BIGINT UNSIGNED NULL COMMENT 'Administrador que autoriza el movimiento',
    `fecha_movimiento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_movimientos_equipo_fecha` (`equipo_id`, `fecha_movimiento`),
    INDEX `idx_movimientos_tipo` (`tipo_movimiento`),
    INDEX `idx_movimientos_responsable` (`usuario_responsable_id`),
    CONSTRAINT `fk_movimientos_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_movimientos_responsable` FOREIGN KEY (`usuario_responsable_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_movimientos_autorizador` FOREIGN KEY (`autorizado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Historial de entradas, salidas y traslados de inventario con responsable institucional';

-- 4.4 BitÃ¡cora de Mantenimiento y Ã“rdenes TÃ©cnicas (HU-06: Preventivo y Correctivo)
CREATE TABLE IF NOT EXISTS `bitacora_mantenimientos` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `equipo_id` BIGINT UNSIGNED NOT NULL,
    `nombre_tecnico` VARCHAR(120) NOT NULL COMMENT 'Nombre del tÃ©cnico o taller externo',
    `usuario_responsable_id` BIGINT UNSIGNED NULL COMMENT 'Administrador que supervisa y genera la orden (HU-06)',
    `tipo_mantenimiento` ENUM('preventivo', 'correctivo', 'inspeccion') NOT NULL COMMENT 'HU-06: Preventivo vs Reporte de averÃ­a correctivo',
    `fecha_programada` DATE NOT NULL COMMENT 'Fecha prevista para la revisiÃ³n',
    `fecha_ejecutada` DATE NULL COMMENT 'Fecha en que se completÃ³ el mantenimiento',
    `costo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcion` TEXT NOT NULL COMMENT 'Detalle del daÃ±o reportado o trabajo a realizar (HU-06)',
    `repuestos_utilizados` TEXT NULL COMMENT 'Guayas, poleas, lubricante, zapatas, etc.',
    `estado` ENUM('pendiente', 'en_progreso', 'completado', 'cancelado') NOT NULL DEFAULT 'pendiente',
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_mantenimientos_estado_fecha` (`estado`, `fecha_programada`),
    INDEX `idx_mantenimientos_equipo` (`equipo_id`),
    INDEX `idx_mantenimientos_tipo` (`tipo_mantenimiento`),
    CONSTRAINT `fk_mantenimientos_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_mantenimientos_responsable` FOREIGN KEY (`usuario_responsable_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Ã“rdenes de mantenimiento preventivo y correctivo de maquinaria (HU-06)';

-- ============================================================================
-- MÓDULO 5: RETOS DEPORTIVOS Y RANKING DE CONSTANCIA (HU-09)
-- ============================================================================

-- 5.1 CatÃ¡logo de Retos Deportivos Mensuales / PeriÃ³dicos (HU-09)
CREATE TABLE IF NOT EXISTS `retos_deportivos` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `titulo` VARCHAR(150) NOT NULL COMMENT 'Ej: Reto 20 Días de Fuerza, Desafío Cardio SENA 2026',
    `descripcion` TEXT NULL COMMENT 'Reglas y metas del reto deportivo',
    `meta_asistencias` SMALLINT UNSIGNED NOT NULL DEFAULT 15 COMMENT 'NÃºmero de asistencias requeridas para cumplir el reto (HU-09)',
    `puntos_recompensa` INT UNSIGNED NOT NULL DEFAULT 100 COMMENT 'Puntos sumados al perfil al completar el reto (HU-09)',
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Reto activo para inscripción (HU-09)',
    `creado_por_id` BIGINT UNSIGNED NULL COMMENT 'Administrador o entrenador autor',
    `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_retos_fechas_activo` (`activo`, `fecha_inicio`, `fecha_fin`),
    CONSTRAINT `fk_retos_creador` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Retos deportivos internos mensuales para fidelizaciÃ³n y constancia (HU-09)';

-- 5.2 Inscripciones y Cumplimiento de Retos por Aprendices (HU-09)
CREATE TABLE IF NOT EXISTS `inscripciones_retos` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `reto_id` INT UNSIGNED NOT NULL,
    `aprendiz_id` BIGINT UNSIGNED NOT NULL,
    `asistencias_completadas` SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Conteo automático de asistencias durante la vigencia (HU-09)',
    `completado` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = Meta cumplida y puntos otorgados (HU-09)',
    `fecha_inscripcion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `fecha_completado` DATETIME NULL,
    UNIQUE KEY `uk_reto_aprendiz` (`reto_id`, `aprendiz_id`),
    INDEX `idx_inscripciones_aprendiz` (`aprendiz_id`),
    CONSTRAINT `fk_inscripcion_reto` FOREIGN KEY (`reto_id`) REFERENCES `retos_deportivos` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_inscripcion_aprendiz` FOREIGN KEY (`aprendiz_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='ParticipaciÃ³n y seguimiento de metas de retos deportivos (HU-09)';

-- ============================================================================
-- AUDITORÃA Y TRAZABILIDAD (REQUERIMIENTO NO FUNCIONAL)
-- ============================================================================

-- 6.1 Registro de AuditorÃ­a de Acciones CrÃ­ticas
CREATE TABLE IF NOT EXISTS `auditoria_acciones` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` BIGINT UNSIGNED NULL COMMENT 'Usuario que ejecutÃ³ la acciÃ³n (NULL si fue el sistema)',
    `accion` VARCHAR(60) NOT NULL COMMENT 'CAMBIO_ESTADO_MEMBRESIA, BAJA_EQUIPO, BLOQUEO_INTENTOS_LOGIN, etc.',
    `nombre_tabla` VARCHAR(60) NOT NULL,
    `registro_id` BIGINT UNSIGNED NOT NULL,
    `valores_anteriores` JSON NULL,
    `valores_nuevos` JSON NULL,
    `direccion_ip` VARCHAR(45) NULL,
    `agente_usuario` VARCHAR(255) NULL,
    `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_auditoria_usuario` (`usuario_id`),
    INDEX `idx_auditoria_tabla_registro` (`nombre_tabla`, `registro_id`),
    INDEX `idx_auditoria_fecha` (`fecha_registro`),
    CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Pista de auditorÃ­a para seguridad y cumplimiento normativo';

-- ============================================================================
-- VISTAS ESTRATÃ‰GICAS (VIEWS PARA HISTORIAS DE USUARIO EN ESPAÃ‘OL)
-- ============================================================================

-- Vista 1: Tabla de Líderes y Ranking de Constancia (HU-09)
CREATE TABLE IF NOT EXISTS `vista_tabla_lideres` AS
SELECT 
    u.id AS aprendiz_id,
    u.numero_documento,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo,
    u.ficha_sena,
    u.puntos_constancia,
    COUNT(DISTINCT ir.reto_id) AS retos_inscritos,
    SUM(CASE WHEN ir.completado = 1 THEN 1 ELSE 0 END) AS retos_completados,
    COUNT(DISTINCT ra.id) AS asistencias_totales,
    DENSE_RANK() OVER (ORDER BY u.puntos_constancia DESC, COUNT(DISTINCT ra.id) DESC) AS posicion_ranking
FROM usuarios u
LEFT JOIN inscripciones_retos ir ON ir.aprendiz_id = u.id
LEFT JOIN registros_acceso ra ON ra.usuario_id = u.id AND ra.acceso_concedido = 1
WHERE u.rol IN ('aprendiz', 'socio') AND u.activo = 1
GROUP BY u.id, u.numero_documento, u.nombres, u.apellidos, u.ficha_sena, u.puntos_constancia
ORDER BY posicion_ranking ASC;

-- Vista 2: Aforo Actual del Gimnasio en Tiempo Real (HU-03)
CREATE TABLE IF NOT EXISTS `vista_aforo_actual` AS
SELECT 
    COUNT(ra.id) AS aforo_actual,
    MAX(ra.fecha_hora_acceso) AS ultimo_ingreso,
    (SELECT COUNT(*) FROM usuarios WHERE rol IN ('aprendiz', 'socio') AND activo = 1) AS total_aprendices_registrados
FROM registros_acceso ra
WHERE ra.acceso_concedido = 1
  AND DATE(ra.fecha_hora_acceso) = CURDATE()
  AND ra.fecha_hora_salida IS NULL;

-- Vista 3: Disponibilidad y Aforo de Clases Grupales (HU-07)
CREATE TABLE IF NOT EXISTS `vista_disponibilidad_clases` AS
SELECT 
    hc.id AS horario_clase_id,
    cg.id AS clase_id,
    cg.nombre AS nombre_clase,
    cg.zona_salon,
    hc.dia_semana,
    hc.hora_inicio,
    hc.hora_fin,
    CONCAT(u.nombres, ' ', u.apellidos) AS instructor_nombre,
    cg.aforo_maximo,
    COUNT(rc.id) AS cupos_reservados,
    GREATEST(0, cg.aforo_maximo - COUNT(rc.id)) AS cupos_disponibles,
    CASE 
        WHEN COUNT(rc.id) >= cg.aforo_maximo THEN 'Cupos Agotados'
        ELSE 'Disponible'
    END AS estado_cupos
FROM horarios_clases hc
INNER JOIN clases_grupales cg ON cg.id = hc.clase_id
LEFT JOIN usuarios u ON u.id = cg.instructor_id
LEFT JOIN reservas_clases rc ON rc.horario_clase_id = hc.id 
    AND rc.fecha_clase = CURDATE() 
    AND rc.estado = 'reservada'
WHERE hc.activo = 1 AND cg.activo = 1
GROUP BY hc.id, cg.id, cg.nombre, cg.zona_salon, hc.dia_semana, hc.hora_inicio, hc.hora_fin, u.nombres, u.apellidos, cg.aforo_maximo;

-- Vista 4: ValidaciÃ³n de MembresÃ­as para Acceso en RecepciÃ³n (HU-03)
CREATE TABLE IF NOT EXISTS `vista_estado_acceso_socios` AS
SELECT 
    u.id AS usuario_id,
    u.numero_documento,
    u.codigo_qr_token,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo,
    u.ficha_sena,
    u.activo AS usuario_activo,
    u.bloqueado_hasta,
    m.id AS membresia_id,
    m.estado AS estado_membresia,
    m.fecha_inicio,
    m.fecha_fin,
    p.nombre AS nombre_plan,
    p.horario_acceso,
    CASE 
        WHEN u.activo = 0 THEN 0
        WHEN u.bloqueado_hasta IS NOT NULL AND u.bloqueado_hasta > NOW() THEN 0
        WHEN m.estado = 'activa' AND m.fecha_fin >= CURDATE() AND m.fecha_inicio <= CURDATE() THEN 1
        ELSE 0
    END AS acceso_autorizado,
    CASE 
        WHEN u.activo = 0 THEN 'Usuario inactivo o retirado'
        WHEN u.bloqueado_hasta IS NOT NULL AND u.bloqueado_hasta > NOW() THEN 'Acceso bloqueado por intentos fallidos'
        WHEN m.id IS NULL THEN 'Sin plan asignado'
        WHEN m.estado != 'activa' THEN CONCAT('Plan en estado: ', m.estado)
        WHEN m.fecha_fin < CURDATE() THEN 'Plan vencido'
        WHEN m.fecha_inicio > CURDATE() THEN 'Plan aÃºn no inicia vigencia'
        ELSE 'Acceso Concedido'
    END AS mensaje_evaluacion
FROM usuarios u
LEFT JOIN (
    SELECT m1.*
    FROM membresias m1
    INNER JOIN (
        SELECT usuario_id, MAX(fecha_fin) AS max_fecha_fin
        FROM membresias
        GROUP BY usuario_id
    ) m2 ON m1.usuario_id = m2.usuario_id AND m1.fecha_fin = m2.max_fecha_fin
) m ON u.id = m.usuario_id
LEFT JOIN planes p ON m.plan_id = p.id
WHERE u.rol IN ('aprendiz', 'socio');

-- Vista 5: Alertas de Mantenimiento de MÃ¡quinas (HU-06)
CREATE TABLE IF NOT EXISTS `vista_alertas_mantenimiento` AS
SELECT 
    m.id AS mantenimiento_id,
    m.equipo_id,
    e.codigo_activo,
    e.nombre AS nombre_equipo,
    e.marca,
    e.modelo,
    e.zona_ubicacion,
    e.estado_operativo AS estado_actual_equipo,
    m.tipo_mantenimiento,
    m.estado AS estado_mantenimiento,
    m.fecha_programada,
    m.descripcion,
    m.costo,
    m.nombre_tecnico,
    CASE 
        WHEN m.tipo_mantenimiento = 'correctivo' THEN 'MÃQUINA AVERIADA (URGENTE)'
        WHEN m.fecha_programada <= CURDATE() THEN 'MANTENIMIENTO PREVENTIVO VENCIDO'
        ELSE 'MANTENIMIENTO PREVENTIVO REQUERIDO'
    END AS alerta_titulo
FROM bitacora_mantenimientos m
INNER JOIN equipos e ON e.id = m.equipo_id
WHERE m.estado IN ('pendiente', 'en_progreso')
ORDER BY (m.tipo_mantenimiento = 'correctivo') DESC, m.fecha_programada ASC;

-- Vista 6: Reporte EstadÃ­stico Consolidado por Periodo (HU-08)
CREATE TABLE IF NOT EXISTS `vista_reporte_mensual_sena` AS
SELECT 
    DATE_FORMAT(ra.fecha_hora_acceso, '%Y-%m') AS periodo_mes,
    COUNT(DISTINCT ra.usuario_id) AS aprendices_activos_mes,
    COUNT(ra.id) AS total_asistencias,
    COALESCE((
        SELECT SUM(m.monto_pagado) 
        FROM membresias m 
        WHERE DATE_FORMAT(m.fecha_inicio, '%Y-%m') = DATE_FORMAT(ra.fecha_hora_acceso, '%Y-%m')
    ), 0.00) AS total_ingresos_periodo,
    COALESCE((
        SELECT COUNT(*) 
        FROM bitacora_mantenimientos bm 
        WHERE DATE_FORMAT(bm.fecha_programada, '%Y-%m') = DATE_FORMAT(ra.fecha_hora_acceso, '%Y-%m')
    ), 0) AS ordenes_mantenimiento_periodo,
    COALESCE((
        SELECT SUM(bm.costo) 
        FROM bitacora_mantenimientos bm 
        WHERE DATE_FORMAT(bm.fecha_programada, '%Y-%m') = DATE_FORMAT(ra.fecha_hora_acceso, '%Y-%m')
    ), 0.00) AS costo_mantenimientos_periodo
FROM registros_acceso ra
WHERE ra.acceso_concedido = 1
GROUP BY DATE_FORMAT(ra.fecha_hora_acceso, '%Y-%m');

-- ============================================================================
-- DISPARADORES AUTOMÃTICOS (TRIGGERS PARA HISTORIAS DE USUARIO)
-- ============================================================================

/* Triggers automáticos (manejados directamente por api.php en InfinityFree):
DELIMITER //

-- Trigger 1: Cálculo automático de minutos de permanencia al marcar salida (HU-03)
CREATE TRIGGER `trg_calcular_permanencia_salida`
BEFORE UPDATE ON `registros_acceso`
FOR EACH ROW
BEGIN
    IF OLD.fecha_hora_salida IS NULL AND NEW.fecha_hora_salida IS NOT NULL THEN
        SET NEW.minutos_permanencia = TIMESTAMPDIFF(MINUTE, OLD.fecha_hora_acceso, NEW.fecha_hora_salida);
    END IF;
END//

-- Trigger 2: Sumar puntos de constancia al aprendiz al finalizar entrenamiento (HU-05)
CREATE TRIGGER `trg_sumar_puntos_entrenamiento`
AFTER INSERT ON `registros_entrenamiento`
FOR EACH ROW
BEGIN
    IF NEW.sesion_finalizada = 1 AND NEW.puntos_otorgados > 0 THEN
        UPDATE `usuarios` 
        SET `puntos_constancia` = `puntos_constancia` + NEW.puntos_otorgados
        WHERE `id` = NEW.socio_id;
    END IF;
END//

-- Trigger 3: ClasificaciÃ³n automática de IMC al guardar ficha antropométrica (HU-04)
CREATE TRIGGER `trg_calcular_clasificacion_imc`
BEFORE INSERT ON `fichas_antropometricas`
FOR EACH ROW
BEGIN
    DECLARE imc_calculado DECIMAL(5,2);
    SET imc_calculado = NEW.peso_kg / ((NEW.estatura_cm / 100) * (NEW.estatura_cm / 100));

    IF imc_calculado < 18.5 THEN
        SET NEW.clasificacion_imc = 'Bajo peso';
    ELSEIF imc_calculado >= 18.5 AND imc_calculado < 25.0 THEN
        SET NEW.clasificacion_imc = 'Normal';
    ELSEIF imc_calculado >= 25.0 AND imc_calculado < 30.0 THEN
        SET NEW.clasificacion_imc = 'Sobrepeso';
    ELSEIF imc_calculado >= 30.0 AND imc_calculado < 35.0 THEN
        SET NEW.clasificacion_imc = 'Obesidad Grado I';
    ELSEIF imc_calculado >= 35.0 AND imc_calculado < 40.0 THEN
        SET NEW.clasificacion_imc = 'Obesidad Grado II';
    ELSE
        SET NEW.clasificacion_imc = 'Obesidad Grado III';
    END IF;
END//

-- Trigger 4: AuditorÃ­a de cambios en estado de membresÃ­as / planes (HU-02)
CREATE TRIGGER `trg_auditoria_cambio_estado_membresia`
AFTER UPDATE ON `membresias`
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO `auditoria_acciones` (
            `usuario_id`, `accion`, `nombre_tabla`, `registro_id`, `valores_anteriores`, `valores_nuevos`, `fecha_registro`
        ) VALUES (
            NULL,
            'CAMBIO_ESTADO_MEMBRESIA',
            'membresias',
            NEW.id,
            JSON_OBJECT('estado_anterior', OLD.estado, 'fecha_fin', OLD.fecha_fin),
            JSON_OBJECT('estado_nuevo', NEW.estado, 'fecha_fin', NEW.fecha_fin),
            NOW()
        );
    END IF;
END//

-- Trigger 5: AuditorÃ­a y trazabilidad cuando una mÃ¡quina sufre averÃ­a o baja (HU-06)
CREATE TRIGGER `trg_auditoria_baja_equipo`
AFTER UPDATE ON `equipos`
FOR EACH ROW
BEGIN
    IF OLD.estado_operativo != NEW.estado_operativo AND NEW.estado_operativo IN ('fuera_de_servicio', 'baja_definitiva', 'en_reparacion') THEN
        INSERT INTO `auditoria_acciones` (
            `usuario_id`, `accion`, `nombre_tabla`, `registro_id`, `valores_anteriores`, `valores_nuevos`, `fecha_registro`
        ) VALUES (
            NEW.usuario_responsable_id,
            'CAMBIO_ESTADO_MAQUINA',
            'equipos',
            NEW.id,
            JSON_OBJECT('estado_anterior', OLD.estado_operativo, 'codigo_activo', OLD.codigo_activo, 'zona', OLD.zona_ubicacion),
            JSON_OBJECT('estado_nuevo', NEW.estado_operativo, 'codigo_activo', NEW.codigo_activo, 'zona', NEW.zona_ubicacion),
            NOW()
        );
    END IF;
END//

DELIMITER ;
*/

-- ============================================================================
-- DATOS INICIALES SEMILLA (ADSO SENA LA ANGOSTURA - PRUEBAS Y PRODUCCIÃ“N)
-- ============================================================================

-- 1. Usuarios del Sistema (HU-01: Admin, Instructor, Recepcionista, Aprendices con ficha)
INSERT INTO `usuarios` (`id`, `numero_documento`, `nombres`, `apellidos`, `correo`, `telefono`, `clave_hash`, `rol`, `ficha_sena`, `codigo_qr_token`, `puntos_constancia`, `activo`, `fecha_nacimiento`, `genero`) VALUES
(1, '1000000001', 'Administrador', 'General', 'admin@gestorgym.com', '+573001112233', '$2y$12$eA6oH862Zz5/6Jp65w4OeeKxR.dE1v9m8d2N56k74fTqN8m4Qk6wK', 'administrador', 'ADSO-3312595', 'QR-ADM-9988112233', 0, 1, '1985-04-12', 'otro'),
(2, '1000000002', 'Martha', 'Rivera', 'martha.rivera@gestorgym.com', '+573102223344', '$2y$12$eA6oH862Zz5/6Jp65w4OeeKxR.dE1v9m8d2N56k74fTqN8m4Qk6wK', 'entrenador', 'INSTRUCTORA-SENA', 'QR-TRN-4455667788', 50, 1, '1988-06-18', 'femenino'),
(3, '1000000003', 'Valeria', 'Recepcion', 'recepcion@gestorgym.com', '+573203334455', '$2y$12$eA6oH862Zz5/6Jp65w4OeeKxR.dE1v9m8d2N56k74fTqN8m4Qk6wK', 'recepcionista', 'STAFF-ANGOS', 'QR-REC-1122334455', 0, 1, '1995-11-15', 'femenino'),
(4, '1107530057', 'Santiago', 'Hernández Vargas', 'santiago.hernandez@example.com', '+573004445566', '$2y$12$eA6oH862Zz5/6Jp65w4OeeKxR.dE1v9m8d2N56k74fTqN8m4Qk6wK', 'aprendiz', '3312595', 'QR-APR-1107530057', 260, 1, '2002-03-20', 'masculino'),
(5, '1098765432', 'Leonardo', 'González Perdomo', 'leonardo.gonzalez@example.com', '+573115556677', '$2y$12$eA6oH862Zz5/6Jp65w4OeeKxR.dE1v9m8d2N56k74fTqN8m4Qk6wK', 'aprendiz', '3312595', 'QR-APR-1098765432', 180, 1, '2001-07-14', 'masculino'),
(6, '1012345678', 'Germán', 'Mouse', 'german.mouse@example.com', '+573156667788', '$2y$12$eA6oH862Zz5/6Jp65w4OeeKxR.dE1v9m8d2N56k74fTqN8m4Qk6wK', 'aprendiz', '3312595', 'QR-APR-1012345678', 95, 1, '2000-09-30', 'masculino');

-- 2. Planes de Acondicionamiento Físico (HU-02: Bronce, Plata y Oro Sin Costo)
INSERT INTO `planes` (`id`, `nombre`, `descripcion`, `duracion_dias`, `precio`, `horario_acceso`, `activo`) VALUES
(1, 'Plan Bronce', 'Acceso general a zonas de musculación, cardio y casilleros sin costo institucional', 90, 0.00, 'todo_el_dia', 1),
(2, 'Plan Plata', 'Acceso a zonas fitness, valoración antropométrica con cálculo de IMC y reserva de clases grupales sin costo', 180, 0.00, 'todo_el_dia', 1),
(3, 'Plan Oro', 'Acceso preferencial total, rutinas personalizadas avanzadas, retos deportivos y seguimiento continuo sin costo', 365, 0.00, 'todo_el_dia', 1);

-- 3. Membresías Activas y Vencidas (HU-03)
INSERT INTO `membresias` (`id`, `usuario_id`, `plan_id`, `fecha_inicio`, `fecha_fin`, `estado`, `metodo_pago`, `monto_pagado`) VALUES
(1, 4, 3, '2026-10-01', '2027-10-01', 'activa', 'convenio_sena', 0.00),
(2, 5, 2, '2026-10-15', '2027-04-15', 'activa', 'convenio_sena', 0.00),
(3, 6, 1, '2026-01-01', '2026-03-31', 'vencida', 'convenio_sena', 0.00);

-- 4. Clases Grupales y Parrilla Horaria (HU-07)
INSERT INTO `clases_grupales` (`id`, `nombre`, `descripcion`, `instructor_id`, `aforo_maximo`, `zona_salon`) VALUES
(1, 'Spinning Indoor Pro', 'SesiÃ³n cardiovascular de alta intensidad en bicicleta estÃ¡tica', 2, 20, 'SalÃ³n Spinning'),
(2, 'Entrenamiento Funcional & HIIT', 'Circuitos dinÃ¡micos para mejora de resistencia, fuerza y agilidad', 2, 25, 'Zona Funcional'),
(3, 'Yoga & Flexibilidad', 'RecuperaciÃ³n muscular, movilidad articular y respiraciÃ³n', 2, 18, 'SalÃ³n Zen');

INSERT INTO `horarios_clases` (`id`, `clase_id`, `dia_semana`, `hora_inicio`, `hora_fin`) VALUES
(1, 1, 'Lunes', '06:30:00', '07:30:00'),
(2, 1, 'Miercoles', '06:30:00', '07:30:00'),
(3, 1, 'Viernes', '18:30:00', '19:30:00'),
(4, 2, 'Martes', '07:00:00', '08:00:00'),
(5, 2, 'Jueves', '19:00:00', '20:00:00'),
(6, 3, 'Sabado', '08:00:00', '09:00:00');

-- 5. Reservas de Clases de Ejemplo (HU-07)
INSERT INTO `reservas_clases` (`horario_clase_id`, `aprendiz_id`, `fecha_clase`, `estado`) VALUES
(1, 4, CURDATE(), 'reservada'),
(1, 5, CURDATE(), 'reservada');

-- 6. CategorÃ­as de Equipos e Inventario (HU-06)
INSERT INTO `categorias_equipos` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Musculación Guiada', 'MÃ¡quinas de placas y cables con recorrido biomecÃ¡nico guiado'),
(2, 'Cardiovascular', 'Caminadoras, elÃ­pticas, bicicletas estÃ¡ticas y remos'),
(3, 'Peso Libre', 'Barras olímpicas, mancuernas, discos bumper y bancos'),
(4, 'Spinning', 'Bicicletas estÃ¡ticas de freno magnético o zapata'),
(5, 'Entrenamiento Funcional', 'Balones medicinales, cajones de salto, kettlebells y bandas');

INSERT INTO `equipos` (`id`, `codigo_activo`, `categoria_id`, `nombre`, `marca`, `modelo`, `numero_serie`, `fecha_compra`, `precio_compra`, `dias_ciclo_mantenimiento`, `fecha_ultimo_mantenimiento`, `zona_ubicacion`, `estado_operativo`, `usuario_responsable_id`) VALUES
(1, 'EQ-MS-001', 1, 'Prensa de Piernas 45°', 'Hammer Strength', 'Linear 45 Plate Loaded', 'HS-LP-2022-091', '2023-01-15', 12500000.00, 45, '2026-09-15', 'Musculación', 'operativo', 1),
(2, 'EQ-MS-012', 1, 'Polea Dual Cruzada (Crossover)', 'Life Fitness', 'Cable Motion Dual', 'LF-CM-2021-344', '2023-02-10', 16000000.00, 30, '2026-09-01', 'Musculación', 'requiere_mantenimiento', 1),
(3, 'EQ-CD-003', 2, 'Caminadora Eléctrica T70', 'Matrix', 'Matrix T70 Touch', 'MX-T70-88741', '2023-03-01', 18500000.00, 30, '2026-08-20', 'Cardio', 'fuera_de_servicio', 1),
(4, 'EQ-SP-008', 4, 'Bicicleta de Spinning IC4', 'Schwinn', 'IC4 Magnetic Spin', 'SC-IC4-55412', '2023-05-20', 4200000.00, 60, '2026-09-15', 'Spinning', 'operativo', 2),
(5, 'EQ-PL-020', 3, 'Banco Plano Olímpico de Pecho', 'Rogue Fitness', 'Monster Flat Bench', 'RF-MB-7712', '2023-04-10', 3800000.00, 90, '2026-08-10', 'Peso Libre', 'operativo', 1);

-- 7. BitÃ¡cora de Mantenimientos y Alertas (HU-06)
INSERT INTO `bitacora_mantenimientos` (`id`, `equipo_id`, `nombre_tecnico`, `usuario_responsable_id`, `tipo_mantenimiento`, `fecha_programada`, `fecha_ejecutada`, `costo`, `descripcion`, `repuestos_utilizados`, `estado`) VALUES
(1, 3, 'Servicio Técnico Especializado Matrix SAS', 1, 'corrective', '2026-10-25', NULL, 350000.00, 'Falla mecánica: Rotura de banda de tracción principal (HU-06 escenario 3)', 'Banda elástica de tracción 50x150cm, lubricante de silicona líquida', 'en_progreso'),
(2, 2, 'Técnico Andrés Ramos - Mantenimientos Gym', 2, 'preventive', '2026-11-05', NULL, 120000.00, 'Inspección periódica de guayas y lubricación de poleas en torre dual (HU-06)', 'Cable de acero galvanizado 4mm con forro de nylon', 'pendiente'),
(3, 4, 'Andrés Ramos', 2, 'preventive', '2026-09-15', '2026-09-15', 80000.00, 'Ajuste de biela, pedales y calibración de freno magnético', 'Cojinete de pedal sellado', 'completado');

-- 8. Biblioteca de Ejercicios (HU-05)
INSERT INTO `ejercicios` (`id`, `nombre`, `grupo_muscular`, `equipamiento_necesario`, `nivel_dificultad`, `instrucciones`, `url_video`) VALUES
(1, 'Press de Banca Plano con Barra', 'pecho', 'Barra olímpica y banco plano', 'intermedio', 'Retraer escápulas, bajar la barra controlada al esternón y empujar con fuerza sin descolocar los hombros.', 'https://gestorgym.example.com/videos/press-plano.mp4'),
(2, 'Sentadilla Trasera con Barra (Squat)', 'piernas', 'Barra olímpica y rack de sentadilla', 'intermedio', 'Pies a la anchura de hombros, bajar rompiendo el paralelo manteniendo columna neutra y rodillas alineadas.', 'https://gestorgym.example.com/videos/sentadilla.mp4'),
(3, 'Prensa de Piernas 45°', 'piernas', 'Prensa inclinada a 45 grados', 'principiante', 'Colocar pies en la plataforma a media altura, flexionar rodillas a 90 grados y extender sin bloquear las rodillas.', 'https://gestorgym.example.com/videos/prensa-45.mp4'),
(4, 'Jalón al Pecho en Polea (Lat Pulldown)', 'espalda', 'Polea alta y barra ancha', 'principiante', 'Tomar agarre prono abierto, tirar hacia el pecho arqueando ligeramente la espalda alta y controlando la fase excéntrica.', 'https://gestorgym.example.com/videos/jalon-pecho.mp4'),
(5, 'Remo con Barra Inclinado (Pendlay / Barbell Row)', 'espalda', 'Barra olímpica', 'intermedio', 'Inclinar el torso paralelo al suelo, traccionar la barra hacia el ombligo activando dorsales.', 'https://gestorgym.example.com/videos/remo-barra.mp4'),
(6, 'Press Militar de Hombros con Barra', 'hombros', 'Barra olímpica', 'intermedio', 'De pie o sentado, empujar la barra sobre la cabeza hasta bloqueo controlado sin arquear la zona lumbar.', 'https://gestorgym.example.com/videos/press-militar.mp4'),
(7, 'Elevaciones Laterales con Mancuernas', 'hombros', 'Mancuernas', 'principiante', 'Elevar los brazos en el plano escapular hasta la altura de los hombros con codos ligeramente flexionados.', 'https://gestorgym.example.com/videos/elevaciones-laterales.mp4'),
(8, 'Curl de Bíceps con Barra Z', 'brazos', 'Barra Z', 'principiante', 'Codos pegados a los costados, flexionar antebrazos sin balancear el torso y descender lento.', 'https://gestorgym.example.com/videos/curl-biceps.mp4'),
(9, 'Extensión de Tríceps en Polea Alta', 'brazos', 'Polea y cuerda o barra recta', 'principiante', 'Extender los codos hacia abajo manteniendo los brazos estables a los laterales del torso.', 'https://gestorgym.example.com/videos/triceps-polea.mp4'),
(10, 'Plancha Abdominal IsomÃ©trica (Core)', 'core', 'Colchoneta', 'principiante', 'Mantener cuerpo alineado apoyado en antebrazos y puntas de pies, contrayendo abdomen y glÃºteos.', 'https://gestorgym.example.com/videos/plancha-core.mp4');

-- 9. Rutinas e Ãtems (HU-05)
INSERT INTO `rutinas` (`id`, `entrenador_id`, `nombre`, `descripcion`, `objetivo`, `nivel`, `es_plantilla`) VALUES
(1, 2, 'Plantilla Push-Pull-Legs (3 Días)', 'División de empuje, tracción y pierna orientada a hipertrofia muscular y fuerza.', 'hipertrofia', 'intermedio', 1),
(2, 2, 'Full Body Acondicionamiento General', 'Rutina de cuerpo completo para aprendices principiantes (3 sesiones semanales).', 'acondicionamiento_general', 'principiante', 1);

INSERT INTO `items_rutina` (`rutina_id`, `ejercicio_id`, `numero_dia`, `orden_ejecucion`, `series`, `repeticiones`, `cadencia_tempo`, `esfuerzo_objetivo_rpe`, `descanso_segundos`, `notas`) VALUES
(1, 1, 1, 1, 4, '8-10', '3-0-1-0', 'RPE 8', 120, 'Serie pesada controlando bajada'),
(1, 6, 1, 2, 3, '10-12', '2-0-1-0', 'RPE 8', 90, 'Sin impulso con piernas'),
(1, 7, 1, 3, 4, '12-15', '2-0-1-0', 'RPE 9', 60, 'Última serie con drop-set'),
(1, 9, 1, 4, 3, '12-15', '2-0-1-0', 'RPE 9', 60, 'Apertura máxima abajo'),
(1, 4, 2, 1, 4, '10-12', '3-0-1-0', 'RPE 8', 90, 'Pausa de 1 seg en contracción'),
(1, 5, 2, 2, 4, '8-10', '2-0-1-0', 'RPE 8', 120, 'Espalda rígida'),
(1, 8, 2, 3, 3, '10-12', '2-0-1-0', 'RPE 8.5', 60, 'Foco en supinación'),
(1, 2, 3, 1, 4, '6-8', '3-1-1-0', 'RPE 8.5', 150, 'Calentamiento progresivo previo'),
(1, 3, 3, 2, 4, '10-12', '3-0-1-0', 'RPE 9', 90, 'Rango completo de recorrido'),
(1, 10, 3, 3, 3, '45 seg', 'Isométrico', 'RPE 8', 45, 'Mantener tensión lumbar neutra');

INSERT INTO `asignaciones_rutinas` (`socio_id`, `rutina_id`, `asignado_por_id`, `fecha_inicio`, `es_rutina_actual`) VALUES
(4, 1, 2, '2026-10-01', 1);

-- 10. Ficha Antropométrica (HU-04: Cálculo de IMC y grÃ¡fica evolutiva)
INSERT INTO `fichas_antropometricas` (`socio_id`, `evaluador_id`, `fecha_medicion`, `peso_kg`, `estatura_cm`, `porcentaje_grasa`, `porcentaje_masa_muscular`, `pecho_cm`, `cintura_cm`, `cadera_cm`, `brazo_cm`, `muslo_cm`, `objetivos_individuales`, `notas`) VALUES
(4, 2, '2026-09-01', 81.00, 175.00, 20.00, 40.50, 104.00, 87.00, 100.00, 35.50, 59.00, 'Iniciar proceso de acondicionamiento físico y recomposición.', 'Evaluación inicial diagnóstica.'),
(4, 2, '2026-10-01', 78.50, 175.00, 18.50, 42.00, 102.00, 84.00, 98.00, 36.50, 58.00, 'Aumento de masa muscular y reducción de perímetro abdominal.', 'Avance positivo en reducción de grasa y aumento muscular.');

-- 11. Retos Deportivos y Tabla de Líderes (HU-09)
INSERT INTO `retos_deportivos` (`id`, `titulo`, `descripcion`, `meta_asistencias`, `puntos_recompensa`, `fecha_inicio`, `fecha_fin`, `activo`, `creado_por_id`) VALUES
(1, 'Reto Constancia SENA 20 Días', 'Completa 20 sesiones de entrenamiento durante el mes para obtener insignia y 100 puntos.', 20, 100, '2026-10-01', '2026-10-31', 1, 1),
(2, 'Desafío Cardio & Funcional La Angostura', 'Asiste a 8 clases grupales dirigidas de spinning o funcional en el mes.', 8, 80, '2026-10-01', '2026-10-31', 1, 2);

INSERT INTO `inscripciones_retos` (`reto_id`, `aprendiz_id`, `asistencias_completadas`, `completado`, `fecha_inscripcion`, `fecha_completado`) VALUES
(1, 4, 20, 1, '2026-10-01 08:00:00', '2026-10-28 10:00:00'),
(1, 5, 14, 0, '2026-10-02 09:15:00', NULL),
(2, 4, 6, 0, '2026-10-05 10:30:00', NULL);

-- 12. Registros de Acceso con Entrada y Salida (HU-03: Permanencia y aforo)
INSERT INTO `registros_acceso` (`usuario_id`, `fecha_hora_acceso`, `fecha_hora_salida`, `minutos_permanencia`, `metodo_acceso`, `acceso_concedido`, `motivo_rechazo`, `verificado_por_id`) VALUES
(4, '2026-10-28 07:05:12', '2026-10-28 08:35:12', 90, 'escaneo_qr', 1, NULL, 3),
(5, '2026-10-28 08:14:30', '2026-10-28 09:29:30', 75, 'escaneo_qr', 1, NULL, 3),
(4, CONCAT(CURDATE(), ' 07:00:00'), NULL, NULL, 'escaneo_qr', 1, NULL, 3), -- Usuario actualmente dentro (aforo activo)
(6, '2026-10-28 09:30:45', NULL, NULL, 'documento_identidad', 0, 'Plan vencido', 3);

-- 13. Registros de Entrenamiento con Puntos Sumados (HU-05)
INSERT INTO `registros_entrenamiento` (`socio_id`, `item_rutina_id`, `ejercicio_id`, `fecha_hora_completado`, `numero_serie`, `peso_utilizado_kg`, `repeticiones_logradas`, `esfuerzo_rpe`, `sesion_finalizada`, `puntos_otorgados`, `notas`) VALUES
(4, 1, 1, '2026-10-28 07:15:00', 1, 60.00, 10, 7, 1, 10, 'Calentamiento efectivo'),
(4, 1, 1, '2026-10-28 07:22:00', 2, 75.00, 8, 8.5, 1, 10, 'Carga máxima del dÃ­a');

SET FOREIGN_KEY_CHECKS = 1;

