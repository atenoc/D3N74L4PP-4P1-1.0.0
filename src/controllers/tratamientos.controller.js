import { pool } from "../db.js";
import { 
  registroAuditoria, 
  getUsuarioCreadorRegistro, 
  getFechaCreacionRegistro, 
  getUsuarioActualizoRegistro, 
  getFechaActualizacionRegistro 
} from "../controllers/auditoria.controller.js";

export const createTratamiento = async (req, res) => {
    try {
        console.log("Tratamiento::")
        console.log(req.body)
        const { tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_paciente, id_clinica, id_usuario_creador, fecha_creacion} = req.body;
    
        const [result] = await pool.execute(`
          INSERT INTO tratamientos (id, tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_paciente, id_clinica) 
          VALUES (UUID_TO_BIN(UUID()),?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
          [tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_paciente, id_clinica]
        );
    
        if (result.affectedRows === 1) {
          console.log("Tratamiento registrado")
        }
    
        const [idResult] = await pool.execute(`
          SELECT BIN_TO_UUID(id) as id FROM tratamientos 
          WHERE BIN_TO_UUID(id_paciente) = ?
            AND BIN_TO_UUID(id_clinica) = ?`, 
          [id_paciente, id_clinica]);

        if (!idResult.length) {
          return res.status(500).json({ message: "No se encontró el ID del tratamiento insertado" });
        }

        const { id } = idResult[0];
    
        // ------------------------------------- REGISTRO
        registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'tratamientos', fecha_creacion)

        res.status(201).json({ id, id_paciente, id_clinica, id_usuario_creador, fecha_creacion });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar el tratamiento" });
    }
};


export const getTratamientosByIdPaciente = async (req, res) => {
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
      (SELECT DATE_FORMAT(fecha_evento, '%d/%m/%Y %H:%i:%s') FROM auditoria 
        WHERE BIN_TO_UUID(id_registro) = BIN_TO_UUID(t.id)
        AND tipo_evento='CREATE') AS fecha_creacion,
      (SELECT DATE_FORMAT(fecha_evento, '%d/%m/%Y %H:%i:%s') FROM auditoria 
        WHERE BIN_TO_UUID(id_registro) = BIN_TO_UUID(t.id)
        AND tipo_evento='UPDATE' ORDER BY id DESC LIMIT 1) AS fecha_actualizacion

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

    const usuarioCreador = await getUsuarioCreadorRegistro(id);
    const fechaCreacion = await getFechaCreacionRegistro(id);
    const usuarioActualizo = await getUsuarioActualizoRegistro(id);
    const fechaActualizacion = await getFechaActualizacionRegistro(id);

    const [rows] = await pool.query(`
    SELECT 
      BIN_TO_UUID(t.id) AS id, 
      t.tratamiento_propuesto, 
      t.medicamentos_prescritos, 
      t.costo_estimado, 
      BIN_TO_UUID(t.id_paciente) AS id_paciente, 
      BIN_TO_UUID(t.id_clinica) AS id_clinica,
      
      ? AS nombre_usuario_creador,
      ? AS fecha_creacion,
      ? AS nombre_usuario_actualizo,    
      ? AS fecha_actualizacion
      
    FROM tratamientos t
    WHERE BIN_TO_UUID(t.id) = ?`
    ,[usuarioCreador, fechaCreacion, usuarioActualizo, fechaActualizacion, id]);

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
    const { tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id_usuario_actualizo, id_clinica, fecha_actualizacion } = req.body;

    const [result] = await pool.query(
      `UPDATE tratamientos 
        SET 
        tratamiento_propuesto = IFNULL(?, tratamiento_propuesto), 
        medicamentos_prescritos = IFNULL(?, medicamentos_prescritos), 
        costo_estimado = IFNULL(?, costo_estimado)
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [tratamiento_propuesto, medicamentos_prescritos, costo_estimado, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Tratamiento no encontrado" });
    
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM tratamientos WHERE BIN_TO_UUID(id) = ?", [id]);

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_actualizo, id_clinica, 'UPDATE', 'tratamientos', fecha_actualizacion)

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la información del tratamiento" });
  }
};


export const deleteTratamiento = async (req, res) => {
  try {

    const { id } = req.params;
    const { id_usuario_elimino, id_clinica, fecha_eliminacion } = req.query;

    const [rows] = await pool.query("DELETE FROM tratamientos WHERE id = uuid_to_bin(?)", [id]);
    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Tratamientos no encontrado" });
    }

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_elimino, id_clinica, 'DELETE', 'tratamientos', fecha_eliminacion)

    res.json({id});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al eliminar el tratamiento" });
  }
};