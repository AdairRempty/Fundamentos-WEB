<?php
require_once 'conexion.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if(isset($data->razon, $data->rfc, $data->giro, $data->contacto, $data->email, $data->password, $data->direccion)) {
        try {
            $conn->beginTransaction();

            // Cuando una empresa ya esta registrada, no se permite otra cuenta del mismo RFC
            $stmt = $conn->prepare("SELECT id FROM Empresas WHERE rfc = :rfc LIMIT 1");
            $stmt->execute([':rfc' => $data->rfc]);
            if($stmt->fetch()) {
                throw new Exception("RFC ya registrado en EcoTrack. Pídele al administrador de tu empresa que te genere un usuario desde su panel.");
            }

            // Insercion de empresa
            $stmtEmp = $conn->prepare("INSERT INTO Empresas (razon_social, rfc, direccion, contacto, giro) VALUES (:razon, :rfc, :dir, :contacto, :giro)");
            $stmtEmp->execute([
                ':razon' => $data->razon,
                ':rfc' => $data->rfc,
                ':dir' => $data->direccion,
                ':contacto' => $data->contacto,
                ':giro' => $data->giro
            ]);
            $empresa_id = $conn->lastInsertId();

            // Insercion de Usuario Admin de Empresa (Valor 2)
            $stmtUsu = $conn->prepare("INSERT INTO Usuarios (email, password, rol_id, empresa_id) VALUES (:email, :pass, 2, :emp_id)");
            $stmtUsu->execute([
                ':email' => $data->email,
                ':pass' => $data->password,
                ':emp_id' => $empresa_id
            ]);

            $conn->commit();
            echo json_encode(["status" => "success", "message" => "Empresa registrada con éxito. Ya puedes iniciar sesión."]);

        } catch(Exception $e) {
            $conn->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios"]);
    }
}
?>
