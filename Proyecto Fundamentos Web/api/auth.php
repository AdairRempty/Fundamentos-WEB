<?php
require_once 'conexion.php';
// Puente para sql usando PDO (PHP Data Objects)

// Obtener datos de <body> como JSON
$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    $email = trim($data->email);
    $pswd = trim($data->password);

    try {
        // $stmt standard variable para consultas preparadas
        // Por temas de seguridad es mejor usar esta variable ya que se asegura que los datos se traten como parámetros y no como parte de la consulta SQL, evitando así inyecciones SQL.

        // Consulta para verificar credenciales coincidan con la base de datos.
        $stmt = $conn->prepare("SELECT id, nombre, email, rol_id, empresa_id FROM Usuarios WHERE email = :email AND password = :password LIMIT 1");
        // $conn variable de connect para hacer la conexion con sql.
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $pswd);
        $stmt->execute();
        // Almacena el input en $email y $pswd, luego se ejecuta la consulta preparada con esos parámetros. Si la consulta devuelve al menos una fila, significa que las credenciales son correctas y se procede a obtener los datos del usuario. Si no, se devuelve un mensaje de error indicando que las credenciales son incorrectas.

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            // Fetch de la fila para almacenar en $user.
            
            // Buscar nombre de la empresa
            $empresa_name = "";
            $empresa_id = $user['empresa_id'];
            if ($empresa_id) {
                // Prepara la busqueda con la variable del statement.
                $stmtEmp = $conn->prepare("SELECT razon_social FROM Empresas WHERE id = :eid LIMIT 1");
                // Vincula el parametro de busqueda.
                $stmtEmp->bindParam(':eid', $empresa_id);
                // Ejecuta la consulta (statement).
                $stmtEmp->execute();
                if ($stmtEmp->rowCount() > 0) {
                    // Si encuentra algo en la consulta, se almacena el resultado en $empresa y luego se extrae el nombre de la empresa para incluirlo en la respuesta JSON.
                    $empresa = $stmtEmp->fetch(PDO::FETCH_ASSOC);
                    $empresa_name = $empresa['razon_social'];
                }
            }

            echo json_encode([
                "status" => "success",
                "message" => "Login exitoso",
                "data" => [
                    "id" => $user['id'],
                    "nombre" => $user['nombre'],
                    "email" => $user['email'],
                    "rol_id" => $user['rol_id'],
                    "empresa_id" => $empresa_id,
                    "r_name" => $user['rol_id'] == 1 ? 'Administrador Central' : ($user['rol_id'] == 2 ? 'Admin Empresa' : 'Empleado Operativo'),
                    "empresa_nombre" => $empresa_name
                ]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
        }
    } catch(Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error de servidor"]);
        // Este error es generico pero pasa cuando falla XAMPP.
    }
} else {
    echo json_encode(["status" => "error", "message" => "Faltan parámetros importantes"]);
}
?>
