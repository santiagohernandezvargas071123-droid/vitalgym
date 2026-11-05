$ftpHost = 'ftp://ftpupload.net/htdocs'
$user = 'if0_43345251'
$pass = 'WckRNerFpYKdWHt'

$files = @('app.js', 'db.php', 'api.php', 'recepcion.js', 'recepcion.html', 'aprendiz.js', 'aprendiz.html', 'index.html', 'VITALGYM.sql', 'GESTORGYM.sql', 'instalar_bd.php', 'chatbot.js', 'asistente_virtual.js')

foreach ($f in $files) {
    if (Test-Path $f) {
        Write-Host "Subiendo: $f"
        $uri = "$ftpHost/$f"
        $req = [System.Net.FtpWebRequest]::Create($uri)
        $req.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $req.Credentials = New-Object System.Net.NetworkCredential($user, $pass)
        $req.UseBinary = $true
        $req.UsePassive = $true
        $req.KeepAlive = $false
        $req.Timeout = 20000

        $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $f).Path)
        $req.ContentLength = $bytes.Length
        $stream = $req.GetRequestStream()
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Close()
        $resp = $req.GetResponse()
        Write-Host "Completado: $f"
        $resp.Close()
    }
}
Write-Host 'LISTO'
