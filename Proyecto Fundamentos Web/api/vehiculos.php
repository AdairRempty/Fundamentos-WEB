<?php
require_once 'conexion.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Vehiculos activos
        $stmt = $conn->query("SELECT * FROM Vehiculos WHERE activo = 1 ORDER BY id DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch(Exception $e) {
        // Todos los vehiculos (incluyendo inactivos)
        try {
            $stmt = $conn->query("SELECT * FROM Vehiculos ORDER BY id DESC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch(Exception $e2) {
            echo json_encode(["status" => "error", "message" => $e2->getMessage()]);
        }
    }
} elseif ($method === 'POST') {
    // Insercion de nuevos vbehiculos
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->placas)) {
        try {
            $stmt = $conn->prepare("INSERT INTO Vehiculos (placas, modelo, capacidad_carga_kg, chofer) VALUES (:placas, :modelo, :capacidad, :chofer)");
            $stmt->execute([
                ':placas'    => $data->placas,
                ':modelo'    => isset($data->modelo) ? $data->modelo : '',
                ':capacidad' => isset($data->capacidad_carga_kg) ? $data->capacidad_carga_kg : 0,
                ':chofer'    => isset($data->chofer) ? $data->chofer : ''
            ]);
            echo json_encode(["status" => "success", "message" => "Vehículo registrado exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al registrar vehículo (¿Placas duplicadas?). " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Las placas son obligatorias"]);
    }
} elseif ($method === 'PUT') {
    // Actualizacion de vehiculo, solo placas, modelo, capacidad y chofer
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->id, $data->placas)) {
        try {
            $stmt = $conn->prepare("UPDATE Vehiculos SET placas = :placas, modelo = :modelo, capacidad_carga_kg = :capacidad, chofer = :chofer WHERE id = :id");
            $stmt->execute([
                ':placas'    => $data->placas,
                ':modelo'    => isset($data->modelo) ? $data->modelo : '',
                ':capacidad' => isset($data->capacidad_carga_kg) ? $data->capacidad_carga_kg : 0,
                ':chofer'    => isset($data->chofer) ? $data->chofer : '',
                ':id'        => $data->id
            ]);
            echo json_encode(["status" => "success", "message" => "Vehículo actualizado exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al actualizar vehículo: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios para la actualización"]);
    }
} elseif ($method === 'DELETE') {
    // Eliminacion logica del vehiculo
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->id)) {
        try {
            $stmt = $conn->prepare("UPDATE Vehiculos SET activo = 0 WHERE id = :id");
            $stmt->execute([':id' => $data->id]);
            echo json_encode(["status" => "success", "message" => "Vehículo eliminado exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al eliminar vehículo: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ID del vehículo requerido"]);
    }
}
?>
