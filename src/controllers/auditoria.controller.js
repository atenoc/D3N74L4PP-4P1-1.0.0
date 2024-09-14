import { pool } from "../db.js";

export const registroAcceso = async (id_usuario, ip_origen, estado, fecha) => {

  try {
    const [result] = await pool.execute(`
      INSERT INTO accesos (id_usuario, ip_origen, estado, fecha_evento)  VALUES (UUID_TO_BIN(?),?,?,?)`,
      [id_usuario, ip_origen, estado, fecha]
    );
  
    if (result.affectedRows === 1) {
      console.log("Acceso Registrado")
    }
  } catch (error) {
    console.error("Error ACCESO, al registrar acceso: ", error);
    throw error; 
  }
    
};

export const getAccesoByIdUsuario = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
	      id, BIN_TO_UUID(id_usuario)id_usuario, ip_origen, estado, DATE_FORMAT(fecha_evento,'%d/%m/%Y %H:%i:%s') AS fecha_evento
      FROM accesos
      WHERE BIN_TO_UUID(id_usuario) = ? 
      ORDER BY id DESC LIMIT 1 OFFSET 1`
      ,[id]);

    if (rows.length <= 0) {
      console.log("Id no encontrado")
      return res.status(404).json({ message: "Id usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error AUDITORIA, al obtener la fecha de acceso: ", error);
    return res.status(500).json({ message: "Ocurrió un error al obtener la fecha del acceso" });
  }
};


export const registroAuditoria = async (id_registro, id_usuario, id_clinica, tipo_evento, tabla_afectada, fecha_evento) => {
  try {
    console.log("------------------------------------------------------------------------------------------------------------Registro Auditoria...")
    console.log("id_registro: "+id_registro)
    console.log("id_usuario: "+id_usuario)
    console.log("id_clinica: "+id_clinica)
    console.log("tipo_evento: "+tipo_evento)
    console.log("tabla_afectada: "+tabla_afectada)
    console.log("fecha_evento: "+fecha_evento)
    console.log("------------------------------------------------------------------------------------------------------------Registro Auditoria")

    const [result] = await pool.execute(`
      INSERT INTO auditoria (id_registro, id_usuario, id_clinica, tipo_evento, tabla_afectada, fecha_evento) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?,?,?)`,
      [id_registro, id_usuario, id_clinica, tipo_evento, tabla_afectada, fecha_evento]
    );

    if (result.affectedRows === 1) {
      console.log("Actividad Registrada")
    }
  } catch (error) {
    console.error("Error AUDITORIA, al insertar el registro: ", error);
    throw error; 
  }
  
};

export const getUsuarioCreadorRegistro = async (id_registro) => {
  try {
    const [rows] = await pool.query(`
      SELECT BIN_TO_UUID(id_usuario) AS id_usuario_creador FROM auditoria WHERE tipo_evento = 'CREATE' AND BIN_TO_UUID(id_registro) = ?`,
      [id_registro]
    );

    if (rows.length === 0) {
      console.log("X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X No se encontró ningún 'USUARIO CREADOR' para el registro: "+id_registro);
      return null; 
    }

    const id_usuario_creador=rows[0].id_usuario_creador
    const [rowsNomUs] = await pool.query(`
      SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) AS nombre_usuario_creador FROM usuarios WHERE BIN_TO_UUID(id)= ?`,
      [id_usuario_creador]
    );

    return rowsNomUs[0].nombre_usuario_creador; 

  } catch (error) {
    console.error("Error AUDITORIA, al obtener el usuario creador: ", error);
    throw error; 
  }
};


export const getFechaCreacionRegistro = async (id_registro) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(fecha_evento,'%d/%m/%Y %H:%i:%s') AS fecha_evento FROM auditoria WHERE tipo_evento = 'CREATE' AND BIN_TO_UUID(id_registro) = ?`,
      [id_registro]
    );

    if (rows.length === 0) {
      console.log("X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X X No se encontró ninguna 'FECHA CREACION' para el registro: "+id_registro);
      return null; 
    }

    return rows[0].fecha_evento; 

  } catch (error) {
    console.error("Error AUDITORIA, al obtener la fecha de creación: ", error);
    throw error; 
  }
};

export const getUsuarioActualizoRegistro = async (id_registro) => {
  try {
    const [rows] = await pool.query(`
      SELECT BIN_TO_UUID(id_usuario) AS id_usuario_actualizo FROM auditoria WHERE tipo_evento = 'UPDATE' AND BIN_TO_UUID(id_registro) = ? ORDER BY id DESC LIMIT 1`,
      [id_registro]
    );

    if (rows.length === 0) {
      console.log("No cuenta con usuario de actualización el registro: "+id_registro);
      return null; 
    }

    console.log("ID USUARIO ACTUALIZO:: "+rows[0].id_usuario_actualizo)

    const id_usuario_actualizo=rows[0].id_usuario_actualizo
    const [rowsNomUs] = await pool.query(`
      SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) AS nombre_usuario_actualizo FROM usuarios WHERE BIN_TO_UUID(id)= ?`,
      [id_usuario_actualizo]
    );

    console.log("NOMBRE USER ACTUALIZO:: "+ rowsNomUs[0].nombre_usuario_actualizo)

    return rowsNomUs[0].nombre_usuario_actualizo; 

  } catch (error) {
    console.error("Error AUDITORIA, al obtener el usuario que actualizó: ", error);
    throw error; 
  }
};


export const getFechaActualizacionRegistro = async (id_registro) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(fecha_evento,'%d/%m/%Y %H:%i:%s') AS fecha_evento FROM auditoria WHERE tipo_evento = 'UPDATE' AND BIN_TO_UUID(id_registro) = ? ORDER BY id DESC LIMIT 1`,
      [id_registro]
    );

    if (rows.length === 0) {
      console.log("No cuenta con fecha de actualización el registro: "+id_registro);
      return null; 
    }

    return rows[0].fecha_evento; 

  } catch (error) {
    console.error("Error AUDITORIA, al obtener la fecha de actualización: ", error);
    throw error; 
  }
};