CREATE DATABASE IF NOT EXISTS ecotrack;
USE ecotrack;

CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    rfc VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT,
    contacto VARCHAR(100),
    giro VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) DEFAULT '',
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    empresa_id INT,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY(rol_id) REFERENCES Roles(id),
    FOREIGN KEY(empresa_id) REFERENCES Empresas(id) ON DELETE SET NULL
);

CREATE TABLE Vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placas VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(100),
    capacidad_carga_kg DECIMAL(10,2),
    chofer VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE Residuos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    precio_compra_kg DECIMAL(10,2),
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE Manifiestos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    empresa_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    estatus VARCHAR(50) NOT NULL DEFAULT 'En tránsito',
    observaciones TEXT,
    FOREIGN KEY(empresa_id) REFERENCES Empresas(id),
    FOREIGN KEY(vehiculo_id) REFERENCES Vehiculos(id)
);

CREATE TABLE Solicitudes_Recoleccion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    fecha_recoleccion DATE NOT NULL,
    materiales TEXT,
    observaciones TEXT,
    estatus VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(empresa_id) REFERENCES Empresas(id)
);

CREATE TABLE Manifiesto_Detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manifiesto_id INT NOT NULL,
    residuo_id INT NOT NULL,
    peso_bruto_kg DECIMAL(10,2),
    peso_neto_kg DECIMAL(10,2),
    FOREIGN KEY(manifiesto_id) REFERENCES Manifiestos(id) ON DELETE CASCADE,
    FOREIGN KEY(residuo_id) REFERENCES Residuos(id)
);

CREATE TABLE Bitacora_Movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_movimiento VARCHAR(20) NOT NULL,
    residuo_id INT NOT NULL,
    cantidad_kg DECIMAL(10,2) NOT NULL,
    origen_destino VARCHAR(150) NOT NULL,
    manifiesto_relacionado_id INT,
    observaciones TEXT,
    FOREIGN KEY(residuo_id) REFERENCES Residuos(id),
    FOREIGN KEY(manifiesto_relacionado_id) REFERENCES Manifiestos(id)
);
