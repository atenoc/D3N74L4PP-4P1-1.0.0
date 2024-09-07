import { pool } from "../db.js";

export const registroAcceso = async (id_usuario, ip_origen, estado, fecha) => {
    const [result] = await pool.execute(`
      INSERT INTO accesos (id_usuario, ip_origen, estado, fecha_evento)  VALUES (UUID_TO_BIN(?),?,?,?)`,
      [id_usuario, ip_origen, estado, fecha]
    );
  
    if (result.affectedRows === 1) {
      console.log("Acceso Registrado")
    }
};

export const registroAuditoria = async (id_registro, id_usuario, id_clinica, tipo_evento, tabla_afectada, fecha_evento) => {
  console.log("Auditoria")
  const [result] = await pool.execute(`
    INSERT INTO auditoria (id_registro, id_usuario, id_clinica, tipo_evento, tabla_afectada, fecha_evento) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?,?,?)`,
    [id_registro, id_usuario, id_clinica, tipo_evento, tabla_afectada, fecha_evento]
  );

  if (result.affectedRows === 1) {
    console.log("Actividad Registrada")
  }
};

export const usuarioCreadorRegistro = async (id_registro) => {
  try {
    const [rows] = await pool.query(`
      SELECT BIN_TO_UUID(id_usuario) AS id_usuario_creador FROM auditoria WHERE tipo_evento = 'CREATE' AND BIN_TO_UUID(id_registro) = ?`,
      [id_registro]
    );

    if (rows.length === 0) {
      console.log("No se encontró ninguna id para el registro: "+id_registro);
      return null; 
    }

    const id_usuario_creador=rows[0].id_usuario_creador
    const [rowsNomUs] = await pool.query(`
      SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) AS nombre_usuario_creador FROM usuarios WHERE BIN_TO_UUID(id)= ?`,
      [id_usuario_creador]
    );

    return rowsNomUs[0].nombre_usuario_creador; 

  } catch (error) {
    console.error("Error en la consulta de fecha de creación:", error);
    throw error; 
  }
};


export const fechaCreacionRegistro = async (id_registro) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(fecha_evento,'%d/%m/%Y %H:%i:%s') AS fecha_evento FROM auditoria WHERE tipo_evento = 'CREATE' AND BIN_TO_UUID(id_registro) = ?`,
      [id_registro]
    );

    if (rows.length === 0) {
      console.log("No se encontró ninguna fecha_evento para el registro: "+id_registro);
      return null; 
    }

    return rows[0].fecha_evento; 

  } catch (error) {
    console.error("Error en la consulta de fecha de creación:", error);
    throw error; 
  }
};

export const usuarioActualizoRegistro = async (id_registro) => {
  try {
    const [rows] = await pool.query(`
      SELECT BIN_TO_UUID(id_usuario) AS id_usuario_actualizo FROM auditoria WHERE tipo_evento = 'UPDATE' AND BIN_TO_UUID(id_registro) = ? ORDER BY id DESC LIMIT 1`,
      [id_registro]
    );

    if (rows.length === 0) {
      console.log("No se encontró ninguna id_usuario para el registro: "+id_registro);
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
    console.error("Error en la consulta de fecha de creación:", error);
    throw error; 
  }
};


export const fechaActualizacionRegistro = async (id_registro) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(fecha_evento,'%d/%m/%Y %H:%i:%s') AS fecha_evento FROM auditoria WHERE tipo_evento = 'UPDATE' AND BIN_TO_UUID(id_registro) = ? ORDER BY id DESC LIMIT 1`,
      [id_registro]
    );

    if (rows.length === 0) {
      console.log("No se encontró ninguna fecha_evento para el registro: "+id_registro);
      return null; 
    }

    return rows[0].fecha_evento; 

  } catch (error) {
    console.error("Error en la consulta de fecha de creación:", error);
    throw error; 
  }
};