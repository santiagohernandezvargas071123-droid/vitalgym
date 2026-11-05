# Script de monitoreo y subida automatica
$hostIp = "100.100.215.96"
$port = 22
$winscp = "$env:LOCALAPPDATA\Programs\WinSCP\WinSCP.com"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MONITOREO ACTIVO PARA SERVIDOR SENA (100.100.215.96)" -ForegroundColor Cyan
Write-Host " Esperando que el instructor comparta el servidor..." -ForegroundColor Yellow
Write-Host " En cuanto responda, todos los archivos se subirán solos." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$conectado = $false

while (-not $conectado) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $connect = $tcp.BeginConnect($hostIp, $port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne(2000, $false)
        if ($wait) {
            $tcp.EndConnect($connect)
            $conectado = $true
            $tcp.Close()
            break
        }
        $tcp.Close()
    } catch {}

    Write-Host "." -NoNewline -ForegroundColor DarkGray
    Start-Sleep -Seconds 3
}

Write-Host "`n`n¡SERVIDOR DETECTADO Y EN LÍNEA! Iniciando transferencia..." -ForegroundColor Green
[console]::beep(800, 300)

& $winscp /command `
    "open sftp://santiago:santi2029@$hostIp`:$port/ -hostkey=*" `
    "cd /var/www/html" `
    "put -overwrite index.html" `
    "put -overwrite app.js" `
    "put -overwrite api.php" `
    "put -overwrite db.php" `
    "put -overwrite aprendiz.html" `
    "put -overwrite aprendiz.js" `
    "put -overwrite instructor.html" `
    "put -overwrite instructor.js" `
    "put -overwrite admin.html" `
    "put -overwrite admin.js" `
    "put -overwrite recepcion.html" `
    "put -overwrite recepcion.js" `
    "put -overwrite logo.png" `
    "put -overwrite logo.jpg" `
    "put -overwrite hero_athletes.jpg" `
    "put -overwrite gym_interior.jpg" `
    "put -overwrite gym_disciplina.jpg" `
    "put -overwrite avatar_santiago.jpg" `
    "put -overwrite avatar_martha.jpg" `
    "put -overwrite GESTORGYM.sql" `
    "exit"

Write-Host "`n¡TODOS LOS ARCHIVOS HAN SIDO SUBIDOS A /var/www/html CON ÉXITO!" -ForegroundColor Green
[console]::beep(1000, 500)
pause

