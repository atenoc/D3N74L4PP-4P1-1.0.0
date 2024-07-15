import { pool } from "../db.js";

export const createSeguimiento = async (req, res) => {
    try {
        console.log("seguimiento::")
        console.log(req.body)
        const { proxima_cita, notas_seguimiento, id_paciente, id_clinica, id_usuario_creador, fecha_creacion} = req.body;
    
        const [result] = await pool.execute(`
          INSERT INTO seguimientos (id, proxima_cita, notas_seguimiento, id_paciente, id_clinica, id_usuario_creador, fecha_creacion) 
          VALUES (UUID_TO_BIN(UUID()),?,?, UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
          [proxima_cita, notas_seguimiento, id_paciente, id_clinica, id_usuario_creador, fecha_creacion]
        );
    
        if (result.affectedRows === 1) {
          console.log("Seguimiento registrado")
        }
    
        const [idResult] = await pool.execute(`
          SELECT BIN_TO_UUID(id) as id FROM seguimientos 
          WHERE BIN_TO_UUID(id_paciente) = ?
            AND BIN_TO_UUID(id_clinica) = ?
            AND BIN_TO_UUID(id_usuario_creador) = ?
            AND fecha_creacion = ?`, 
          [id_paciente, id_clinica, id_usuario_creador, fecha_creacion]);

        if (!idResult.length) {
          return res.status(500).json({ message: "No se encontró el ID del seguimiento insertado" });
        }

        const { id } = idResult[0];
    
        res.status(201).json({ id, proxima_cita, notas_seguimiento, id_paciente, id_clinica, id_usuario_creador, fecha_creacion });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar el seguimiento" });
    }
};


export const getSeguimientosByIdPaciente = async (req, res) => {
  const { id } = req.params;
  console.log("id Paciente:: "+id)
  try {
    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY s.autoincremental DESC) AS contador,
      BIN_TO_UUID(s.id) AS id, 
      s.proxima_cita, 
      s.notas_seguimiento, 
      BIN_TO_UUID(s.id_paciente) AS id_paciente, 
      BIN_TO_UUID(s.id_clinica) AS id_clinica, 
      BIN_TO_UUID(s.id_usuario_creador) AS id_usuario_creador, 
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(s.id_usuario_creador)) AS nombre_usuario_creador,
      DATE_FORMAT(s.fecha_creacion, '%d/%m/%Y %H:%i:%s') AS fecha_creacion,
      BIN_TO_UUID(s.id_usuario_actualizo) AS id_usuario_actualizo, 
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(s.id_usuario_actualizo)) AS nombre_usuario_actualizo,
      DATE_FORMAT(s.fecha_actualizacion, '%d/%m/%Y %H:%i:%s') AS fecha_actualizacion
    FROM seguimientos s
    WHERE BIN_TO_UUID(s.id_paciente) = ?
    ORDER BY s.autoincremental DESC
    `, [id]);

    console.log(rows)
    res.json(rows);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los seguimientos del paciente" });
  }
};


export const getSeguimiento = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(s.id) AS id, 
        s.proxima_cita, 
        s.notas_seguimiento, 
        BIN_TO_UUID(s.id_paciente) AS id_paciente, 
        BIN_TO_UUID(s.id_clinica) AS id_clinica, 
        BIN_TO_UUID(s.id_usuario_creador) AS id_usuario_creador, 
        (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(s.id_usuario_creador)) AS nombre_usuario_creador, 
        DATE_FORMAT(s.fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion,
        BIN_TO_UUID(s.id_usuario_actualizo) AS id_usuario_actualizo, 
        (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(s.id_usuario_actualizo)) AS nombre_usuario_actualizo,
        DATE_FORMAT(s.fecha_actualizacion, '%d/%m/%Y %H:%i:%s') as fecha_actualizacion
      FROM seguimientos s
      WHERE BIN_TO_UUID(s.id) = ?`
      ,[id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Seguimiento no encontrado" });
    }
    console.log(rows[0])
    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener el seguimiento" });
  }
};


export const updateSeguimiento = async (req, res) => {
  try {
    console.log(req.body)
    const { id } = req.params;
    const { proxima_cita, notas_seguimiento, id_usuario_actualizo, fecha_actualizacion } = req.body;

    const [result] = await pool.query(
      `UPDATE seguimientos 
        SET 
        proxima_cita = IFNULL(?, proxima_cita), 
        notas_seguimiento = IFNULL(?, notas_seguimiento), 
        id_usuario_actualizo = IFNULL(UUID_TO_BIN(?), id_usuario_actualizo), 
        fecha_actualizacion = IFNULL(?, fecha_actualizacion) 
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [proxima_cita, notas_seguimiento, id_usuario_actualizo, fecha_actualizacion, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Seguimiento no encontrado" });
    
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM seguimientos WHERE BIN_TO_UUID(id) = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la información del seguimiento" });
  }
};


export const deleteSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("DELETE FROM seguimientos WHERE id = uuid_to_bin(?)", [id]);
    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Seguimiento no encontrado" });
    }

    res.json({id});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al eliminar el seguimiento" });
  }
};