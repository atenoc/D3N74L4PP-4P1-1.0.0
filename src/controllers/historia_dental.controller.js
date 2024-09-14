import { pool } from "../db.js";
import { 
    registroAuditoria, 
    getUsuarioCreadorRegistro, 
    getFechaCreacionRegistro, 
    getUsuarioActualizoRegistro, 
    getFechaActualizacionRegistro 
} from "../controllers/auditoria.controller.js";

export const createHistoriaDental = async (req, res) => {
    try {
      console.log("POST_Historia")
      console.log(req.body)
      const { 
        ultima_visita_dentista, 
        problemas_dentales_pasados, 
        tratamientos_previos_cuando,
        dolor_sensibilidad,
        condicion_medica_actual, 
        medicamentos_actuales, 
        alergias_conocidas, 
        cirugias_enfermedades_graves, 
        frecuencia_cepillado, 
        uso_hilo_dental, 
        uso_productos_especializados,
        tabaco_frecuencia,
        habito_alimenticio,
        id_paciente,
        id_clinica, 
        id_usuario_creador,
        fecha_creacion,

      } = req.body;
  
      // insertar el nuevo registro
      const [result] = await pool.execute(`
        INSERT INTO historias (id, 
            ultima_visita_dentista, 
            problemas_dentales_pasados, 
            tratamientos_previos_cuando, 
            dolor_sensibilidad, 
            condicion_medica_actual, 
            medicamentos_actuales, 
            alergias_conocidas, 
            cirugias_enfermedades_graves, 
            frecuencia_cepillado, 
            uso_hilo_dental, 
            uso_productos_especializados, 
            tabaco_frecuencia, 
            habito_alimenticio, 
            id_paciente, 
            id_clinica) 
        VALUES (UUID_TO_BIN(UUID()),?,?,?,?,?,?,?,?,?,?,?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
        [
            ultima_visita_dentista, 
            problemas_dentales_pasados, 
            tratamientos_previos_cuando, 
            dolor_sensibilidad, 
            condicion_medica_actual, 
            medicamentos_actuales, 
            alergias_conocidas, 
            cirugias_enfermedades_graves, 
            frecuencia_cepillado, 
            uso_hilo_dental,
            uso_productos_especializados, 
            tabaco_frecuencia, 
            habito_alimenticio, 
            id_paciente, 
            id_clinica
        ]
      );
  
      if (result.affectedRows === 1) {
        console.log("Historia registrada")
      }
  
      const [idResult] = await pool.execute(`
        SELECT 
          BIN_TO_UUID(id) as id 
        FROM historias 
        WHERE BIN_TO_UUID(id_paciente) = ? AND BIN_TO_UUID(id_clinica) = ?`,
       [id_paciente, id_clinica]);
      
       if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID de la historia insertada" });
      }

      const { id } = idResult[0];
  
      // ------------------------------------- REGISTRO
      registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'historias', fecha_creacion)

      res.status(201).json({ id, id_paciente, id_usuario_creador, fecha_creacion });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar la historia dental" });
    }
};

export const getHistoriaDentalByIdPaciente = async (req, res) => {
    try {
        
        //console.log(req.params)
        const { id } = req.params;
        console.log("GET_historia, id_Paciente: " +id)

        // Obtener id Historia por Paciente id
        const [row] = await pool.query(`
          SELECT BIN_TO_UUID(id) id FROM historias WHERE BIN_TO_UUID(id_paciente) = ?`,[id]);

        if (row.length <= 0) {
          console.log("Historia no encontrada por id Paciente")
          return res.status(404).json({ message: "Historia no encontrada por id Paciente" });
        }

        const id_historia= row[0].id
        //console.log("HISTORIA RECUPERADA: "+id_historia)

        const usuarioCreador = await getUsuarioCreadorRegistro(id_historia);
        const fechaCreacion = await getFechaCreacionRegistro(id_historia);
        const usuarioActualizo = await getUsuarioActualizoRegistro(id_historia);
        const fechaActualizacion = await getFechaActualizacionRegistro(id_historia);

        const [rows] = await pool.query(`
        SELECT 
          BIN_TO_UUID(hd.id) id, 
          hd.ultima_visita_dentista, 
          hd.problemas_dentales_pasados, 
          hd.tratamientos_previos_cuando,
          hd.dolor_sensibilidad,
          hd.condicion_medica_actual, 
          hd.medicamentos_actuales, 
          hd.alergias_conocidas,
          hd.cirugias_enfermedades_graves,
          hd.frecuencia_cepillado,
          hd.uso_hilo_dental,
          hd.uso_productos_especializados,
          hd.tabaco_frecuencia,
          hd.habito_alimenticio,
          BIN_TO_UUID(hd.id_paciente) id_paciente,

          ? AS nombre_usuario_creador,
          ? AS fecha_creacion,
          ? AS nombre_usuario_actualizo,    
          ? AS fecha_actualizacion
  
        FROM historias hd 
        WHERE BIN_TO_UUID(hd.id_paciente) = ?`
        ,[usuarioCreador, fechaCreacion, usuarioActualizo, fechaActualizacion, id]);
  
        if (rows.length <= 0) {
          console.log("Historia no encontrada")
          return res.status(404).json({ message: "Historia no encontrado por id paciente" });
        }
        //console.log("Historia Obtenida")
        //console.log(rows[0])
        res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener la historia" });
    }
};


export const updateHistoriaDental = async (req, res) => {
    try {
      const { id } = req.params;
      console.log("PATCH_historia, id: " +id)

      const { 
        ultima_visita_dentista, 
        problemas_dentales_pasados, 
        tratamientos_previos_cuando,
        dolor_sensibilidad,
        condicion_medica_actual, 
        medicamentos_actuales, 
        alergias_conocidas, 
        cirugias_enfermedades_graves, 
        frecuencia_cepillado, 
        uso_hilo_dental, 
        uso_productos_especializados,
        tabaco_frecuencia,
        habito_alimenticio,
        id_usuario_actualizo,
        id_clinica,
        fecha_actualizacion
    } = req.body;

    //console.log(req.body)
  
      const [result] = await pool.query(
        `UPDATE historias 
          SET 
          ultima_visita_dentista = IFNULL(?, ultima_visita_dentista), 
          problemas_dentales_pasados = IFNULL(?, problemas_dentales_pasados), 
          tratamientos_previos_cuando = IFNULL(?, tratamientos_previos_cuando), 
          dolor_sensibilidad = IFNULL(?, dolor_sensibilidad), 

          condicion_medica_actual = IFNULL(?, condicion_medica_actual), 
          medicamentos_actuales = IFNULL(?, medicamentos_actuales), 
          alergias_conocidas = IFNULL(?, alergias_conocidas),
          cirugias_enfermedades_graves = IFNULL(?, cirugias_enfermedades_graves),

          frecuencia_cepillado = IFNULL(?, frecuencia_cepillado),
          uso_hilo_dental = IFNULL(?, uso_hilo_dental),
          uso_productos_especializados = IFNULL(?, uso_productos_especializados),
          tabaco_frecuencia = IFNULL(?, tabaco_frecuencia),
          habito_alimenticio = IFNULL(?, habito_alimenticio)

        WHERE 
          BIN_TO_UUID(id) = ?`,
        [
            ultima_visita_dentista, 
            problemas_dentales_pasados, 
            tratamientos_previos_cuando,
            dolor_sensibilidad,
            condicion_medica_actual, 
            medicamentos_actuales, 
            alergias_conocidas, 
            cirugias_enfermedades_graves, 
            frecuencia_cepillado, 
            uso_hilo_dental, 
            uso_productos_especializados,
            tabaco_frecuencia,
            habito_alimenticio,
            id
        ]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Historia dental no encontrada" });
      
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM historias WHERE BIN_TO_UUID(id) = ?", [id]);

      // ------------------------------------- REGISTRO
      registroAuditoria(id, id_usuario_actualizo, id_clinica, 'UPDATE', 'historias', fecha_actualizacion)
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la historia dental" });
    }
};