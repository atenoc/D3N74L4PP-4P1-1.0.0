import { pool } from "../db.js";
import { 
  registroAuditoria, 
  getUsuarioCreadorRegistro, 
  getFechaCreacionRegistro, 
  getUsuarioActualizoRegistro, 
  getFechaActualizacionRegistro 
} from "../controllers/auditoria.controller.js";

export const createPaciente = async (req, res) => {
    try {
      console.log("Crear Paciente...")
      //console.log(req.body)
      const { nombre, apellidop, apellidom, edad, sexo, telefono, correo, direccion, id_clinica, id_usuario_creador, fecha_creacion} = req.body;

      // Se valida por si el paciente es registrado junto con la cita
      let _sexo = sexo === undefined ? null : sexo;
      let _correo = correo === undefined ? null : correo;
      let _direccion = direccion === undefined ? null : direccion;

      const [existingPaciente] = await pool.execute("SELECT id FROM pacientes WHERE apellidop = ? AND apellidom = ? AND telefono = ?", [apellidop, apellidom, telefono]);
      if (existingPaciente.length > 0) {
        return res.status(400).json({ message: "400" });
      }

      const [result] = await pool.execute(`
        INSERT INTO pacientes (id, nombre, apellidop, apellidom, edad, id_sexo, telefono, correo, direccion, id_clinica) 
        VALUES (UUID_TO_BIN(UUID()),?,?,?,?,?,?,?,?, UUID_TO_BIN(?))`,
        [nombre, apellidop, apellidom, edad, _sexo, telefono, _correo, _direccion, id_clinica]
      );

      if (result.affectedRows === 1) {
        console.log("Paciente registrado")
      }

      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM pacientes WHERE nombre = ? AND apellidop = ? AND telefono = ? AND BIN_TO_UUID(id_clinica) = ?", [nombre, apellidop, telefono, id_clinica]);
      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID del paciente insertado" });
      }
      const { id } = idResult[0];
      
      // ------------------------------------- REGISTRO
      registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'pacientes', fecha_creacion)

      res.status(201).json({ id, nombre, apellidop, apellidom });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar el paciente" });
    }
  };

  // Obtener Usuarios Paginados por id_clinica
export const getPacientesPaginationByIdClinica = async (req, res) => {
  console.log("Get pacientes paginados")
  const { id_clinica } = req.params;
  try {
    const { page, size, orderBy, way } = req.query;
    console.log("page: " + page);
    console.log("size: " + size);
    console.log("orderBy: " + orderBy);
    console.log("modeOrder: " + way);
    const offset = (page - 1) * size;

    let orderByClause = "p.autoincremental DESC"; // Orden predeterminado
    if (orderBy && way) {
      // Verificar si se proporcionaron orderBy y modeOrder
      orderByClause = `${"p." + orderBy} ${way}`;
    }

    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY ${orderByClause}) AS contador,
      BIN_TO_UUID(p.id) AS id, 
      p.nombre, 
      p.apellidop, 
      p.apellidom, 
      p.edad, 
      p.telefono, 
      p.correo, 
      p.direccion, 
      BIN_TO_UUID(p.id_clinica) AS id_clinica 
    FROM pacientes p
    WHERE BIN_TO_UUID(p.id_clinica) = ?
    ORDER BY ${orderByClause}
    LIMIT ? OFFSET ?
    `, [id_clinica, +size, +offset]);
    //console.log([rows])
    const [totalPagesData] = await pool.query('SELECT count(*) AS count FROM pacientes WHERE BIN_TO_UUID(id_clinica) = ?', [id_clinica]);
    const totalPages = Math.ceil(+totalPagesData[0]?.count / size);
    const totalElements = +totalPagesData[0]?.count;

    res.json({
      data: rows,
      pagination: {
        page: +page,
        size: +size,
        totalPages,
        totalElements
      }
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ocurrió un error al obtener los pacientes (por id_clinica)" });
  }
};

export const getPacienteById = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;

    const usuarioCreador = await getUsuarioCreadorRegistro(id);
    const fechaCreacion = await getFechaCreacionRegistro(id);
    const usuarioActualizo = await getUsuarioActualizoRegistro(id);
    const fechaActualizacion = await getFechaActualizacionRegistro(id);

    const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(p.id) id, 
        p.nombre, 
        p.apellidop, 
        p.apellidom,
        p.edad,
        p.id_sexo, 
        p.telefono, 
        p.correo,
        p.direccion,

        ? AS nombre_usuario_creador,
        ? AS fecha_creacion,
        ? AS nombre_usuario_actualizo,    
        ? AS fecha_actualizacion

      FROM pacientes p 
      WHERE BIN_TO_UUID(p.id) = ?`
      ,[usuarioCreador, fechaCreacion, usuarioActualizo, fechaActualizacion, id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    //console.log(rows[0])
    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener el paciente" });
  }
};

export const updatePacienteCita = async (req, res) => {
  try {
    console.log("Update Cita Paciente")
    //console.log(req.body)
    const { id } = req.params;
    console.log("id Paciente cita: " +id)
    const { nombre, apellidop, apellidom, edad, telefono, id_usuario_actualizo, id_clinica, fecha_actualizacion} = req.body;

    const [result] = await pool.query(
      `UPDATE pacientes 
        SET 
        nombre = IFNULL(?, nombre), 
        apellidop = IFNULL(?, apellidop), 
        apellidom = IFNULL(?, apellidom), 
        edad = IFNULL(?, edad), 
        telefono = IFNULL(?, telefono)
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [nombre, apellidop, apellidom, edad, telefono, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Paciente no encontrado" });
    
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id, nombre, apellidop, apellidom FROM pacientes WHERE BIN_TO_UUID(id) = ?",[id]);

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_actualizo, id_clinica, 'UPDATE', 'pacientes', fecha_actualizacion)

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la información del paciente" });
  }
};

export const updatePaciente = async (req, res) => {
  try {
    console.log("Update paciente")
    //console.log(req.body)
    const { id } = req.params;
    console.log("id paciente: "+id)
    const { nombre, apellidop, apellidom, edad, sexo, telefono, correo, direccion, id_usuario_actualizo, id_clinica, fecha_actualizacion } = req.body;

    const [result] = await pool.query(
      `UPDATE pacientes 
        SET 
        nombre = IFNULL(?, nombre), 
        apellidop = IFNULL(?, apellidop), 
        apellidom = IFNULL(?, apellidom), 
        edad = IFNULL(?, edad), 
        id_sexo = IFNULL(?, id_sexo), 
        telefono = IFNULL(?, telefono),
        correo = IFNULL(?, correo), 
        direccion = IFNULL(?, direccion)
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [nombre, apellidop, apellidom, edad, sexo, telefono, correo, direccion, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Paciente no encontrado" });
    
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id, nombre, apellidop, apellidom FROM pacientes WHERE BIN_TO_UUID(id) = ?", [id]);

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_actualizo, id_clinica, 'UPDATE', 'pacientes', fecha_actualizacion)

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la información del paciente" });
  }
};

export const deletePaciente = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
    const { id_usuario_elimino, id_clinica, fecha_eliminacion } = req.query;

    const [rows] = await pool.query("DELETE FROM pacientes WHERE id = uuid_to_bin(?)", [id]);

    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_elimino, id_clinica, 'DELETE', 'citas', fecha_eliminacion)

    res.json({id});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al eliminar al paciente" });
  }
};


export const getPacientesBuscadorByIdClinica = async (req, res) => {

  console.log("Buscando...");

  const { id_clinica } = req.params;
  const { query } = req.body;

  console.log("Query: "+query);

  try {
    if(query.length > 0){
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) AS id, 
        nombre, apellidop, apellidom, edad, telefono
      FROM pacientes
      WHERE BIN_TO_UUID(id_clinica) = ? 
        AND (nombre LIKE ? OR apellidop LIKE ? OR apellidom LIKE ?)
      `, [id_clinica, `%${query}%`, `%${query}%`, `%${query}%`]);
      res.json(rows);
    }else{
      res.json({});
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ocurrió un error al buscar pacientes por id clínica..." });
  }
};
