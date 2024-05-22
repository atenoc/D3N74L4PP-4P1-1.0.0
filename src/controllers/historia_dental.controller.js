import { pool } from "../db.js";


export const createHistoriaDental = async (req, res) => {
    try {
      console.log("Historia::")
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
        INSERT INTO historias_dentales (id, 
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
            fecha_creacion) 
        VALUES (UUID_TO_BIN(UUID()),?,?,?,?,?,?,?,?,?,?,?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
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
            id_clinica,
            id_usuario_creador,
            fecha_creacion
        ]
      );
  
      if (result.affectedRows === 1) {
        console.log("Historia registrada")
      }
  
      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM historias_dentales WHERE BIN_TO_UUID(id_paciente) = ? AND BIN_TO_UUID(id_clinica) = ? AND fecha_creacion = ?",
       [id_paciente, id_clinica, fecha_creacion]);
      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID de la historia insertada" });
      }
      const { id } = idResult[0];
  
      res.status(201).json({
         id, id_paciente, id_usuario_creador, fecha_creacion });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar la historia dental" });
    }
};

export const getHistoriaDentalByIdPaciente = async (req, res) => {
    try {
        
        console.log(req.params)
        const { id } = req.params;
        console.log("id_paciente: " +id)
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
          BIN_TO_UUID(id_usuario_creador) id_usuario_creador,  
          (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(hd.id_usuario_creador)) AS nombre_usuario_creador, 
          DATE_FORMAT(hd.fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion,
          BIN_TO_UUID(id_usuario_actualizo) id_usuario_actualizo,  
          (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(hd.id_usuario_actualizo)) AS nombre_usuario_actualizo, 
          DATE_FORMAT(hd.fecha_actualizacion, '%d/%m/%Y %H:%i:%s') as fecha_actualizacion
        FROM historias_dentales hd 
        WHERE BIN_TO_UUID(hd.id_paciente) = ?`
        ,[id]);
  
        if (rows.length <= 0) {
            return res.status(404).json({ message: "Historia no encontrado" });
        }
        console.log(rows[0])
        res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener la historia" });
    }
};


export const updateHistoriaDental = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
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
        fecha_actualizacion
    } = req.body;
  
      const [result] = await pool.query(
        `UPDATE historias_dentales 
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
          habito_alimenticio = IFNULL(?, habito_alimenticio),

          id_usuario_actualizo = IFNULL(UUID_TO_BIN(?), id_usuario_actualizo),  
          fecha_actualizacion = IFNULL(?, fecha_actualizacion)
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
            id_usuario_actualizo,
            fecha_actualizacion,
            id
        ]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Historia dental no encontrada" });
      
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM historias_dentales WHERE BIN_TO_UUID(id) = ?", [id]);
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la historia dental" });
    }
};