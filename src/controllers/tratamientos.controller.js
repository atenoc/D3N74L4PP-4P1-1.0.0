import { pool } from "../db.js";

export const createTratamiento = async (req, res) => {
    try {
        console.log("Tratamiento::")
        console.log(req.body)
        const { tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_paciente, id_clinica, id_usuario_creador, fecha_creacion} = req.body;
    
        const [result] = await pool.execute(`
          INSERT INTO tratamientos (id, tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_paciente, id_clinica, id_usuario_creador, fecha_creacion) 
          VALUES (UUID_TO_BIN(UUID()),?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
          [tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_paciente, id_clinica, id_usuario_creador, fecha_creacion]
        );
    
        if (result.affectedRows === 1) {
          console.log("Tratamiento registrado")
        }
    
        const [idResult] = await pool.execute(`
          SELECT BIN_TO_UUID(id) as id FROM tratamientos 
          WHERE BIN_TO_UUID(id_paciente) = ?
            AND BIN_TO_UUID(id_clinica) = ?
            AND BIN_TO_UUID(id_usuario_creador) = ?
            AND fecha_creacion = ?`, 
          [id_paciente, id_clinica, id_usuario_creador, fecha_creacion]);

        if (!idResult.length) {
          return res.status(500).json({ message: "No se encontró el ID del tratamiento insertado" });
        }

        const { id } = idResult[0];
    
        res.status(201).json({ id, tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_paciente, id_clinica, id_usuario_creador, fecha_creacion });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar el tratamiento" });
    }
};


export const getTratamientosByIpPaciente = async (req, res) => {
  const { id } = req.params;
  console.log("id Paciente:: "+id)
  try {
    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY t.autoincremental DESC) AS contador,
      BIN_TO_UUID(t.id) AS id, 
      t.tratamiento_propuesto, 
      t.medicamentos_prescritos, 
      t.costo_estimado, 
      BIN_TO_UUID(t.id_paciente) AS id_paciente, 
      BIN_TO_UUID(t.id_clinica) AS id_clinica, 
      BIN_TO_UUID(t.id_usuario_creador) AS id_usuario_creador, 
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(t.id_usuario_creador)) AS nombre_usuario_creador,
      DATE_FORMAT(t.fecha_creacion, '%d/%m/%Y %H:%i:%s') AS fecha_creacion,
      BIN_TO_UUID(t.id_usuario_actualizo) AS id_usuario_actualizo, 
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(t.id_usuario_actualizo)) AS nombre_usuario_actualizo,
      DATE_FORMAT(t.fecha_actualizacion, '%d/%m/%Y %H:%i:%s') AS fecha_actualizacion
    FROM tratamientos t
    WHERE BIN_TO_UUID(t.id_paciente) = ?
    ORDER BY t.autoincremental DESC
    `, [id]);

    console.log(rows)
    res.json(rows);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los tratamientos del paciente" });
  }
};


export const getTratamiento = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(t.id) AS id, 
        t.tratamiento_propuesto, 
        t.medicamentos_prescritos, 
        t.costo_estimado, 
        BIN_TO_UUID(t.id_paciente) AS id_paciente, 
        BIN_TO_UUID(t.id_clinica) AS id_clinica, 
        BIN_TO_UUID(t.id_usuario_creador) AS id_usuario_creador, 
        (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(t.id_usuario_creador)) AS nombre_usuario_creador, 
        DATE_FORMAT(t.fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion,
        BIN_TO_UUID(t.id_usuario_actualizo) AS id_usuario_actualizo, 
        (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(t.id_usuario_actualizo)) AS nombre_usuario_actualizo,
        DATE_FORMAT(t.fecha_actualizacion, '%d/%m/%Y %H:%i:%s') as fecha_actualizacion
      FROM tratamientos t
      WHERE BIN_TO_UUID(t.id) = ?`
      ,[id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Tratamiento no encontrado" });
    }
    console.log(rows[0])
    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener el tratamiento" });
  }
};


export const updateTratamiento = async (req, res) => {
  try {
    console.log(req.body)
    const { id } = req.params;
    const { tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_usuario_actualizo, fecha_actualizacion } = req.body;

    const [result] = await pool.query(
      `UPDATE tratamientos 
        SET 
        tratamiento_propuesto = IFNULL(?, tratamiento_propuesto), 
        medicamentos_prescritos = IFNULL(?, medicamentos_prescritos), 
        costo_estimado = IFNULL(?, costo_estimado), 
        id_usuario_actualizo = IFNULL(UUID_TO_BIN(?), id_usuario_actualizo), 
        fecha_actualizacion = IFNULL(?, fecha_actualizacion) 
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_usuario_actualizo, fecha_actualizacion, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Tratamiento no encontrado" });
    
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM tratamientos WHERE BIN_TO_UUID(id) = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la información del tratamiento" });
  }
};


export const deleteTratamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("DELETE FROM tratamientos WHERE id = uuid_to_bin(?)", [id]);
    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Tratamientos no encontrado" });
    }

    res.json({id});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al eliminar el tratamiento" });
  }
};