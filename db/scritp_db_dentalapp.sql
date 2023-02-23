CREATE DATABASE IF NOT EXISTS dentaldb
--CREATE DATABASE `dentaldb` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish2_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE dentaldb;

CREATE TABLE usuarios (
  id INT(11) NOT NULL AUTO_INCREMENT,
  correo VARCHAR(50) DEFAULT NULL,
  llave VARCHAR(30) DEFAULT NULL,
  rol VARCHAR(30) DEFAULT NULL,
  fecha_creacion VARCHAR(30) DEFAULT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE centros (
  id INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(40) DEFAULT NULL,
  telefono VARCHAR(10) DEFAULT NULL,
  correo VARCHAR(30) DEFAULT NULL,
  direccion VARCHAR(100) DEFAULT NULL,
  fecha_creacion VARCHAR(30) DEFAULT NULL,
  id_usuario INT(11) NOT NULL,
  PRIMARY KEY(id)
);


--INSERT INTO usuarios values (1, 'ateno@gmail.com','123456','admin', '2023-02-23 16:40:40');
--INSERT INTO usuarios values (2, 'car@gmail.com','123456','admin', '2023-02-23 16:40:40');

--renombrar nombre de columna
--ALTER TABLE usuarios RENAME COLUMN fecha_creado TO fecha_creacion;

--modificar tipo de dato de la columna
--ALTER TABLE usuarios MODIFY fecha_creacion VARCHAR(30); 

