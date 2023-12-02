import { pool } from "../db.js";

export const createPaciente = async (req, res) => {
    try {
        console.log("Paciente::")
      console.log(req.body)
      const { nombre, apellidop, apellidom, edad, telefono, id_usuario, id_clinica, fecha_creacion} = req.body;
  
      // insertar el nuevo registro
      const [result] = await pool.execute(`
        INSERT INTO pacientes (id, nombre, apellidop, apellidom, edad, telefono, id_usuario, id_clinica, fecha_creacion) 
        VALUES (UUID_TO_BIN(UUID()),?,?,?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
        [nombre, apellidop, apellidom, edad, telefono, id_usuario, id_clinica, fecha_creacion]
      );
  
      if (result.affectedRows === 1) {
        console.log("Paciente registrado")
      }
  
      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM pacientes WHERE nombre = ? AND apellidop = ? AND BIN_TO_UUID(id_usuario) = ? AND BIN_TO_UUID(id_clinica) = ? AND fecha_creacion = ?", [nombre, apellidop, id_usuario, id_clinica, fecha_creacion]);
      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID del paciente insertado" });
      }
      const { id } = idResult[0];
  
      res.status(201).json({ id, nombre, apellidop, apellidom, edad, telefono, id_usuario, id_clinica, fecha_creacion });
      
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
      DATE_FORMAT(p.fecha_creacion, '%d/%m/%Y %H:%i:%s') AS fecha_creacion,
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM pacientes WHERE BIN_TO_UUID(id) = BIN_TO_UUID(p.id_usuario)) AS nombre_usuario_creador,
      BIN_TO_UUID(p.id_clinica) AS id_clinica 
    FROM pacientes p
    WHERE BIN_TO_UUID(p.id_clinica) = ?
    ORDER BY ${orderByClause}
    LIMIT ? OFFSET ?
    `, [id_clinica, +size, +offset]);
    console.log([rows])
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
        BIN_TO_UUID(id_usuario) id_usuario,  
        (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(p.id_usuario)) AS nombre_usuario_creador, 
        DATE_FORMAT(p.fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion
      FROM pacientes p 
      WHERE BIN_TO_UUID(p.id) = ?`
      ,[id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    console.log(rows[0])
    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener el paciente" });
  }
};

export const updatePacienteCita = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
    const { nombre, apellidop, apellidom, edad, telefono} = req.body;

    const [result] = await pool.query(
      `UPDATE pacientes 
        SET 
        nombre = IFNULL(?, nombre), 
        apellidop = IFNULL(?, apellidop), 
        apellidom = IFNULL(?, apellidom), 
        edad = IFNULL(?, edad), 
        telefono = IFNULL(?, telefono),
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [nombre, apellidop, apellidom, edad, telefono, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Paciente no encontrado" });
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id, nombre, apellidop, apellidom FROM pacientes WHERE BIN_TO_UUID(id) = ?"
      ,[id]);

    console.log("Update Paciente: ")
    console.log(rows[0])
    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la información del paciente" });
  }
};

export const updatePaciente = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
    const { nombre, apellidop, apellidom, edad, sexo, telefono, correo, direccion } = req.body;

    const [result] = await pool.query(
      `UPDATE pacientes 
        SET 
        nombre = IFNULL(?, nombre), 
        apellidop = IFNULL(?, apellidop), 
        apellidom = IFNULL(?, apellidom), 
        edad = IFNULL(?, edad), 
        sexo = IFNULL(?, sexo), 
        telefono = IFNULL(?, telefono),
        correo = IFNULL(?, correo), 
        direccion = IFNULL(?, direccion) 
      WHERE 
        BIN_TO_UUID(id) = ?`,
      [nombre, apellidop, apellidom, edad, sexo, telefono, correo, direccion, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Paciente no encontrado" });
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id, nombre, apellidop, apellidom FROM pacientes WHERE BIN_TO_UUID(id) = ?"
      ,[id]);

    console.log("Update Paciente: ")
    console.log(rows[0])
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
    const [rows] = await pool.query("DELETE FROM pacientes WHERE id = uuid_to_bin(?)", [id]);
    if (rows.affectedRows <= 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

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
    return res.status(500).json({ message: "Ocurrió un error al obtener buscar..." });
  }
};
