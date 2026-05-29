<?php
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Listar manifiestos
    $rol_id = isset($_GET['rol_id']) ? intval($_GET['rol_id']) : 0;
    $empresa_id = isset($_GET['empresa_id']) ? intval($_GET['empresa_id']) : 0;

    $sql = "SELECT m.id, m.folio, m.fecha, m.estatus, m.vehiculo_id, e.razon_social as empresa, v.placas, v.modelo, v.chofer 
            FROM Manifiestos m 
            JOIN Empresas e ON m.empresa_id = e.id 
            JOIN Vehiculos v ON m.vehiculo_id = v.id";
            
    // Si es cliente, filtrar por la empresa
    if ($rol_id === 2 || $rol_id === 3) {
        $sql .= " WHERE m.empresa_id = :empresa_id";
    }
    
    $sql .= " ORDER BY m.fecha DESC";

    try {
        $stmt = $conn->prepare($sql);
        if ($rol_id === 2 || $rol_id === 3) {
            $stmt->bindParam(':empresa_id', $empresa_id);
        }
        $stmt->execute();
        $manifiestos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // PAra la vista cliente se tiene que incluir el detalle de residuos a simple vista ya que con eso suelen cobrar o pagar, asi que es importante tenerlo a la mano.
        if ($rol_id === 2 || $rol_id === 3) {
            foreach($manifiestos as &$m) {
                $stmtDet = $conn->prepare("SELECT r.nombre, md.peso_neto_kg FROM Manifiesto_Detalle md JOIN Residuos r ON md.residuo_id = r.id WHERE md.manifiesto_id = :mid");
                $stmtDet->bindParam(':mid', $m['id']);
                $stmtDet->execute();
                $detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);
                
                $mat_string = [];
                foreach($detalles as $d) {
                    $mat_string[] = $d['nombre'] . ' ('. $d['peso_neto_kg'] .'kg)';
                }
                $m['materiales_estimado'] = implode(', ', $mat_string);
            }
        }

        echo json_encode(["status" => "success", "data" => $manifiestos]);
    } catch(Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }

} elseif ($method === 'POST') {
    // Crear manifiesto
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->empresa_id, $data->fecha, $data->folio, $data->vehiculo_id, $data->estatus, $data->residuos)) {
        try {
            $conn->beginTransaction();

            // Preparacion de insercion del manifiesto
            $stmt = $conn->prepare("INSERT INTO Manifiestos (folio, fecha, empresa_id, vehiculo_id, estatus, observaciones) VALUES (:folio, :fecha, :empresa, :vehiculo, :estatus, :observaciones)");
            $stmt->execute([
                ':folio' => $data->folio,
                ':fecha' => $data->fecha,
                ':empresa' => $data->empresa_id,
                ':vehiculo' => $data->vehiculo_id,
                ':estatus' => $data->estatus,
                ':observaciones' => isset($data->observaciones) ? $data->observaciones : ''
            ]);
            $manifiesto_id = $conn->lastInsertId();

            // Detalles del manifiesto
            $stmtDetalle = $conn->prepare("INSERT INTO Manifiesto_Detalle (manifiesto_id, residuo_id, peso_bruto_kg, peso_neto_kg) VALUES (:mid, :rid, :pb, :pn)");
            
            // Insercion a la bitacora de forma automatizada
            $stmtBitacora = $conn->prepare("INSERT INTO Bitacora_Movimientos (tipo_movimiento, residuo_id, cantidad_kg, origen_destino, manifiesto_relacionado_id, observaciones) VALUES ('Entrada', :rid, :cant, 'Recibido por Manifiesto', :mid, 'Recepción automatizada en Acopio central')");

            // Recorre cada residuo enviado en el manifiesto y hace las inserciones correspondientes en detalle y bitacora
            foreach($data->residuos as $res) {
                // Insert Detalle
                $stmtDetalle->execute([
                    ':mid' => $manifiesto_id,
                    ':rid' => $res->id,
                    ':pb' => $res->peso_bruto,
                    ':pn' => $res->peso_neto
                ]);

                // Insert Bitácora
                $stmtBitacora->execute([
                    ':rid' => $res->id,
                    ':cant'=> $res->peso_neto,
                    ':mid' => $manifiesto_id
                ]);
            }

            $conn->commit();
            echo json_encode(["status" => "success", "message" => "Manifiesto guardado correctamente"]);

        } catch(Exception $e) {
            $conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Error guardando: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    }

    // Para actualizar el manifiesto, principalmente para cambiar el estatus a 'En tránsito' o 'Finalizado', lo cual es importante para la trazabilidad.
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id, $data->folio, $data->fecha, $data->vehiculo_id, $data->estatus)) {
        try {
            $stmt = $conn->prepare("UPDATE Manifiestos SET folio = :folio, fecha = :fecha, vehiculo_id = :vehiculo, estatus = :estatus WHERE id = :id");
            $stmt->execute([
                ':folio' => $data->folio,
                ':fecha' => $data->fecha,
                ':vehiculo' => $data->vehiculo_id,
                ':estatus' => $data->estatus,
                ':id' => $data->id
            ]);
            echo json_encode(["status" => "success", "message" => "Manifiesto actualizado correctamente (metadatos)"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al actualizar manifiesto: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Datos incompletos para actualizar manifiesto"]);
    }

    // Eliminacion logica del manifiesto, solo se cambia el estatus a 'Anulado' para mantener la trazabilidad pero marcar que ese manifiesto ya no es valido.
} elseif ($method === 'DELETE') {
    
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id)) {
        try {
            $stmt = $conn->prepare("UPDATE Manifiestos SET estatus = 'Anulado' WHERE id = :id");
            $stmt->execute([':id' => $data->id]);
            echo json_encode(["status" => "success", "message" => "Manifiesto marcado como Anulado"]);
        } catch(Exception $e) {
            echo json_encode(["status" => "error", "message" => "Error al anular manifiesto: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ID requerido para anular manifiesto"]);
    }
}
?>
