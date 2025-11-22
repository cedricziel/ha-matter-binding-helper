<?php

declare(strict_types=1);

namespace App\Service;

use PDO;
use PDOException;
use RuntimeException;

/**
 * Database service for SQLite connection management.
 */
class DatabaseService
{
    private ?PDO $pdo = null;
    private string $databasePath;
    private string $schemaPath;

    public function __construct(string $databasePath, string $schemaPath)
    {
        $this->databasePath = $databasePath;
        $this->schemaPath = $schemaPath;
    }

    public function getConnection(): PDO
    {
        if ($this->pdo === null) {
            $dbDir = dirname($this->databasePath);
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }

            $isNew = !file_exists($this->databasePath);

            try {
                $this->pdo = new PDO(
                    "sqlite:{$this->databasePath}",
                    null,
                    null,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );

                $this->pdo->exec('PRAGMA foreign_keys = ON');

                if ($isNew) {
                    $this->initializeSchema();
                }
            } catch (PDOException $e) {
                throw new RuntimeException("Database connection failed: " . $e->getMessage());
            }
        }

        return $this->pdo;
    }

    private function initializeSchema(): void
    {
        if (!file_exists($this->schemaPath)) {
            throw new RuntimeException("Schema file not found: {$this->schemaPath}");
        }

        $schema = file_get_contents($this->schemaPath);
        $this->pdo->exec($schema);
    }
}
