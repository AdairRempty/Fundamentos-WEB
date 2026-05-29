<?php
require_once 'conexion.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if (!$id) {
    echo json_encode(["status" => "error", "message" => "ID de manifiesto inválido"]);
    exit;
}

try {
    // Datos principales del manifiesto + empresa generadora + vehículo
    $stmt = $conn->prepare("
        SELECT 
            m.id, m.folio, m.fecha, m.estatus,
            e.razon_social, e.rfc, e.direccion, e.contacto, e.giro,
            v.placas, v.modelo, v.chofer, v.capacidad_carga_kg
        FROM Manifiestos m
        LEFT JOIN Empresas e ON m.empresa_id = e.id
        LEFT JOIN Vehiculos v ON m.vehiculo_id = v.id
        WHERE m.id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $manifiesto = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$manifiesto) {
        echo json_encode(["status" => "error", "message" => "Manifiesto no encontrado"]);
        exit;
    }

    // Detalles de residuos del manifiesto
    $stmtDet = $conn->prepare("
        SELECT 
            r.codigo, r.nombre, r.descripcion,
            md.peso_bruto_kg, md.peso_neto_kg
        FROM Manifiesto_Detalle md
        LEFT JOIN Residuos r ON md.residuo_id = r.id
        WHERE md.manifiesto_id = :id
    ");
    $stmtDet->execute([':id' => $id]);
    $residuos = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

    $manifiesto['residuos'] = $residuos;

    echo json_encode(["status" => "success", "data" => $manifiesto]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
