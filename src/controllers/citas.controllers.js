import { pool } from "../db.js";
import  moment  from "moment";

export const createCita = async (req, res) => {
    try {
      //console.log(req.body)
      const { titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_medico, id_paciente, id_clinica, id_usuario, fecha_creacion} = req.body;

      console.log("fecha_creacion: "+fecha_hora_inicio)

      const id_estatus_cita = 'EST_CT_OPN';
      const id_estatus_pago = 'EST_PG_SNP';
      const id_tipo_pago='TP_PG_NA'

      const [result] = await pool.query(`
        INSERT INTO citas (id, titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_estatus_cita, id_estatus_pago, id_tipo_pago, id_paciente, id_clinica, id_usuario, fecha_creacion) 
        VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?)
        `,[titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_estatus_cita, id_estatus_pago,id_tipo_pago, id_paciente, id_clinica, id_usuario, fecha_creacion]
      );

      if (result.affectedRows === 1) {
        console.log("Cita registrada")
      }

      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM citas WHERE titulo = ? AND fecha_hora_inicio = ? AND BIN_TO_UUID(id_clinica) = ? AND BIN_TO_UUID(id_usuario) = ? AND fecha_creacion = ?"
      , [titulo, fecha_hora_inicio, id_clinica, id_usuario, fecha_creacion]);

      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID de la cita insertada" });
      }
  
      const { id } = idResult[0];
      res.status(201).json({ id, titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_estatus_cita, id_estatus_pago, id_tipo_pago, id_medico, id_paciente, id_clinica, id_usuario, fecha_creacion });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar la cita" });
    }
  };

  export const getCitas = async (req, res) => {
    try {

      const [rowsCitas] = await pool.query(`
      SELECT 
        BIN_TO_UUID(c.id) AS id,  
        c.titulo,
        DATE_FORMAT(c.fecha_hora_inicio, '%Y-%m-%d %H:%i:%s') AS fecha_hora_inicio,
        c.motivo,
        p.nombre,
        p.apellidop,
        p.apellidom,
        p.edad
      FROM citas c
      INNER JOIN pacientes p ON c.id_paciente = p.id
      ORDER BY c.autoincremental DESC
      `);

      const events = rowsCitas.map(cita => ({
        title: cita.titulo,
        start: moment(cita.fecha_hora_inicio).toDate(), // Convierte la cadena a objeto Date
        backgroundColor: '#00a65a', //Success (green)
        borderColor    : '#00a65a', //Success (green)
        data: {
          id: cita.id,
          motivo: cita.motivo,
        }
      }));

      res.json({ events });
  
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener las citas" });
    }
  };