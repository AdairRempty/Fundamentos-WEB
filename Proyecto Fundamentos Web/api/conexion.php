<?php
// Archivo: api/conexion.php
// PDO para MySQL
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Content-Type: application/json; charset=UTF-8");
// Estos header definen el comportamiento de todas las consultas de la base de datos, en base a la materia de ciberseguridad no deberia de permitir el acceso a cualquier origen, pero para fines de testing lo dejare asi.

$host = "127.0.0.1"; // Estandar
$port = "3306"; // Puerto de XAMPP
$db_name = "ecotrack"; // El nombre mamalon de la base de datos
$username = "root"; // Usuario por defecto en XAMPP (no deberia de usarse en produccion o nunca en general)
$password = "";     // Contraseña por defecto en XAMPP (vacía)

try {
    // Conexión mediante PDO (Más seguro para evitar inyección SQL)
    $conn = new PDO("mysql:host=" . $host . ";port=" . $port . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // DEBUG
    // echo json_encode(["status" => "success", "message" => "Conectado a MySQL exitosamente"]);
} catch(PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Fallo la conexión: " . $exception->getMessage()]);
    exit();
}
?>
