-- Archivo Seeder para inicializar datos de prueba en EcoTrack

-- Roles
INSERT INTO Roles (nombre) VALUES 
('Administrador'), 
('Cliente'), 
('Visitante');

-- Usuarios Iniciales (Contraseñas simuladas en texto plano por fines académicos)
INSERT INTO Usuarios (email, password, rol_id) VALUES 
('admin@correo.com', 'password', 1),
('cliente@correo.com', 'password', 2),
('contacto@manufacturas.com', 'cliente123', 2);

-- Empresas (Asociadas a los clientes)
INSERT INTO Empresas (usuario_id, razon_social, rfc, direccion, contacto, giro) VALUES
(2, 'Industrias del Norte SA', 'IND890101XYZ', 'Av. Industrial 100, Zona N', 'Juan Perez', 'Generador Industrial'),
(3, 'Manufacturas Globales SA', 'MAG990202ABC', 'Carr. 57 Km 10', 'Maria Gomez', 'Transportista');

-- Vehículos y Transportistas
INSERT INTO Vehiculos (placas, modelo, capacidad_carga_kg, chofer) VALUES
('TXY-123', 'Ford F-350 2020', 3500.0, 'Miguel Robles'),
('ZAR-456', 'Mercedes Benz 2018', 8000.0, 'Carlos Santana');

-- Tipos de Residuos Aceptados
INSERT INTO Residuos (nombre, codigo, precio_compra_kg, descripcion) VALUES
('Cartón y Papel', 'RES-001', 1.50, 'Cartón corrugado y papel archivo limpio'),
('Plástico PET', 'RES-002', 4.00, 'Botellas y envases PET limpios'),
('Aceite Usado', 'RES-003', 2.00, 'Aceite vegetal y mineral usado recolección');

-- Manifiestos de prueba
INSERT INTO Manifiestos (folio, fecha, empresa_id, vehiculo_id, estatus) VALUES
('SGM-20394', '2026-10-24', 1, 1, 'En tránsito'),
('SGM-20393', '2026-10-22', 2, 2, 'Recibido');

-- Detalles de los manifiestos
INSERT INTO Manifiesto_Detalle (manifiesto_id, residuo_id, peso_bruto_kg, peso_neto_kg) VALUES
(1, 1, 600.0, 500.0),
(1, 2, 250.0, 200.0),
(2, 3, 50.0, 50.0);

-- Bitácora (Entradas y Salidas Simuladas)
INSERT INTO Bitacora_Movimientos (tipo_movimiento, residuo_id, cantidad_kg, origen_destino, manifiesto_relacionado_id, observaciones) VALUES
('Entrada', 1, 500.0, 'Industrias del Norte SA', 1, 'Recepción de cartón según manifiesto #SGM-20394'),
('Entrada', 2, 200.0, 'Industrias del Norte SA', 1, 'Recepción de PET limpio'),
('Entrada', 3, 50.0, 'Manufacturas Globales SA', 2, 'Tambor de aceite usado verificado'),
('Salida', 1, 300.0, 'Planta Recicladora Externa SA', NULL, 'Envío de pacas de cartón procesado');
