<?php
require_once 'conexion.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->empresa_id, $data->fecha_recoleccion)) {
        try {
            $stmt = $conn->prepare("INSERT INTO Solicitudes_Recoleccion (empresa_id, fecha_recoleccion, materiales, observaciones, estatus) VALUES (:empresa_id, :fecha, :materiales, :observaciones, 'Pendiente')");
            $stmt->execute([
                ':empresa_id' => $data->empresa_id,
                ':fecha' => $data->fecha_recoleccion,
                ':materiales' => isset($data->materiales) ? $data->materiales : '',
                ':observaciones' => isset($data->observaciones) ? $data->observaciones : ''
            ]);
            echo json_encode(["status" => "success", "message" => "Solicitud registrada correctamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al registrar la solicitud: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Metodo no permitido"]);
}
?>
