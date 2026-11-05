<?php
declare(strict_types=1);

/**
 * Conexión a la base de datos vitalgym utilizando PDO Singleton.
 * Compatible con InfinityFree (sql102.infinityfree.com) y Localhost (XAMPP / Laragon).
 */
class Database
{
    private static ?PDO $instance = null;
    private static bool $connectionAttempted = false;

    private function __construct() {}
    private function __clone() {}

    public static function getConnection(): ?PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        if (self::$connectionAttempted) {
            return null;
        }

        self::$connectionAttempted = true;

        $configs = [
            // 1. InfinityFree Producción
            [
                'host' => 'sql102.infinityfree.com',
                'port' => '3306',
                'user' => 'if0_43345251',
                'pass' => 'WckRNerFpYKdWHt',
                'db'   => 'if0_43345251_VITALGYM'
            ],
            // 2. Localhost XAMPP / Laragon / Variables de entorno
            [
                'host' => getenv('DB_HOST') ?: '127.0.0.1',
                'port' => getenv('DB_PORT') ?: '3306',
                'user' => getenv('DB_USER') ?: 'root',
                'pass' => getenv('DB_PASS') !== false ? getenv('DB_PASS') : '',
                'db'   => getenv('DB_NAME') ?: 'vitalgym'
            ],
            // 3. Gestorgym local
            [
                'host' => '127.0.0.1',
                'port' => '3306',
                'user' => 'root',
                'pass' => '',
                'db'   => 'gestorgym'
            ]
        ];

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 3,
        ];

        foreach ($configs as $cfg) {
            try {
                $dsn = "mysql:host={$cfg['host']};port={$cfg['port']};dbname={$cfg['db']};charset=utf8mb4";
                self::$instance = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);
                return self::$instance;
            } catch (Throwable $e) {
                // Siguiente intento
            }
        }

        return null;
    }
}
