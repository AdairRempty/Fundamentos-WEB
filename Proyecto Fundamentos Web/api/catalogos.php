<?php
require_once 'conexion.php';

// Metodo GET directo para obtener el parametro 'type' y usar esta funcion para cualquiera de los 3 catalogos
$type = isset($_GET['type']) ? $_GET['type'] : '';

// Listado de catalogos
try {
    // Para empresas
    if ($type === 'empresas') {
        $stmt = $conn->query("SELECT id, razon_social, rfc FROM Empresas ORDER BY razon_social ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    // Para vehiculos
    } elseif ($type === 'vehiculos') {
        $stmt = $conn->query("SELECT id, placas, modelo, chofer FROM Vehiculos ORDER BY modelo ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    // Para residuos
    } elseif ($type === 'residuos') {
        $stmt = $conn->query("SELECT id, nombre, codigo FROM Residuos ORDER BY nombre ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    // No existe el catalogo
    } else {
        echo json_encode(["status" => "error", "message" => "Tipo de catálogo no valido."]);
    }
} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
