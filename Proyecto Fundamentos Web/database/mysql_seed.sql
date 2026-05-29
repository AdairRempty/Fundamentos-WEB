-- Roles
INSERT INTO Roles (nombre) VALUES 
('SuperAdmin (EcoTrack)'), 
('Admin de Empresa'), 
('Empleado de Empresa');

-- Empresas (Primero, para que Usuarios pueda referenciarlas)
INSERT INTO Empresas (razon_social, rfc, direccion, contacto, giro) VALUES
('Industrias del Norte SA', 'IND890101XYZ', 'Av. Industrial 100, Zona N', 'Juan Perez', 'Generador Industrial'),
('Manufacturas Globales SA', 'MAG990202ABC', 'Carr. 57 Km 10', 'Maria Gomez', 'Transportista Autorizado'),
('TecnoAmbientales del Centro', 'TEC123456QWE', 'Parque Industrial W', 'Roberto Carlos', 'Centro de Acopio'),
('Logística Nacional de Residuos', 'LNR789012POI', 'Av. Central 500', 'Luis Fernando', 'Transportista Autorizado'),
('Plástico Reciclados del Valle', 'PRV112233ASD', 'Calle 5 Mz 3', 'Ana Silvia', 'Generador Industrial');

-- Usuarios
INSERT INTO Usuarios (email, password, rol_id, empresa_id) VALUES 
('admin@correo.com', 'password', 1, NULL),
('cliente@correo.com', 'password', 2, 1),
('contacto@manufacturas.com', 'cliente123', 2, 2),
('operaciones@tecnoambientales.com', 'tecnopass', 2, 3),
('logistica@nacional.com', 'logpass', 3, 4);

-- Vehículos
INSERT INTO Vehiculos (placas, modelo, capacidad_carga_kg, chofer) VALUES
('TXY-123', 'Ford F-350 2020', 3500.0, 'Miguel Robles'),
('ZAR-456', 'Mercedes Benz 2018', 8000.0, 'Carlos Santana'),
('JHK-789', 'Kenworth T680 2021', 15000.0, 'José Rodríguez'),
('LMP-321', 'Volvo VNL 2019', 12000.0, 'Pedro Sánchez'),
('ABC-987', 'Chevrolet Silverado', 2500.0, 'Santiago Gómez');

-- Residuos
INSERT INTO Residuos (nombre, codigo, precio_compra_kg, descripcion) VALUES
('Cartón y Papel', 'RES-001', 1.50, 'Cartón corrugado y papel archivo limpio'),
('Plástico PET', 'RES-002', 4.00, 'Botellas y envases PET limpios'),
('Aceite Usado', 'RES-003', 2.00, 'Aceite vegetal y mineral usado recolección'),
('Chatarra Mixta', 'RES-004', 3.50, 'Recorte industrial metálico'),
('Aluminio (Latas)', 'RES-005', 15.00, 'Latas de aluminio prensadas o sueltas');

-- Manifiestos
INSERT INTO Manifiestos (folio, fecha, empresa_id, vehiculo_id, estatus) VALUES
('SGM-20394', '2026-10-24', 1, 1, 'En tránsito'),
('SGM-20393', '2026-10-22', 2, 2, 'Recibido'),
('SGM-21005', '2026-10-25', 1, 3, 'Recibido'),
('SGM-21008', '2026-10-26', 5, 4, 'En tránsito'),
('SGM-21010', '2026-10-27', 4, 1, 'Recibido');

-- Detalles (Pesos)
INSERT INTO Manifiesto_Detalle (manifiesto_id, residuo_id, peso_bruto_kg, peso_neto_kg) VALUES
(1, 1, 600.0, 500.0),
(1, 2, 250.0, 200.0),
(2, 3, 50.0, 50.0),
(3, 4, 1500.0, 1450.0),
(3, 5, 300.0, 280.0),
(4, 2, 800.0, 750.0),
(5, 1, 1200.0, 1100.0),
(5, 4, 400.0, 390.0);

-- Bitácora
INSERT INTO Bitacora_Movimientos (tipo_movimiento, residuo_id, cantidad_kg, origen_destino, manifiesto_relacionado_id, observaciones) VALUES
('Entrada', 1, 500.0, 'Industrias del Norte SA', 1, 'Recepción de cartón según manifiesto #SGM-20394'),
('Entrada', 2, 200.0, 'Industrias del Norte SA', 1, 'Recepción de PET según manifiesto #SGM-20394'),
('Entrada', 3, 50.0, 'Manufacturas Globales SA', 2, 'Recepción de Aceite #SGM-20393'),
('Salida', 1, 300.0, 'Recicladora Total (Destino Final)', NULL, 'Venta de cartón procesado'),
('Entrada', 4, 1450.0, 'Industrias del Norte SA', 3, 'Recepción Chatarra #SGM-21005');
