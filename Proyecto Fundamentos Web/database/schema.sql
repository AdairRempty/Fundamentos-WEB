-- Esquema de Base de Datos para EcoTrack (SQLite)

-- Tabla de Roles (Administrador, Cliente, Visitante)
CREATE TABLE IF NOT EXISTS Roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

-- Tabla de Usuarios (Autenticación)
CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol_id INTEGER NOT NULL,
    activo INTEGER DEFAULT 1,
    FOREIGN KEY(rol_id) REFERENCES Roles(id)
);

-- Tabla de Empresas/Clientes (Datos Fiscales)
CREATE TABLE IF NOT EXISTS Empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE,
    razon_social TEXT NOT NULL,
    rfc TEXT UNIQUE NOT NULL,
    direccion TEXT,
    contacto TEXT,
    giro TEXT,
    activo INTEGER DEFAULT 1,
    FOREIGN KEY(usuario_id) REFERENCES Usuarios(id)
);

-- Catálogo de Vehículos (Logística)
CREATE TABLE IF NOT EXISTS Vehiculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    placas TEXT UNIQUE NOT NULL,
    modelo TEXT,
    capacidad_carga_kg REAL,
    chofer TEXT NOT NULL,
    activo INTEGER DEFAULT 1
);

-- Catálogo de Tipos de Residuos (Inventario)
CREATE TABLE IF NOT EXISTS Residuos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    codigo TEXT UNIQUE NOT NULL,
    precio_compra_kg REAL,
    descripcion TEXT,
    activo INTEGER DEFAULT 1
);

-- Tabla de Manifiestos (Transaccional)
CREATE TABLE IF NOT EXISTS Manifiestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folio TEXT UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    empresa_id INTEGER NOT NULL,
    vehiculo_id INTEGER NOT NULL,
    estatus TEXT NOT NULL DEFAULT 'En tránsito', -- En tránsito, Recibido, Procesado
    observaciones TEXT,
    FOREIGN KEY(empresa_id) REFERENCES Empresas(id),
    FOREIGN KEY(vehiculo_id) REFERENCES Vehiculos(id)
);

CREATE TABLE IF NOT EXISTS Solicitudes_Recoleccion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    fecha_recoleccion DATE NOT NULL,
    materiales TEXT,
    observaciones TEXT,
    estatus TEXT NOT NULL DEFAULT 'Pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(empresa_id) REFERENCES Empresas(id)
);

-- Detalles de Residuos por Manifiesto
CREATE TABLE IF NOT EXISTS Manifiesto_Detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manifiesto_id INTEGER NOT NULL,
    residuo_id INTEGER NOT NULL,
    peso_bruto_kg REAL,
    peso_neto_kg REAL,
    FOREIGN KEY(manifiesto_id) REFERENCES Manifiestos(id) ON DELETE CASCADE,
    FOREIGN KEY(residuo_id) REFERENCES Residuos(id)
);

-- Bitácora de Movimientos (Diario de Entradas y Salidas)
CREATE TABLE IF NOT EXISTS Bitacora_Movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_movimiento TEXT NOT NULL, -- 'Entrada' o 'Salida'
    residuo_id INTEGER NOT NULL,
    cantidad_kg REAL NOT NULL,
    origen_destino TEXT NOT NULL,
    manifiesto_relacionado_id INTEGER,
    observaciones TEXT,
    FOREIGN KEY(residuo_id) REFERENCES Residuos(id),
    FOREIGN KEY(manifiesto_relacionado_id) REFERENCES Manifiestos(id)
);
