import { pool } from "../db.js";

export const createDiagnostico = async (req, res) => {
    try {
        console.log("diagnostico::")
        console.log(req.body)
        const { descripcion_problema, codigo_diagnostico, evidencias, id_paciente, id_clinica, id_usuario_creador, fecha_creacion} = req.body;
    
        // insertar el nuevo registro
        const [result] = await pool.execute(`
          INSERT INTO diagnosticos (id, descripcion_problema, codigo_diagnostico, evidencias, id_paciente, id_clinica, id_usuario_creador, fecha_creacion) 
          VALUES (UUID_TO_BIN(UUID()),?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
          [descripcion_problema, codigo_diagnostico, evidencias, id_paciente, id_clinica, id_usuario_creador, fecha_creacion]
        );
    
        if (result.affectedRows === 1) {
          console.log("Diagnostico registrado")
        }
    
        const [idResult] = await pool.execute(`
          SELECT BIN_TO_UUID(id) as id FROM diagnosticos 
          WHERE codigo_diagnostico = ? 
            AND BIN_TO_UUID(id_paciente) = ?
            AND BIN_TO_UUID(id_clinica) = ?
            AND BIN_TO_UUID(id_usuario_creador) = ?
            AND fecha_creacion = ?`, 
          [codigo_diagnostico, id_paciente, id_clinica, id_usuario_creador, fecha_creacion]);

        if (!idResult.length) {
          return res.status(500).json({ message: "No se encontró el ID del diagnóstico insertado" });
        }

        const { id } = idResult[0];
    
        res.status(201).json({ id, descripcion_problema, codigo_diagnostico, evidencias, id_paciente, id_clinica, id_usuario_creador, fecha_creacion });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar el diagnóstico" });
    }
};


export const getDiagnosticosByIpPaciente = async (req, res) => {
  const { id } = req.params;
  console.log("id Paciente:: "+id)
  try {
    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY d.autoincremental DESC) AS contador,
      BIN_TO_UUID(d.id) AS id, 
      d.descripcion_problema, 
      d.codigo_diagnostico, 
      d.evidencias, 
      BIN_TO_UUID(d.id_paciente) AS id_paciente, 
      BIN_TO_UUID(d.id_clinica) AS id_clinica, 
      BIN_TO_UUID(d.id_usuario_creador) AS id_usuario_creador, 
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(d.id_usuario_creador)) AS nombre_usuario_creador,
      DATE_FORMAT(d.fecha_creacion, '%d/%m/%Y %H:%i:%s') AS fecha_creacion,
      BIN_TO_UUID(d.id_usuario_actualizo) AS id_usuario_actualizo, 
      fecha_actualizacion
    FROM diagnosticos d
    WHERE BIN_TO_UUID(d.id_paciente) = ?
    ORDER BY d.autoincremental DESC
    `, [id]);

    console.log(rows)
    res.json(rows);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los diagnosticos del paciente" });
  }
};


export const getDiagnostico = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(d.id) AS id, 
        d.descripcion_problema, 
        d.codigo_diagnostico, 
        d.evidencias, 
        BIN_TO_UUID(d.id_paciente) AS id_paciente, 
        BIN_TO_UUID(d.id_clinica) AS id_clinica, 
        BIN_TO_UUID(d.id_usuario_creador) AS id_usuario_creador, 
        fecha_creacion,
        BIN_TO_UUID(d.id_usuario_actualizo) AS id_usuario_actualizo, 
        fecha_actualizacion 
      FROM diagnosticos d
      WHERE BIN_TO_UUID(d.id) = ?`
      ,[id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Diagnostico no encontrado" });
    }
    //console.log(rows[0])
    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener el diagnostico" });
  }
};


export const updateDiagnostico = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
    const { descripcion_problema, codigo_diagnostico, evidencias, id_usuario_actualizo, fecha_actualizacion } = req.body;

    const [result] = await pool.query(
      `UPDATE diagnosticos 
        SET 
        descripcion_problema = IFNULL(?, descripcion_problema), 
        codigo_diagnostico = IFNULL(?, codigo_diagnostico), 
        evidencias = IFNULL(?, evidencias), 
        id_usuario_actualizo = IFNULL(?, id_usuario_actualizo), 
        fecha_actualizacion = IFNULL(?, fecha_actualizacion) 
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [descripcion_problema, codigo_diagnostico, evidencias, id_usuario_actualizo, fecha_actualizacion, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Diagnostico no encontrado" });
    
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM diagnosticos WHERE BIN_TO_UUID(id) = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la información del diagnostico" });
  }
};


export const deleteDiagnostico = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
    const [rows] = await pool.query("DELETE FROM diagnosticos WHERE id = uuid_to_bin(?)", [id]);
    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Diagnostico no encontrado" });
    }

    res.json({id});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al eliminar el diagnostico" });
  }
};