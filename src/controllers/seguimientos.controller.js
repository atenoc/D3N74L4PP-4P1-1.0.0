import { pool } from "../db.js";
import { 
  registroAuditoria, 
  getUsuarioCreadorRegistro, 
  getFechaCreacionRegistro, 
  getUsuarioActualizoRegistro, 
  getFechaActualizacionRegistro 
} from "../controllers/auditoria.controller.js";

export const createSeguimiento = async (req, res) => {
    try {
        console.log("seguimiento::")
        console.log(req.body)
        const { proxima_cita, notas_seguimiento, id_paciente, id_clinica, id_usuario_creador, fecha_creacion} = req.body;
    
        const [result] = await pool.execute(`
          INSERT INTO seguimientos (id, proxima_cita, notas_seguimiento, id_paciente, id_clinica) 
          VALUES (UUID_TO_BIN(UUID()),?,?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
          [proxima_cita, notas_seguimiento, id_paciente, id_clinica]
        );
    
        if (result.affectedRows === 1) {
          console.log("Seguimiento registrado")
        }
    
        const [idResult] = await pool.execute(`
          SELECT BIN_TO_UUID(id) as id FROM seguimientos 
          WHERE BIN_TO_UUID(id_paciente) = ?
            AND BIN_TO_UUID(id_clinica) = ?`, 
          [id_paciente, id_clinica]);

        if (!idResult.length) {
          return res.status(500).json({ message: "No se encontró el ID del seguimiento insertado" });
        }

        const { id } = idResult[0];
    
        // ------------------------------------- REGISTRO
        registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'seguimientos', fecha_creacion)

        res.status(201).json({ id, id_paciente, id_clinica, id_usuario_creador, fecha_creacion });
      
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
      DATE_FORMAT(s.proxima_cita, '%Y/%m/%d %H:%i:%s') AS proxima_cita, 
      s.notas_seguimiento, 
      BIN_TO_UUID(s.id_paciente) AS id_paciente, 
      BIN_TO_UUID(s.id_clinica) AS id_clinica,
      (SELECT DATE_FORMAT(fecha_evento, '%d/%m/%Y %H:%i:%s') FROM auditoria 
        WHERE BIN_TO_UUID(id_registro) = BIN_TO_UUID(s.id)
        AND tipo_evento='CREATE') AS fecha_creacion,
      (SELECT DATE_FORMAT(fecha_evento, '%d/%m/%Y %H:%i:%s') FROM auditoria 
        WHERE BIN_TO_UUID(id_registro) = BIN_TO_UUID(s.id)
        AND tipo_evento='UPDATE' ORDER BY id DESC LIMIT 1) AS fecha_actualizacion

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

    const usuarioCreador = await getUsuarioCreadorRegistro(id);
    const fechaCreacion = await getFechaCreacionRegistro(id);
    const usuarioActualizo = await getUsuarioActualizoRegistro(id);
    const fechaActualizacion = await getFechaActualizacionRegistro(id);

    const [rows] = await pool.query(`
    SELECT 
      BIN_TO_UUID(s.id) AS id, 
      DATE_FORMAT(s.proxima_cita, '%Y/%m/%d %H:%i:%s') AS proxima_cita, 
      s.notas_seguimiento, 
      BIN_TO_UUID(s.id_paciente) AS id_paciente, 
      BIN_TO_UUID(s.id_clinica) AS id_clinica,

      ? AS nombre_usuario_creador,
      ? AS fecha_creacion,
      ? AS nombre_usuario_actualizo,    
      ? AS fecha_actualizacion

    FROM seguimientos s
    WHERE BIN_TO_UUID(s.id) = ?`
    ,[usuarioCreador, fechaCreacion, usuarioActualizo, fechaActualizacion, id]);

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
    const { proxima_cita, notas_seguimiento, id_usuario_actualizo, id_clinica, fecha_actualizacion } = req.body;

    const [result] = await pool.query(
      `UPDATE seguimientos 
        SET 
        proxima_cita = IFNULL(?, proxima_cita), 
        notas_seguimiento = IFNULL(?, notas_seguimiento)
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [proxima_cita, notas_seguimiento, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Seguimiento no encontrado" });
    
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM seguimientos WHERE BIN_TO_UUID(id) = ?", [id]);

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_actualizo, id_clinica, 'UPDATE', 'seguimientos', fecha_actualizacion)

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la información del seguimiento" });
  }
};


export const deleteSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_usuario_elimino, id_clinica, fecha_eliminacion } = req.query;

    const [rows] = await pool.query("DELETE FROM seguimientos WHERE id = uuid_to_bin(?)", [id]);
    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Seguimiento no encontrado" });
    }

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_elimino, id_clinica, 'DELETE', 'seguimientos', fecha_eliminacion)

    res.json({id});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al eliminar el seguimiento" });
  }
};