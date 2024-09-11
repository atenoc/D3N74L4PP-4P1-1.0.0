import { pool } from "../db.js";
import { registroAuditoria, usuarioCreadorRegistro, fechaCreacionRegistro, usuarioActualizoRegistro, fechaActualizacionRegistro } from "../controllers/auditoria.controller.js";

export const createCentro = async (req, res) => {
  try {
    //console.log(req.body)
    const { nombre, telefono, correo, direccion, fecha_creacion, id_usuario_creador, id_plan} = req.body;
    const [result] = await pool.query(
      "INSERT INTO clinicas (id, nombre, telefono, correo, direccion, fecha_creacion, id_usuario_creador, id_plan) VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?, UUID_TO_BIN(?), ?)",
      [nombre, telefono, correo, direccion, fecha_creacion, id_usuario_creador, id_plan]
    );
    if (result.affectedRows === 1) {
      console.log("Centro registrado")
    }

    const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM clinicas WHERE nombre = ? AND telefono = ? AND BIN_TO_UUID(id_usuario_creador) = ?", [nombre, telefono, id_usuario_creador]);
    if (!idResult.length) {
      return res.status(500).json({ message: "No se encontró el ID del centro insertado" });
    }
    const { id } = idResult[0];

    registroAuditoria(id, id_usuario_creador, id, 'CREATE', 'clinicas', fecha_creacion)

    res.status(201).json({ id, nombre, telefono, correo, direccion, fecha_creacion, id_usuario_creador, id_plan });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al registrar el centro dental" });
  }
};

export const getCentros = async (req, res) => {
  try {
    //console.log(req.body)
    const [rows] = await pool.query(`
      SELECT BIN_TO_UUID(id) id, nombre, telefono, correo, direccion FROM clinicas ORDER BY autoincremental DESC
    `);
    res.json(rows);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los centros" });
  }
};

export const getCentro = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;

      const usuarioCreador = await usuarioCreadorRegistro(id);
      const fechaCreacion = await fechaCreacionRegistro(id);
      const usuarioActualizo = await usuarioActualizoRegistro(id);
      const fechaActualizacion = await fechaActualizacionRegistro(id);

      const [rows] = await pool.query(`
        SELECT 
          BIN_TO_UUID(id) id, 
          nombre, 
          telefono, 
          correo, 
          direccion, 
          DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion, 
          -- id_usuario_creador,
          id_plan,
          (SELECT plan FROM cat_planes WHERE id = id_plan) AS desc_plan,

          ? AS nombre_usuario_creador,
          ? AS fecha_creacion,
          ? AS nombre_usuario_actualizo,    
          ? AS fecha_actualizacion

        FROM clinicas 
        WHERE BIN_TO_UUID(id) = ?`
        ,[usuarioCreador, fechaCreacion, usuarioActualizo, fechaActualizacion, id]);
  
      if (rows.length <= 0) {
        console.log("Centro no encontrado")
        return res.status(404).json({ message: "Centro no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el centro dental" });
    }
};

export const updateCentro = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { nombre, telefono, correo, direccion, id_usuario_actualizo, id_clinica, fecha_actualizacion } = req.body;
  
      const [result] = await pool.query(
        "UPDATE clinicas SET nombre = IFNULL(?, nombre), telefono = IFNULL(?, telefono), correo = IFNULL(?, correo), direccion = IFNULL(?, direccion) WHERE BIN_TO_UUID(id) = ?",[nombre, telefono, correo, direccion, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Centro no encontrado" });
      
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, nombre, telefono, correo, direccion FROM clinicas WHERE BIN_TO_UUID(id) = ?", [id]);
  
      registroAuditoria(id, id_usuario_actualizo, id_clinica, 'UPDATE', 'clinicas', fecha_actualizacion)

      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del centro dental" });
    }
};

export const deleteCentro = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { id_usuario_elimino, id_clinica, fecha_eliminacion } = req.body;

      const [rows] = await pool.query("DELETE FROM clinicas WHERE id = uuid_to_bin(?)", [id]);
  
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Centro no encontrado (al eliminar clínica)" });
      }

      const [rowsUsuarios] = await pool.query("DELETE FROM usuarios WHERE id_clinica = uuid_to_bin(?)", [id]);
      if (rowsUsuarios.affectedRows <= 0) {
        console.log("No se encontraron pacientes para eliminar")
      }

      const [rowsPaciente] = await pool.query("DELETE FROM pacientes WHERE id_clinica = uuid_to_bin(?)", [id]);
      if (rowsPaciente.affectedRows <= 0) {
        console.log("No se encontraron pacientes para eliminar")
      }

      const [rowsCitas] = await pool.query("DELETE FROM citas WHERE id_clinica = uuid_to_bin(?)", [id]);
      if (rowsCitas.affectedRows <= 0) {
        console.log("No se encontraron citas para eliminar")
      }

      registroAuditoria(id, id_usuario_elimino, id_clinica, 'DELETE', 'usuarios', fecha_eliminacion)
  
      res.json({"status":"Id:"+ id +" - Clinica eliminada eliminado"});
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar el centro dental" });
    }
};

// For login / validar si el usuario tiene registrada una clinica
export const getCentroByIdUserSuAdmin = async (req, res) => {
  try {
    //console.log(req.body)
    const { id_usuario } = req.params;
    const [result] = await pool.query(`
      SELECT BIN_TO_UUID(id_clinica)id_clinica FROM auditoria WHERE tipo_evento='CREATE' AND tabla_afectada='clinicas' AND BIN_TO_UUID(id_usuario) = ?`
    ,[id_usuario]);

    if (result.length <= 0) {
      console.log("id Centro no encontrado (por id_usuario)")
      return res.status(404).json({ message: "id Centro no encontrado (por id_usuario)" });
    }

    const id_clinica = result[0].id_clinica


    const [rows] = await pool.query(`
      SELECT * FROM clinicas WHERE BIN_TO_UUID(id) = ?`
    ,[id_clinica]);

    if (rows.length <= 0) {
      console.log("Centro no encontrado (por id_clinica)")
      return res.status(404).json({ message: "id Centro no encontrado (por id_clinica)" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener el centro (por id_usuario)" });
  }
};