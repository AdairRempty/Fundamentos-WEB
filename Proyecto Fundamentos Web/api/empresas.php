<?php
require_once 'conexion.php';
// Variable general de $_SERVER que contiene los metodos HTTP, en este caso se usara para validar que tipo de consulta se esta haciendo a la API, si es GET, POST, PUT o DELETE.
$method = $_SERVER['REQUEST_METHOD'];

// Ya me cance de comentar los GET y POST es lo mismo, consulta los otros PHP y ya, solo son consultas con binding y fetch, try y catch.
if ($method === 'GET') {
    try {
        $stmt = $conn->query("SELECT id, razon_social, rfc, direccion, contacto, giro FROM Empresas WHERE activo = 1 ORDER BY id DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch(Exception $e) {
        try {
            $stmt = $conn->query("SELECT id, razon_social, rfc, direccion, contacto, giro FROM Empresas ORDER BY id DESC");
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch(Exception $e2) {
            echo json_encode(["status" => "error", "message" => $e2->getMessage()]);
        }
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->razon_social, $data->rfc, $data->giro)) {
        try {
            $stmt = $conn->prepare("INSERT INTO Empresas (razon_social, rfc, direccion, contacto, giro) VALUES (:rs, :rfc, :dir, :cont, :giro)");
            $stmt->execute([
                ':rs'   => $data->razon_social,
                ':rfc'  => $data->rfc,
                ':dir'  => isset($data->direccion) ? $data->direccion : '',
                ':cont' => isset($data->contacto) ? $data->contacto : '',
                ':giro' => $data->giro
            ]);
            echo json_encode(["status" => "success", "message" => "Empresa registrada exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al registrar la empresa. Verifica que el RFC no esté duplicado. " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios"]);
    }

    // Para actualizar es un PUT, se puede hacer con POST pero segun cuando le pregunte a Gemini 3.1 como se hacian las actualizaciones en PHP me recomendo manejar el metodo PUT ya que es un estandar de la industria.
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->id, $data->razon_social, $data->rfc, $data->giro)) {
        try {
            $stmt = $conn->prepare("UPDATE Empresas SET razon_social = :rs, rfc = :rfc, direccion = :dir, contacto = :cont, giro = :giro WHERE id = :id");
            $stmt->execute([
                ':rs' => $data->razon_social,
                ':rfc' => $data->rfc,
                ':dir' => isset($data->direccion) ? $data->direccion : '',
                ':cont' => isset($data->contacto) ? $data->contacto : '',
                ':giro' => $data->giro,
                ':id' => $data->id
            ]);
            echo json_encode(["status" => "success", "message" => "Empresa actualizada exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al actualizar la empresa: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios para actualizar"]);
    }

    // Para eliminar solo estoy haciendo eliminacion logica, solo cambiando el activo por inactivo, por eso no es una consulta de DELETE, solo un Update. En si esto es un PUT pero para no perder la logica con lo anterior mencionado de metodos PUT en lugar de POST.
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    if(isset($data->id)) {
        try {
            $stmt = $conn->prepare("UPDATE Empresas SET activo = 0 WHERE id = :id");
            $stmt->execute([':id' => $data->id]);
            echo json_encode(["status" => "success", "message" => "Empresa eliminada exitosamente"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al eliminar empresa: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ID requerido"]);
    }
}
?>
