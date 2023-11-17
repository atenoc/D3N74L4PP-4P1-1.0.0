import { pool } from "../db.js";

export const createCita = async (req, res) => {
    try {
      //console.log(req.body)
      const { titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_medico, id_paciente, id_clinica, id_usuario, fecha_creacion} = req.body;

      console.log("fecha_creacion: "+fecha_hora_inicio)

      const id_estatus_cita = 'EST_CT_OPN';
      const id_estatus_pago = 'EST_PG_SNP';
      const id_tipo_pago='TP_PG_NA'

      const [result] = await pool.query(`
        INSERT INTO citas (id, titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_estatus_cita, id_estatus_pago, id_tipo_pago, id_clinica, id_usuario, fecha_creacion) 
        VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?), UUID_TO_BIN(?), ?)
        `,[titulo, motivo, fecha_hora_inicio, fecha_hora_fin, nota, id_estatus_cita, id_estatus_pago,id_tipo_pago, id_clinica, id_usuario, fecha_creacion]
      );

      if (result.affectedRows === 1) {
        console.log("Cita registrada")
      }

      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM citas WHERE titulo = ? AND fecha_hora_inicio = ? AND BIN_TO_UUID(id_clinica) = ? AND BIN_TO_UUID(id_usuario) = ?"
      , [titulo, fecha_hora_inicio, id_clinica, id_usuario]);

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