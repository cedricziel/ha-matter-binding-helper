<?php

declare(strict_types=1);

namespace MatterSurvey;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;
    private static string $dbPath;

    public static function setPath(string $path): void
    {
        self::$dbPath = $path;
    }

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $dbPath = self::$dbPath ?? __DIR__ . '/../data/matter-survey.db';
            $dbDir = dirname($dbPath);

            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }

            $isNew = !file_exists($dbPath);

            try {
                self::$instance = new PDO(
                    "sqlite:$dbPath",
                    null,
                    null,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );

                // Enable foreign keys
                self::$instance->exec('PRAGMA foreign_keys = ON');

                // Initialize schema if new database
                if ($isNew) {
                    self::initializeSchema();
                }
            } catch (PDOException $e) {
                throw new \RuntimeException("Database connection failed: " . $e->getMessage());
            }
        }

        return self::$instance;
    }

    private static function initializeSchema(): void
    {
        $schemaPath = __DIR__ . '/../schema.sql';
        if (!file_exists($schemaPath)) {
            throw new \RuntimeException("Schema file not found: $schemaPath");
        }

        $schema = file_get_contents($schemaPath);
        self::$instance->exec($schema);
    }

    public static function reset(): void
    {
        self::$instance = null;
    }
}
