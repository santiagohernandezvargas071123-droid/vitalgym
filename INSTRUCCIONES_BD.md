# Guía de la Base de Datos: Plataforma de Gestión de Gimnasio (`vitalgym`)
### SENA - Centro de Formación Agroindustrial (Regional Huila - Sede La Angostura)
**Ficha ADSO:** 3312595 | **Instructora:** Martha Rivera  
**Elaborado por:** Santiago Hernández Vargas, Leonardo González Perdomo, Germán Mouse (Mayo de 2026)

---

## 1. Estado de la Instalación

¡La base de datos se encuentra **creada y cargada exitosamente** bajo el nombre oficial **`vitalgym`**!

* **Archivo principal:** [`VITALGYM.sql`](file:///c:/Users/SANTIAGO/OneDrive/Desktop/contarto/base%20de%20datos%20nuevas%20del%20ginacio/VITALGYM.sql) (también disponible en [`vitalgym.sql`](file:///c:/Users/SANTIAGO/OneDrive/Desktop/contarto/base%20de%20datos%20nuevas%20del%20ginacio/vitalgym.sql))
* **Base de datos objetivo:** `vitalgym`

En **HeidiSQL**, simplemente presiona **F5** (o clic derecho ➔ **Refrescar**) para ver la base de datos `vitalgym` en el árbol de navegación izquierdo.

---

## 2. Cobertura de las Historias de Usuario (HU-01 a HU-09)

| Historia de Usuario | Módulo / Entidades en la BD | Implementación en Base de Datos |
| :--- | :--- | :--- |
| **HU-01** (Inicio de sesión y autenticación) | `usuarios`, `auditoria_acciones` | Campos `intentos_fallidos` y `bloqueado_hasta` para el bloqueo a 3 intentos erróneos; roles `administrador`, `entrenador`, `recepcionista`, `aprendiz`. |
| **HU-02** (Parametrizar planes de acondicionamiento) | `planes`, `membresias` | Vigencia en días (`duracion_dias`), `precio`, campo `activo` para inactivación manteniendo histórico, y trigger de auditoría de cambios. |
| **HU-03** (Control de ingreso, salida y aforo) | `registros_acceso`, `vista_aforo_actual`, `vista_estado_acceso_socios` | Control de entrada por QR/documento, marcación de salida en `fecha_hora_salida`, cálculo de `minutos_permanencia` y cálculo de aforo disponible en tiempo real. |
| **HU-04** (Valoraciones antropométricas y medidas) | `fichas_antropometricas`, `fotos_progreso` | Cálculo automático de `imc` (`STORED GENERATED`), trigger `trg_calcular_clasificacion_imc`, comparativo evolutivo de grasa y masa muscular. |
| **HU-05** (Consultar rutinas y series/repeticiones) | `rutinas`, `items_rutina`, `asignaciones_rutinas`, `registros_entrenamiento` | Detalle granular de series, repeticiones, tempo, RPE, descansos, guía visual (`url_video`) y trigger que suma `puntos_constancia` al finalizar rutina. |
| **HU-06** (Inventario de máquinas y alertas de mantenimiento) | `equipos`, `bitacora_mantenimientos`, `vista_alertas_mantenimiento` | Ciclos de mantenimiento en días, registro de serial/modelo/marca, estados (`operativo`, `requiere_mantenimiento`, `fuera_de_servicio`) y órdenes técnicas. |
| **HU-07** (Reservar cupos en clases grupales dirigidas) | `clases_grupales`, `horarios_clases`, `reservas_clases`, `vista_disponibilidad_clases` | Clases (spinning, funcional, yoga), aforo máximo, reservas por fecha/horario, cancelación anticipada y cálculo dinámico de cupos restantes. |
| **HU-08** (Reportes estadísticos e informes) | `vista_reporte_mensual_sena` | Agrupación consolidada mensual de asistencias únicas, total ingresos por membresías y costos de mantenimiento para informes SENA. |
| **HU-09** (Retos deportivos y tabla de líderes) | `retos_deportivos`, `inscripciones_retos`, `vista_tabla_lideres` | Metas de asistencia mensual, recompensa en puntos, ranking de constancia (`DENSE_RANK()`) y tabla de líderes de aprendices. |

---

## 3. Vistas Estratégicas Disponibles

1. **`vista_tabla_lideres`**: Ranking general de aprendices según puntos de constancia, asistencias acumuladas y retos completados.
2. **`vista_aforo_actual`**: Cantidad de aprendices dentro del gimnasio en este momento (ingresos del día sin salida registrada).
3. **`vista_disponibilidad_clases`**: Aforo máximo de cada clase, cupos reservados y cupos libres en tiempo real ('Disponible' o 'Cupos Agotados').
4. **`vista_estado_acceso_socios`**: Consulta ultrarrápida para recepción/torniquetes que valida membresía vigente, estado de la cuenta y bloqueos.
5. **`vista_alertas_mantenimiento`**: Alertas automáticas para máquinas con mantenimiento preventivo vencido o averías correctivas urgentes.
6. **`vista_reporte_mensual_sena`**: Consolidado estadístico mensual de ingresos, asistencias y gastos de mantenimiento.
