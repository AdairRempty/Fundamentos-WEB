<?php
// Script de Seeder hecho totalmente con IA solo para agilizar las pruebas
$host = "127.0.0.1";
$port = "3306";
$username = "root";
$password = "";

echo "Iniciando proceso de seeding en MySQL (localhost:3306)...\n";

try {
    $conn = new PDO("mysql:host=$host;port=$port;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 1. Ejecutar Schema
    $schema = file_get_contents(__DIR__ . '/../database/mysql_schema.sql');
    if ($schema === false) die("No se pudo leer mysql_schema.sql\n");
    
    try {
        $conn->exec($schema);
        echo "[OK] Esquema y Tablas creadas (BD: ecotrack).\n";
    } catch(PDOException $e) {
        echo "[INFO] Tablas ya existentes, se limpiarán para el nuevo seeder.\n";
    }
    
    // Seleccionar BD
    $conn->exec("USE ecotrack");

    // Imprimir para debug, borrar las tablas primero en caso de duplicados
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $conn->exec("TRUNCATE TABLE Bitacora_Movimientos;");
    $conn->exec("TRUNCATE TABLE Manifiesto_Detalle;");
    $conn->exec("TRUNCATE TABLE Manifiestos;");
    $conn->exec("TRUNCATE TABLE Residuos;");
    $conn->exec("TRUNCATE TABLE Vehiculos;");
    $conn->exec("TRUNCATE TABLE Empresas;");
    $conn->exec("TRUNCATE TABLE Usuarios;");
    $conn->exec("TRUNCATE TABLE Roles;");
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 2. Ejecutar Seed
    $seed = file_get_contents(__DIR__ . '/../database/mysql_seed.sql');
    if ($seed === false) die("No se pudo leer mysql_seed.sql\n");
    
    $conn->exec($seed);
    echo "[OK] Datos de prueba importados correctamente.\n";
    echo "¡Seeder Finalizado con Éxito!\n";

} catch(PDOException $e) {
    echo "[ERROR] " . $e->getMessage() . "\n";
}
?>
