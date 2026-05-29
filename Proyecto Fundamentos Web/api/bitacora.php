<?php
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Como este metodo ocupa que reciba el parametro 'tipo', se asegura con isset que exista y si no se le asigna el valor 'all' para que muestre todo, pero si se le asigna el valor 'entradas' entonces se ejecuta la consulta para mostrar solo las entradas.
    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'all';

    // Búsqueda de 'entradas' para generar salidas
    if ($tipo === 'entradas') {
        $fecha  = isset($_GET['fecha'])    ? $_GET['fecha']    : '';
        $emp    = isset($_GET['empresa'])  ? '%'.$_GET['empresa'].'%' : '%';
        $mat    = isset($_GET['material']) ? '%'.$_GET['material'].'%' : '%';

        try {
            $sql = "SELECT 
                        b.id, b.fecha_movimiento, b.cantidad_kg, b.observaciones,
                        r.id as residuo_id, r.nombre as residuo, r.codigo,
                        e.razon_social as empresa,
                        m.folio, m.id as manifiesto_id
                    FROM Bitacora_Movimientos b
                    JOIN Residuos r  ON b.residuo_id = r.id
                    LEFT JOIN Manifiestos m ON b.manifiesto_relacionado_id = m.id
                    LEFT JOIN Empresas e    ON m.empresa_id = e.id
                    WHERE b.tipo_movimiento = 'Entrada'
                      AND r.nombre LIKE :mat
                      AND (e.razon_social LIKE :emp OR e.razon_social IS NULL)";
            if ($fecha) $sql .= " AND DATE(b.fecha_movimiento) = :fecha";
            $sql .= " ORDER BY b.fecha_movimiento DESC LIMIT 100";

            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':mat', $mat); // Nombre del residuuo
            $stmt->bindParam(':emp', $emp); // Nombre de la empresa (Razón social)
            if ($fecha) $stmt->bindParam(':fecha', $fecha);
            $stmt->execute();
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }

    // Lista todos los objetos de la bitacora
    try {
        $sql = "SELECT b.id, b.fecha_movimiento, b.tipo_movimiento, r.nombre as residuo, 
                       b.cantidad_kg, b.origen_destino, m.folio, b.observaciones 
                FROM Bitacora_Movimientos b
                JOIN Residuos r ON b.residuo_id = r.id
                LEFT JOIN Manifiestos m ON b.manifiesto_relacionado_id = m.id
                ORDER BY b.fecha_movimiento DESC";
        $stmt = $conn->query($sql);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch(Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }

    // Toma los datos de 'entrada' para generar 'salida' de las bitacoras
} elseif ($method === 'POST') {
    // Como es generar ahora uso POST
    $data = json_decode(file_get_contents("php://input"));

    // Primer caso: No estan los datos completos
    if (!isset($data->residuo_id, $data->cantidad_kg, $data->destino)) {
        echo json_encode(["status" => "error", "message" => "Datos incompletos para registrar la salida."]);
        exit;
    }

    try {
        // If ternario para asignar una fecha de salida estandar.
        $fechaSalida = !empty($data->fecha_salida) ? $data->fecha_salida : date('Y-m-d');
        // Prepara la insercion de la salida con los datos recibidos.
        $stmt = $conn->prepare("INSERT INTO Bitacora_Movimientos 
            (tipo_movimiento, residuo_id, cantidad_kg, origen_destino, manifiesto_relacionado_id, observaciones, fecha_movimiento)
            VALUES ('Salida', :rid, :kg, :destino, :mid, :obs, :fecha)");
        // Ejecucion de insercion meidiante variables.
        $stmt->execute([
            ':rid'     => $data->residuo_id,
            ':kg'      => $data->cantidad_kg,
            ':destino' => $data->destino,
            ':mid'     => $data->manifiesto_id ?? null,
            ':obs'     => $data->observaciones ?? 'Salida generada desde Bitácora',
            ':fecha'   => $fechaSalida
        ]);
        // Practicamente todos estos mensajes los voy a mandar al popup del navegador para evitar hacer insersiones de mas HTML.
        echo json_encode(["status" => "success", "message" => "Movimiento de Salida registrado correctamente."]);
    } catch(Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
