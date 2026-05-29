<?php
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

// Obtencion de los datos del usuario para mostrar en el perfil, o para actualizar su informacion
if ($method === 'GET') {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    try {
        $stmt = $conn->prepare("SELECT u.nombre, u.email, u.empresa_id, e.razon_social, e.rfc, e.direccion, e.contacto, e.giro FROM Usuarios u LEFT JOIN Empresas e ON u.empresa_id = e.id WHERE u.id = :uid LIMIT 1");
        $stmt->execute([':uid' => $user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $data]);
    } catch(Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $user_id = intval($data->user_id);
    
    try {
        $conn->beginTransaction();
        
        // Actualizar usuario (el correo es obligatorio, contraseña opcional)
        if(!empty($data->password)) {
            $stmt = $conn->prepare("UPDATE Usuarios SET nombre = :nombre, email = :email, password = :password WHERE id = :uid");
            $stmt->execute([':nombre' => $data->nombre, ':email' => $data->email, ':password' => $data->password, ':uid' => $user_id]);
        } else {
            $stmt = $conn->prepare("UPDATE Usuarios SET nombre = :nombre, email = :email WHERE id = :uid");
            $stmt->execute([':nombre' => $data->nombre, ':email' => $data->email, ':uid' => $user_id]);
        }

        // Actualizar informacion de empresa si es que tiene una asociada
        if(isset($data->empresa_id) && $data->empresa_id > 0 && $data->empresa_id !== 'null') {
            $stmtEmp = $conn->prepare("UPDATE Empresas SET razon_social = :rs, rfc = :rfc, direccion = :dir, contacto = :cont, giro = :giro WHERE id = :eid");
            $stmtEmp->execute([
                ':rs' => $data->razon_social,
                ':rfc' => $data->rfc,
                ':dir' => $data->direccion,
                ':cont' => $data->contacto,
                ':giro' => $data->giro,
                ':eid' => intval($data->empresa_id)
            ]);
        }
        
        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Perfil actualizado de forma exitosa."]);
    } catch(Exception $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => "Error al actualizar (¿Quizás el correo o RFC ya están reclamados por otra cuenta?)."]);
    }
}
?>
