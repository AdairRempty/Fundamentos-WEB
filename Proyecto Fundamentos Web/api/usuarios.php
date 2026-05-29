<?php
require_once 'conexion.php';
$method = $_SERVER['REQUEST_METHOD'];

$rol_id = isset($_GET['rol_id']) ? intval($_GET['rol_id']) : 0;
$empresa_id = isset($_GET['empresa_id']) ? intval($_GET['empresa_id']) : 0;

if ($method === 'GET') {
    // Obtencion de ususarios
    try {
        if ($rol_id === 1) {
            $stmt = $conn->query("SELECT u.id, u.email, r.nombre as rol, u.rol_id, e.razon_social as empresa FROM Usuarios u JOIN Roles r ON u.rol_id = r.id LEFT JOIN Empresas e ON u.empresa_id = e.id WHERE u.activo = 1 ORDER BY u.id DESC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } elseif ($rol_id === 2) {
            $stmt = $conn->prepare("SELECT u.id, u.email, r.nombre as rol, u.rol_id, e.razon_social as empresa FROM Usuarios u JOIN Roles r ON u.rol_id = r.id JOIN Empresas e ON u.empresa_id = e.id WHERE u.empresa_id = :eid AND u.activo = 1 ORDER BY u.id DESC");
            $stmt->execute([':eid' => $empresa_id]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } else {
            echo json_encode(["status" => "error", "message" => "Acceso no autorizado a este listado"]);
        }
    } catch(Exception $e) {
        // Filtrado de usuarios por admin de empresa 
        try {
            if ($rol_id === 1) {
                $stmt = $conn->query("SELECT u.id, u.email, r.nombre as rol, u.rol_id, e.razon_social as empresa FROM Usuarios u JOIN Roles r ON u.rol_id = r.id LEFT JOIN Empresas e ON u.empresa_id = e.id ORDER BY u.id DESC");
                echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            } elseif ($rol_id === 2) {
                $stmt = $conn->prepare("SELECT u.id, u.email, r.nombre as rol, u.rol_id, e.razon_social as empresa FROM Usuarios u JOIN Roles r ON u.rol_id = r.id JOIN Empresas e ON u.empresa_id = e.id WHERE u.empresa_id = :eid ORDER BY u.id DESC");
                $stmt->execute([':eid' => $empresa_id]);
                echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            } else {
                echo json_encode(["status" => "error", "message" => "Acceso no autorizado a este listado"]);
            }
        } catch(Exception $e2) {
            echo json_encode(["status" => "error", "message" => "Error BD: " . $e2->getMessage()]);
        }
    }
} elseif ($method === 'POST') {
    // Creacion de usuario para admins
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->email, $data->password)) {
        
        $req_rol_id = isset($data->req_rol_id) ? intval($data->req_rol_id) : 0;
        $req_emp_id = isset($data->req_empresa_id) ? intval($data->req_empresa_id) : 0;
        
        $target_rol = 3;
        $target_emp = $req_emp_id;

        if ($req_rol_id === 1) {
            $target_rol = isset($data->rol_id) ? intval($data->rol_id) : 3;
            $target_emp = (isset($data->empresa_id) && $data->empresa_id !== "" && $data->empresa_id !== 0) ? intval($data->empresa_id) : NULL;
        } elseif ($req_rol_id === 2) {
            $target_rol = 3;
            $target_emp = $req_emp_id;
        } else {
            echo json_encode(["status" => "error", "message" => "Acceso no autorizado para invitar al sistema"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("INSERT INTO Usuarios (email, password, rol_id, empresa_id) VALUES (:email, :password, :rol, :empid)");
            $stmt->execute([
                ':email'    => $data->email,
                ':password' => $data->password,
                ':rol'      => $target_rol,
                ':empid'    => $target_emp
            ]);
            echo json_encode(["status" => "success", "message" => "Usuario habilitado correctamente."]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error (¿Quizás el email ya esté tomado por otra persona?). " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios"]);
    }
} elseif ($method === 'PUT') {
    // Actualizacion de usuario, solo email, rol y contraseña (opcional)
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->id, $data->email, $data->rol_id)) {
        try {
            if (!empty($data->password)) {
                $stmt = $conn->prepare("UPDATE Usuarios SET email = :email, password = :pw, rol_id = :rol WHERE id = :id");
                $stmt->execute([
                    ':email' => $data->email,
                    ':pw' => $data->password,
                    ':rol' => $data->rol_id,
                    ':id' => $data->id
                ]);
            } else {
                $stmt = $conn->prepare("UPDATE Usuarios SET email = :email, rol_id = :rol WHERE id = :id");
                $stmt->execute([
                    ':email' => $data->email,
                    ':rol' => $data->rol_id,
                    ':id' => $data->id
                ]);
            }
            echo json_encode(["status" => "success", "message" => "Usuario actualizado exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al actualizar: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios para actualizar"]);
    }
    // Eliminacion de usuarios logica
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->id)) {
        try {
            $stmt = $conn->prepare("UPDATE Usuarios SET activo = 0 WHERE id = :id");
            $stmt->execute([':id' => $data->id]);
            echo json_encode(["status" => "success", "message" => "Usuario eliminado exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al eliminar usuario: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ID requerido"]);
    }
}
?>
