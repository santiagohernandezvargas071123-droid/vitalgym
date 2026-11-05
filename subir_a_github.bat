@echo off
chcp 65001 >nul
echo ============================================================
echo   SUBIENDO PROYECTO VITALGYM A GITHUB (santiagohernandezvargas071123-droid)
echo ============================================================
echo.

git branch -M main
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================================
    echo   ¡PROYECTO SUBIDO EXITOSAMENTE A GITHUB!
    echo   https://github.com/santiagohernandezvargas071123-droid/vitalgym
    echo ============================================================
) else (
    echo ============================================================
    echo   Hubo un detalle. Verifica que el repositorio 'vitalgym'
    echo   ya esté creado en https://github.com/new
    echo ============================================================
)
echo.
pause
