# VitalGym SENA - Sistema Integral de Gestión de Gimnasio

> **SENA - Centro de Formación Agroindustrial (Regional Huila - Sede La Angostura)**  
> **Programa:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) | **Ficha:** 3312595  
> **Aprendiz:** Santiago Hernández Vargas  
> **Instructora Líder:** Martha Rivera  

---

## 📌 Descripción del Proyecto

**VitalGym** es una plataforma web integral diseñada para la administración, control de acceso, reserva de clases grupales y seguimiento del rendimiento físico de los aprendices y la comunidad del Centro de Formación Agroindustrial La Angostura.

El sistema implementa arquitectura cliente-servidor con backend en **PHP**, base de datos relacional en **MariaDB / MySQL (InnoDB)**, y una interfaz moderna y responsiva construida con **HTML5, Tailwind CSS y JavaScript**.

---

## 🚀 Módulos y Funcionalidades

1. **Landing Page y Captación Institucional (`index.html`):**
   - Presentación institucional del gimnasio del SENA La Angostura.
   - Formulario de prospección e inicio de sesión modal unificado con control de roles.
   - Widget flotante interactivo de **VitalBot AI** (asistente virtual y entrenador inteligente).

2. **Portal del Aprendiz (`aprendiz.html`):**
   - Carnet digital con **Código QR** único de acceso (`QR-APR-1107530057`).
   - Módulo de Gamificación: Sistema de puntos de constancia, ranking mensual de líderes (Medalla de Oro).
   - Planes de acondicionamiento físico y rutinas estructuradas (Push-Pull-Legs).
   - Valoración antropométrica y cálculo automatizado de IMC.
   - Reserva de clases grupales dirigidas (Spinning, HIIT Funcional, Yoga).

3. **Módulos Administrativos y de Operación:**
   - **Recepción (`recepcion.html`):** Validación en tiempo real de ingresos por torniquete y aforo máximo de la sede.
   - **Instructor (`instructor.html`):** Asignación y personalización de rutinas, registro de avances y valoraciones.
   - **Administración (`admin.html`):** Reportes mensuales institucionales, gestión de usuarios, inventario y mantenimiento de maquinaria.

4. **Base de Datos Relacional (`VITALGYM.sql` / `GESTORGYM.sql`):**
   - Esquema normalizado en 3FN con 23+ tablas y soporte transaccional ACID (InnoDB).
   - Índices optimizados para consultas de alta concurrencia.
   - Datos semilla listos para pruebas con usuarios de todos los roles.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, Tailwind CSS, JavaScript ES6+ (asíncrono con Fetch API).
- **Backend:** PHP 8+ (API RESTful modular con respuestas JSON estructuradas).
- **Base de Datos:** MySQL 8.0+ / MariaDB 10.3+ (utf8mb4).
- **Seguridad:** Hash seguro de contraseñas (`BCrypt` / `password_hash`), validación de sesiones y prevención de inyecciones SQL con PDO / Prepared Statements.

---

## 💻 Instalación y Despliegue Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/santiagohernandezvargas071123-droid/vitalgym.git
   ```
2. Colocar los archivos en la carpeta de tu servidor local (`htdocs` en XAMPP o `www` en Laragon).
3. Importar el archivo `VITALGYM.sql` en phpMyAdmin o ejecutar `instalar_bd.php`.
4. Configurar las credenciales de base de datos en `db.php` si es necesario.
5. Abrir en el navegador: `http://localhost/vitalgym/`

---

## 📄 Credenciales de Acceso de Prueba

- **Aprendiz:** Documento `1107530057` | Clave: `123456`
- **Instructor:** Correo `martha.rivera@sena.edu.co` | Clave: `admin123`
- **Recepción:** Correo `recepcion@vitalgym.com` | Clave: `admin123`
- **Administrador:** Correo `admin@vitalgym.com` | Clave: `admin123`
