import { pool } from "../db.js";
//import  moment  from "moment";
import { 
  registroAuditoria, 
  getUsuarioCreadorRegistro, 
  getFechaCreacionRegistro, 
  getUsuarioActualizoRegistro, 
  getFechaActualizacionRegistro 
} from "../controllers/auditoria.controller.js";

export const createEvento = async (req, res) => {
  try {
    //console.log(req.body)
    const { title, motivo, start, end, nota, color, id_clinica, id_usuario_creador, fecha_creacion} = req.body;

    console.log("fecha_creacion: "+fecha_creacion)

    const id_estatus_cita = color;
    const id_estatus_pago = 'EST_PG_SNP';
    const id_tipo_pago='TP_PG_NA'

    const [result] = await pool.query(`
      INSERT INTO citas (id, titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_estatus_cita, id_estatus_pago, id_tipo_pago, id_clinica) 
      VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?))
      `,[title, motivo || "", start, end, nota, id_estatus_cita, id_estatus_pago, id_tipo_pago, id_clinica]
    );

    if (result.affectedRows === 1) {
      console.log("Evento registrado")
    }

    const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM citas WHERE titulo = ? AND nota = ? AND fecha_hora_inicio = ? AND BIN_TO_UUID(id_clinica) = ?"
    , [title, nota, start, id_clinica]);

    if (!idResult.length) {
      return res.status(500).json({ message: "No se encontró el ID del evento insertado" });
    }

    const { id } = idResult[0];

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'citas-eventos', fecha_creacion)

    res.status(201).json({ id, title, motivo, start, end });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al registrar el evento" });
  }
};


export const createCita = async (req, res) => {
    try {
      console.log("crear cita::")
      //console.log(req.body)
      const { title, motivo, start, end, nota, color, id_paciente, id_usuario_medico, id_clinica, id_usuario_creador, fecha_creacion} = req.body;

      const id_estatus_cita = color;
      const id_estatus_pago = 'EST_PG_SNP';
      const id_tipo_pago='TP_PG_NA'

      const [result] = await pool.query(`
        INSERT INTO citas (id, titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_estatus_cita, id_estatus_pago, id_tipo_pago, id_paciente, id_usuario_medico, id_clinica) 
        VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?))
        `,[title, motivo, start, end, nota, id_estatus_cita, id_estatus_pago, id_tipo_pago, id_paciente, id_usuario_medico, id_clinica]
      );

      if (result.affectedRows === 1) {
        console.log("Cita registrada")
      }

      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM citas WHERE titulo = ? AND motivo = ? AND fecha_hora_inicio = ? AND BIN_TO_UUID(id_paciente) = ? AND BIN_TO_UUID(id_clinica) = ?"
      , [title, motivo, start, id_paciente, id_clinica]);

      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID de la cita insertada" });
      }
  
      const { id } = idResult[0];

      // ------------------------------------- REGISTRO
      registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'citas', fecha_creacion)

      res.status(201).json({ id, title, motivo, start, end });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar la cita" });
    }
  };


  export const getCitas = async (req, res) => {
    console.log("getCitas")
    try {
      const { id_clinica } = req.params;

      const [rowsCitas] = await pool.query(`
      SELECT 
        BIN_TO_UUID(c.id) AS id,  
        c.titulo,
        DATE_FORMAT(c.fecha_hora_inicio, '%Y-%m-%d %H:%i:%s') AS fecha_hora_inicio,
        DATE_FORMAT(c.fecha_hora_fin, '%Y-%m-%d %H:%i:%s') AS fecha_hora_fin,
        c.motivo,
        c.nota,
        c.id_estatus_cita,
        CONCAT(p.nombre, ' ', p.apellidop, ' ', p.apellidom) AS nombre_paciente,
        BIN_TO_UUID(p.id) AS id_paciente,
        p.nombre,
        p.apellidop,
        p.apellidom,
        p.edad,
        (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) 
          FROM usuarios 
          WHERE BIN_TO_UUID(id) = BIN_TO_UUID(c.id_usuario_medico)) AS nombre_usuario_medico

      FROM citas c
      LEFT JOIN pacientes p ON c.id_paciente = p.id
      WHERE BIN_TO_UUID(c.id_clinica) = ? 
      ORDER BY c.autoincremental DESC
      `, [id_clinica]);

      const events = rowsCitas.map(cita => ({
        title: cita.titulo,
        start: cita.fecha_hora_inicio, // Convierte la cadena a objeto Date
        end: cita.fecha_hora_fin, // Convierte la cadena a objeto Date
        //backgroundColor: '#00a65a', //Success (green)
        //borderColor    : '#00a65a', //Success (green)
        backgroundColor: cita.id_estatus_cita,
        borderColor    : cita.id_estatus_cita,
        //allDay: true,
        classNames: ['cursor-pointer'],
        //display: 'inverse-background',
        data: {
          id: cita.id,
          motivo: cita.motivo,
          notas: cita.nota,
          id_paciente: cita.id_paciente,
          nombre_paciente: cita.nombre_paciente,
          nombre_usuario_medico: cita.nombre_usuario_medico,
          nombre_usuario_creador: cita.nombre_usuario_creador,
          fecha_creacion: cita.fecha_creacion,
          nombre_usuario_actualizo: cita.nombre_usuario_actualizo,
          fecha_actualizacion: cita.fecha_actualizacion
        }
      }));

      res.json({ events });
  
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener las citas" });
    }
  };

  export const getCitaById = async (req, res) => {
    console.log("getCitaById")
    try {
      const { id } = req.params;

      const usuarioCreador = await getUsuarioCreadorRegistro(id);
      const fechaCreacion = await getFechaCreacionRegistro(id);
      const usuarioActualizo = await getUsuarioActualizoRegistro(id);
      const fechaActualizacion = await getFechaActualizacionRegistro(id);

      const [rowsCitas] = await pool.query(`
      SELECT 
        BIN_TO_UUID(c.id) AS id,  
        c.titulo AS title,
        DATE_FORMAT(c.fecha_hora_inicio, '%Y-%m-%d %H:%i:%s') AS start,
        DATE_FORMAT(c.fecha_hora_fin, '%Y-%m-%d %H:%i:%s') AS end,
        c.motivo,
        p.nombre,
        p.apellidop,
        p.apellidom,
        p.edad,
        p.telefono,
        BIN_TO_UUID(c.id_paciente) AS id_paciente,
        BIN_TO_UUID(c.id_usuario_medico) AS id_usuario_medico,
        (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) 
          FROM usuarios 
          WHERE BIN_TO_UUID(id) = BIN_TO_UUID(c.id_usuario_medico)) AS nombre_usuario_medico,

        ? AS nombre_usuario_creador,
        ? AS fecha_creacion,
        ? AS nombre_usuario_actualizo,    
        ? AS fecha_actualizacion

      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id
      WHERE BIN_TO_UUID(c.id) = ? 
      ORDER BY c.autoincremental DESC
      `, [usuarioCreador, fechaCreacion, usuarioActualizo, fechaActualizacion, id]);

      if (rowsCitas.length <= 0) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      //console.log(rowsCitas[0])
      res.json(rowsCitas[0]);
  
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener las cita por id" });
    }
  };

  export const updateCita = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { title, motivo, start, end, nota, id_paciente, id_usuario_medico, id_usuario_actualizo, id_clinica, fecha_actualizacion } = req.body;

      const [result] = await pool.query(
        `UPDATE citas 
          SET 
          titulo = IFNULL(?, titulo), 
          motivo = IFNULL(?, motivo), 
          fecha_hora_inicio = IFNULL(?, fecha_hora_inicio), 
          fecha_hora_fin = IFNULL(?, fecha_hora_fin), 
          nota = IFNULL(?, nota),
          id_paciente = IFNULL(UUID_TO_BIN(?), id_paciente),
          id_usuario_medico = IFNULL(UUID_TO_BIN(?), id_usuario_medico)

        WHERE 
          BIN_TO_UUID(id) = ?`,
        [title, motivo, start, end, nota, id_paciente, id_usuario_medico, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Cita no encontrada" });
      
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id, titulo AS title FROM citas WHERE BIN_TO_UUID(id) = ?",[id]);

      // ------------------------------------- REGISTRO
      registroAuditoria(id, id_usuario_actualizo, id_clinica, 'UPDATE', 'citas', fecha_actualizacion)

      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la cita" });
    }
  };


  export const deleteCita = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { id_usuario_elimino, id_clinica, fecha_eliminacion } = req.query;

      const [rows] = await pool.query("DELETE FROM citas WHERE id = uuid_to_bin(?)", [id]);
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
  
      // ------------------------------------- REGISTRO
      registroAuditoria(id, id_usuario_elimino, id_clinica, 'DELETE', 'citas', fecha_eliminacion)

      res.json({id});
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar la cita" });
    }
  };

  export const getCitasByIdPaciente = async (req, res) => {
    try {
      console.log("getCitasByIdPaciente")
      const { id_paciente } = req.params;

      const [rowsCitas] = await pool.query(`
      SELECT 
        BIN_TO_UUID(c.id) AS id,  
        c.titulo,
        DATE_FORMAT(c.fecha_hora_inicio, '%d/%m/%Y %H:%i:%s') AS fecha_hora_inicio,
        c.motivo,
        CONCAT(p.nombre, ' ', p.apellidop, ' ', p.apellidom) AS nombre_paciente,
        BIN_TO_UUID(p.id) AS id_paciente,
        p.nombre,
        p.apellidop,
        p.apellidom,
        (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) 
          FROM usuarios 
          WHERE BIN_TO_UUID(id) = BIN_TO_UUID(c.id_usuario_medico)) AS nombre_usuario_medico
      FROM citas c
      LEFT JOIN pacientes p ON c.id_paciente = p.id
      WHERE BIN_TO_UUID(c.id_paciente) = ? 
      ORDER BY c.autoincremental DESC
      `, [id_paciente]);

      //console.log(rowsCitas)
      res.json(rowsCitas);
  
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener las citas" });
    }
  };