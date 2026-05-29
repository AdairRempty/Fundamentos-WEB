<?php
require_once 'conexion.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Materiales activos
    try {
        $stmt = $conn->query("SELECT * FROM Residuos WHERE activo = 1 ORDER BY nombre ASC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch(Exception $e) {
        try {
            $stmt = $conn->query("SELECT * FROM Residuos ORDER BY nombre ASC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch(Exception $e2) {
            echo json_encode(["status" => "error", "message" => $e2->getMessage()]);
        }
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->nombre, $data->codigo)) {
        try {
            $stmt = $conn->prepare("INSERT INTO Residuos (nombre, codigo, precio_compra_kg, descripcion) VALUES (:n, :c, :p, :d)");
            $stmt->execute([
                ':n' => $data->nombre,
                ':c' => $data->codigo,
                ':p' => isset($data->precio_compra_kg) ? $data->precio_compra_kg : 0,
                ':d' => isset($data->descripcion) ? $data->descripcion : ''
            ]);
            echo json_encode(["status" => "success", "message" => "Residuo registrado en el catálogo"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al registrar (¿Código duplicado?). " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios"]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->id, $data->nombre, $data->codigo)) {
        try {
            $stmt = $conn->prepare("UPDATE Residuos SET nombre = :n, codigo = :c, precio_compra_kg = :p, descripcion = :d WHERE id = :id");
            $stmt->execute([
                ':n' => $data->nombre,
                ':c' => $data->codigo,
                ':p' => isset($data->precio_compra_kg) ? $data->precio_compra_kg : 0,
                ':d' => isset($data->descripcion) ? $data->descripcion : '',
                ':id' => $data->id
            ]);
            echo json_encode(["status" => "success", "message" => "Residuo actualizado exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al actualizar (¿Código duplicado?). " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios"]);
    }
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->id)) {
        try {
            $stmt = $conn->prepare("UPDATE Residuos SET activo = 0 WHERE id = :id");
            $stmt->execute([':id' => $data->id]);
            echo json_encode(["status" => "success", "message" => "Residuo eliminado exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al eliminar: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ID requerido"]);
    }
}
?>
