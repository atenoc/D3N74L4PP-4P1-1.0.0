import { pool } from "../db.js";
import  moment  from "moment";
import { esUUID } from "../utils/validacionUUID.js";
import bcrypt from "bcrypt";
import { getDecryptedPassword } from "../utils/encriptacion.js";

const fecha_hoy = new Date();
var fecha_creacion = moment(fecha_hoy).format('YYYY-MM-DD HH:mm:ss'); //format('YYYY-MM-DD');


export const createUser = async (req, res) => {
  try {
    //console.log(req.body)
    const { correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, id_usuario, id_clinica} = req.body;
    const llave_estatus = 0;

    //comprobar si los parámetros son UUID / caso contrario insertarlos como null
    //const tituloUUID = esUUID(titulo) ? titulo : null;
    //const especialidadUUID = esUUID(especialidad) ? especialidad : null;

    // Validar si el correo ya existe en la base de datos
    const [existingUser] = await pool.execute("SELECT id FROM usuarios WHERE correo = ?", [correo]);

    if (existingUser.length > 0) {
      // Si el correo ya existe, retornar un error
      return res.status(400).json({ message: "400" });
    }

    const hashedPassword = await bcrypt.hash(llave, 10); // 10: número de rondas de hashing
    console.log("hashedPassword:: "+ hashedPassword)

    // Si el correo no existe, insertar el nuevo registro
    const [result] = await pool.execute(`
      INSERT INTO usuarios (id, correo, llave, id_rol, id_titulo, nombre, apellidop, apellidom, id_especialidad, llave_status, telefono, fecha_creacion, id_usuario, id_clinica) 
      VALUES (UUID_TO_BIN(UUID()),?,?,UUID_TO_BIN(?),?,?,?,?,?,?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
      [correo, hashedPassword, rol, titulo, nombre, apellidop, apellidom, especialidad, llave_estatus, telefono, fecha_creacion, id_usuario, id_clinica || null]
    );

    if (result.affectedRows === 1) {
      console.log("Usuario registrado")
    }

    const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM usuarios WHERE correo = ?", [correo]);
    if (!idResult.length) {
      //console.log("createUser --> No se encontró el ID del usuario insertado");
      return res.status(500).json({ message: "No se encontró el ID del usuario insertado" });
    }
    const { id } = idResult[0];

    res.status(201).json({ id, correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, fecha_creacion, id_usuario, id_clinica });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al registrar el usuario" });
  }
};

// old (deprecated)
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY u.autoincremental DESC) AS contador,
      BIN_TO_UUID(u.id) AS id, 
      u.correo, 
      u.rol, 
      t.titulo, 
      u.nombre, 
      u.apellidop, 
      u.apellidom, 
      e.especialidad,  
      u.telefono, 
      DATE_FORMAT(u.fecha_creacion, '%d/%m/%Y %H:%i:%s') AS fecha_creacion,
      BIN_TO_UUID(id_usuario)id_usuario,  
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_usuario)) AS nombre_usuario_creador,
      BIN_TO_UUID(u.id_clinica) AS id_clinica 
    FROM usuarios u
    LEFT JOIN cat_titulos t ON u.titulo = t.id
    LEFT JOIN cat_especialidades e ON u.especialidad = e.id
    ORDER BY u.autoincremental DESC
    `);

    res.json(rows);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios" });
  }
};

// Obtener Usuarios Paginados por id_usuario
export const getUsersPaginationByIdUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { page, size, orderBy, way } = req.query;
    console.log("page: " + page);
    console.log("size: " + size);
    console.log("orderBy: " + orderBy);
    console.log("modeOrder: " + way);
    const offset = (page - 1) * size;

    let orderByClause = "u.autoincremental DESC"; // Orden predeterminado
    if (orderBy && way) {
      // Verificar si se proporcionaron orderBy y modeOrder
      orderByClause = `${"u." + orderBy} ${way}`;
    }

    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY ${orderByClause}) AS contador,
      BIN_TO_UUID(u.id) AS id, 
      u.correo, 
      r.descripcion AS desc_rol,
      t.titulo AS titulo, 
      u.nombre, 
      u.apellidop, 
      u.apellidom, 
      e.especialidad AS especialidad,  
      u.telefono, 
      DATE_FORMAT(u.fecha_creacion, '%d/%m/%Y %H:%i:%s') AS fecha_creacion,
      BIN_TO_UUID(id_usuario) id_usuario,  
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_usuario)) AS nombre_usuario_creador,
      BIN_TO_UUID(u.id_clinica) AS id_clinica 
    FROM usuarios u
    LEFT JOIN cat_roles r ON u.id_rol = r.id
    LEFT JOIN cat_titulos t ON u.id_titulo = t.id
    LEFT JOIN cat_especialidades e ON u.id_especialidad = e.id
    WHERE BIN_TO_UUID(u.id_usuario) = ? 
    ORDER BY ${orderByClause}
    LIMIT ? OFFSET ?
    `, [id, +size, +offset]);
    //console.log([rows])
    const [totalPagesData] = await pool.query('SELECT count(*) AS count FROM usuarios WHERE BIN_TO_UUID(id_usuario) = ?', [id]);
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
    return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios" });
  }
};

// Obtener Usuarios Paginados por id_clinica
export const getUsersPaginationByIdClinica = async (req, res) => {
  const { id_clinica } = req.params;
  try {
    const { page, size, orderBy, way } = req.query;
    console.log("page: " + page);
    console.log("size: " + size);
    console.log("orderBy: " + orderBy);
    console.log("modeOrder: " + way);
    const offset = (page - 1) * size;

    let orderByClause = "u.autoincremental DESC"; // Orden predeterminado
    if (orderBy && way) {
      // Verificar si se proporcionaron orderBy y modeOrder
      orderByClause = `${"u." + orderBy} ${way}`;
    }

    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY ${orderByClause}) AS contador,
      BIN_TO_UUID(u.id) AS id, 
      u.correo, 
      r.descripcion AS desc_rol,
      t.titulo AS titulo, 
      u.nombre, 
      u.apellidop, 
      u.apellidom, 
      e.especialidad AS especialidad,  
      u.telefono, 
      DATE_FORMAT(u.fecha_creacion, '%d/%m/%Y %H:%i:%s') AS fecha_creacion,
      BIN_TO_UUID(id_usuario) id_usuario,  
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_usuario)) AS nombre_usuario_creador,
      BIN_TO_UUID(u.id_clinica) AS id_clinica 
    FROM usuarios u
    LEFT JOIN cat_roles r ON u.id_rol = r.id
    LEFT JOIN cat_titulos t ON u.id_titulo = t.id
    LEFT JOIN cat_especialidades e ON u.id_especialidad = e.id
    WHERE BIN_TO_UUID(u.id_clinica) = ?
    AND r.rol != 'suadmin' 
    ORDER BY ${orderByClause}
    LIMIT ? OFFSET ?
    `, [id_clinica, +size, +offset]);
    console.log([rows])
    const [totalPagesData] = await pool.query('SELECT count(*) AS count FROM usuarios WHERE BIN_TO_UUID(id_clinica) = ?', [id_clinica]);
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
    return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios (por id_clinica)" });
  }
};


// Obtener usuario por id
export const getUser = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
        const [rows] = await pool.query(`
        SELECT 
          BIN_TO_UUID(u.id) id, 
          u.correo, 
          BIN_TO_UUID(u.id_rol)id_rol,
          (SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS rol, 
          (SELECT descripcion FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS desc_rol, 
          u.id_titulo,
          (SELECT titulo FROM cat_titulos WHERE id = id_titulo) AS titulo, 
          u.nombre, 
          u.apellidop, 
          u.apellidom, 
          u.id_especialidad,
          (SELECT especialidad FROM cat_especialidades WHERE id = u.id_especialidad) AS especialidad, 
          u.telefono, 
          DATE_FORMAT(u.fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion,
          u.llave_status, 
          BIN_TO_UUID(u.id_usuario)id_usuario, 
          (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_usuario)) AS nombre_usuario_creador,
          BIN_TO_UUID(u.id_clinica)id_clinica 
        FROM usuarios u
        WHERE BIN_TO_UUID(u.id) = ?`
        ,[id]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      console.log(rows[0])
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario" });
    }
};


  export const updateUser = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { correo, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono } = req.body;
  
      const [result] = await pool.query(
        `UPDATE usuarios 
          SET 
          correo = IFNULL(?, correo), 
          id_rol = IFNULL(UUID_TO_BIN(?), id_rol), 
          id_titulo = IFNULL(?, id_titulo), 
          nombre = IFNULL(?, nombre), 
          apellidop = IFNULL(?, apellidop), 
          apellidom = IFNULL(?, apellidom), 
          id_especialidad = IFNULL(?, id_especialidad), 
          telefono = IFNULL(?, telefono) 
        WHERE 
          BIN_TO_UUID(id) = ?`,
        [correo, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM usuarios WHERE BIN_TO_UUID(id) = ?"
        , [id]);
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del usuario" });
    }
  };


  export const updateUserRegister = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { nombre, apellidop, id_clinica } = req.body;
  
      const [result] = await pool.query(
        `UPDATE usuarios 
          SET 
          nombre = IFNULL(?, nombre), 
          apellidop = IFNULL(?, apellidop),
          id_clinica = IFNULL(UUID_TO_BIN(?), id_clinica) 
        WHERE 
          BIN_TO_UUID(id) = ?`,
        [nombre, apellidop, id_clinica, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Usuario no encontrado para actualizar, al registrarse"});
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM usuarios WHERE BIN_TO_UUID(id) = ?"
        ,[id]);
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del usuario, (al registrarse)" });
    }
  };


  export const deleteUser = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const [rows] = await pool.query("DELETE FROM usuarios WHERE id = uuid_to_bin(?)", [id]);
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.json({id});
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar el usuario" });
    }
  };



  // getUsuarioByCorreo // After Login
  export const getUserByCorreo = async (req, res) => {
    console.log("INICIANDO................................................................................................. ")
    try {
      //console.log(req.body)
      const {correo } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) id,
        BIN_TO_UUID(id_rol) id_rol,
        nombre,
        apellidop,
        (SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS rol,
        BIN_TO_UUID(id_clinica) id_clinica
      FROM usuarios 
      WHERE correo = ?
      `, [correo]);

      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado (por correo)" });
      }
      console.log(rows)
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (por correo)" });
    }
  };


  // validarUsuarioActivo - id usuario / correo // After Login 2
  export const getUserByIdUserAndCorreo = async (req, res) => {
    try {
      //console.log(req.body)
      const {id, correo } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) id,
        correo,
        (SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS rol,
        nombre,
        apellidop 
      FROM usuarios 
      WHERE BIN_TO_UUID(id) = ?
      AND correo = ?
      `, [id, correo]);

      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado (por id/correo)" });
      }

      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (por id/correo)" });
    }
  };

  // Obtener usuario por id
export const getPassByIdUser = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) id, 
        llave
      FROM usuarios 
      WHERE BIN_TO_UUID(id) = ?`
      ,[id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado - pass" });
    }

    const desLlave = getDecryptedPassword(rows[0].llave);
    console.log("Llave real Get Pass: "+desLlave)

    console.log(rows[0])
    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener el usuario - pass" });
  }
};

// actualizar contraseña
export const updateUserPassword = async (req, res) => {
  try {
    //console.log(req.body)
    const { id } = req.params;
    const { llave } = req.body;
    const llave_status=1

    const hashedPassword = await bcrypt.hash(llave, 10); // 10: número de rondas de hashing
    console.log("hashedPassword:: "+ hashedPassword)

    const [result] = await pool.query(
      "UPDATE usuarios SET llave = IFNULL(?, llave), llave_status = IFNULL(?, llave_status) WHERE BIN_TO_UUID(id) = ?",
      [hashedPassword, llave_status, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id, correo FROM usuarios WHERE BIN_TO_UUID(id) = ?",[id]);

    res.json(rows[0]);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al actualizar la contraseña" });
  }
};
  