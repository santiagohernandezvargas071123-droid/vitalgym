@echo off
chcp 65001 >nul
echo Abriendo WinSCP con la conexión preconfigurada a 100.100.215.96...
start "" "%LOCALAPPDATA%\Programs\WinSCP\WinSCP.exe" sftp://santiago:santi2029@100.100.215.96:22/var/www/html
exit

