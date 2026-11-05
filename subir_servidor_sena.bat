@echo off
chcp 65001 >nul
echo ========================================================
echo   SUBIDA AUTOMÁTICA DE VITALGYM AL SERVIDOR LINUX (SFTP)
echo   Host: 100.100.215.96:22 | Ruta: /var/www/html
echo ========================================================
echo.

set WINSCP_PATH="%LOCALAPPDATA%\Programs\WinSCP\WinSCP.com"

if not exist %WINSCP_PATH% (
    echo [ERROR] No se encontró WinSCP en la ruta habitual.
    pause
    exit /b
)

echo [1/3] Verificando conexión de red a 100.100.215.96:22...
powershell -Command "if (!(Test-NetConnection -ComputerName 100.100.215.96 -Port 22 -WarningAction SilentlyContinue).TcpTestSucceeded) { exit 1 }"
if %errorlevel% neq 0 (
    echo.
    echo [AVISO DE CONEXIÓN]
    echo No hay respuesta de la IP 100.100.215.96.
    echo.
    echo Motivo: Esta IP pertenece a la red privada Tailscale del SENA / Instructor.
    echo Para conectar debes tener Tailscale activo en la red del servidor o aceptar
    echo la invitación de nodo compartido de tu instructor.
    echo.
    echo ¿Deseas intentar abrir WinSCP de todos modos? (S/N)
    set /p reintentar="> "
    if /i not "%reintentar%"=="S" exit /b
)

echo.
echo [2/3] Conectando y transfiriendo archivos a /var/www/html ...
echo.

%WINSCP_PATH% /command ^
    "open sftp://santiago:santi2029@100.100.215.96:22/ -hostkey=*" ^
    "cd /var/www/html" ^
    "put -overwrite index.html" ^
    "put -overwrite app.js" ^
    "put -overwrite api.php" ^
    "put -overwrite db.php" ^
    "put -overwrite aprendiz.html" ^
    "put -overwrite aprendiz.js" ^
    "put -overwrite instructor.html" ^
    "put -overwrite instructor.js" ^
    "put -overwrite admin.html" ^
    "put -overwrite admin.js" ^
    "put -overwrite recepcion.html" ^
    "put -overwrite recepcion.js" ^
    "put -overwrite logo.png" ^
    "put -overwrite logo.jpg" ^
    "put -overwrite hero_athletes.jpg" ^
    "put -overwrite gym_interior.jpg" ^
    "put -overwrite gym_disciplina.jpg" ^
    "put -overwrite avatar_santiago.jpg" ^
    "put -overwrite avatar_martha.jpg" ^
    "put -overwrite GESTORGYM.sql" ^
    "exit"

echo.
echo ========================================================
echo   Proceso finalizado. Revisa los mensajes arriba.
echo ========================================================
pause

