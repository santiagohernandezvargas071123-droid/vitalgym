<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: text/html; charset=UTF-8');

$db = Database::getConnection();

if (!$db) {
    echo "<div style='font-family:sans-serif; max-width:600px; margin:40px auto; padding:24px; border-radius:16px; background:#fef2f2; border:2px solid #ef4444; text-align:center;'>";
    echo "<h1 style='color:#991b1b;'>⚠️ Modo Resiliente / Verificación</h1>";
    echo "<p style='color:#b91c1c;'>No se pudo conectar con MySQL sql102.infinityfree.com directamente.</p>";
    echo "<a href='index.html' style='display:inline-block; margin-top:16px; padding:12px 24px; background:#10b981; color:white; text-decoration:none; font-weight:bold; border-radius:12px;'>Ir a VitalGym</a>";
    echo "</div>";
    exit;
}

$sqlFile = __DIR__ . '/VITALGYM.sql';
if (!file_exists($sqlFile)) {
    echo "<h2 style='color:red;'>No se encontró el archivo VITALGYM.sql en el servidor.</h2>";
    exit;
}

$sql = file_get_contents($sqlFile);

try {
    $db->exec($sql);
    echo "<div style='font-family:sans-serif; max-width:600px; margin:40px auto; padding:24px; border-radius:16px; background:#ecfdf5; border:2px solid #059669; text-align:center;'>";
    echo "<h1 style='color:#065f46;'>🎉 ¡Base de Datos VitalGym Instalada con Éxito!</h1>";
    echo "<p style='color:#047857; font-size:16px;'>Todas las tablas, usuarios y datos semilla han sido importados automáticamente en <strong>if0_43345251_VITALGYM</strong>.</p>";
    echo "<p style='color:#065f46; font-size:14px;'>Usuario configurado: <strong>Santiago Hernández (1107530057)</strong> - Plan Oro Activo</p>";
    echo "<a href='index.html' style='display:inline-block; margin-top:16px; padding:12px 24px; background:#059669; color:white; text-decoration:none; font-weight:bold; border-radius:12px;'>Ir al Portal VitalGym</a>";
    echo "</div>";
} catch (Throwable $e) {
    echo "<div style='font-family:sans-serif; max-width:600px; margin:40px auto; padding:24px; border-radius:16px; background:#fffbeb; border:2px solid #f59e0b; text-align:left;'>";
    echo "<h2 style='color:#92400e;'>Resultado de la ejecución:</h2>";
    echo "<p style='color:#b45309;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<a href='index.html' style='display:inline-block; margin-top:16px; padding:10px 20px; background:#059669; color:white; text-decoration:none; font-weight:bold; border-radius:8px;'>Continuar a VitalGym</a>";
    echo "</div>";
}

