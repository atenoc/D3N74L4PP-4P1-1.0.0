import { pool } from "../db.js";
import { esUUID } from "../utils/validacionUUID.js";
import bcrypt from "bcrypt";
import { 
  registroAuditoria, 
  getUsuarioCreadorRegistro, 
  getFechaCreacionRegistro, 
  getUsuarioActualizoRegistro, 
  getFechaActualizacionRegistro 
} from "../controllers/auditoria.controller.js";

export const createUser = async (req, res) => {
  try {
    console.log("CREAR Usuario")
    //console.log(req.body);
    const {
      correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, id_clinica, id_usuario_creador, fecha_creacion
    } = req.body;

    const llave_estatus = 0;

    let id_titulo = titulo === 'null' ? null : titulo;
    let id_especialidad = especialidad === 'null' ? null : especialidad;
    let clinica = id_clinica === 'null' ? null : id_clinica;

    const [existingUser] = await pool.execute("SELECT id FROM usuarios WHERE correo = ?", [correo]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "400" }); 
    }

    const hashedPassword = await bcrypt.hash(llave, 10); // 10: número de rondas de hashing
    console.log("hashedPassword:: " + hashedPassword);

    const [result] = await pool.execute(`
      INSERT INTO usuarios (id, correo, llave, id_rol, id_titulo, nombre, apellidop, apellidom, id_especialidad, llave_status, telefono, id_clinica) 
      VALUES (UUID_TO_BIN(UUID()), ?, ?, UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?) )`,
      [correo, hashedPassword, rol, id_titulo, nombre, apellidop, apellidom, id_especialidad, llave_estatus, telefono, clinica]
    );

    if (result.affectedRows === 1) {
      console.log("Usuario registrado");
    } else {
      return res.status(500).json({ message: "Failed to register user" });
    }

    const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM usuarios WHERE correo = ?", [correo]);
    if (!idResult.length) {
      return res.status(500).json({ message: "No se encontró el ID del usuario insertado" });
    }
    const { id } = idResult[0];

    // ------------------------------------- REGISTRO
    registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'usuarios', fecha_creacion)

    res.status(201).json({ id, correo, llave, rol, id_titulo, nombre, apellidop, apellidom, id_especialidad, telefono, fecha_creacion, id_usuario_creador, id_clinica });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ocurrió un error al registrar el usuario" });
  }
};


export const getUsersOnlySop = async (req, res) => {

  try {
    const [rows] = await pool.query(`
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.autoincremental DESC) AS contador,
        BIN_TO_UUID(u.id) AS id, 
        u.correo, 
        r.descripcion AS desc_rol,
        t.titulo AS titulo, 
        u.nombre, 
        u.apellidop, 
        u.apellidom, 
        e.especialidad AS especialidad,  
        u.telefono, 
        BIN_TO_UUID(u.id_clinica) AS id_clinica,
        (SELECT nombre FROM clinicas WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_clinica)) AS nombre_clinica
    FROM usuarios u
    LEFT JOIN cat_roles r ON u.id_rol = r.id
    LEFT JOIN cat_titulos t ON u.id_titulo = t.id
    LEFT JOIN cat_especialidades e ON u.id_especialidad = e.id
    WHERE r.rol = 'suadmin'
    ORDER BY u.autoincremental DESC 
    `);

    //console.log(rows)

    res.json(rows);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios para sop" });
  }
};

// Obtener Usuarios Paginados por id_usuario_creador
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
      BIN_TO_UUID(id_usuario_creador) id_usuario_creador,  
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_usuario_creador)) AS nombre_usuario_creador,
      BIN_TO_UUID(u.id_clinica) AS id_clinica 
    FROM usuarios u
    LEFT JOIN cat_roles r ON u.id_rol = r.id
    LEFT JOIN cat_titulos t ON u.id_titulo = t.id
    LEFT JOIN cat_especialidades e ON u.id_especialidad = e.id
    WHERE BIN_TO_UUID(u.id_usuario_creador) = ? 
    ORDER BY ${orderByClause}
    LIMIT ? OFFSET ?
    `, [id, +size, +offset]);
    //console.log([rows])
    const [totalPagesData] = await pool.query('SELECT count(*) AS count FROM usuarios WHERE BIN_TO_UUID(id_usuario_creador) = ?', [id]);
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
    //console.log([rows])
    const [totalPagesData] = await pool.query('SELECT count(*) AS count FROM usuarios WHERE BIN_TO_UUID(id_clinica) = ?', [id_clinica]);
    const totalPages = Math.ceil(+totalPagesData[0]?.count / size);
    const totalElements = +totalPagesData[0]?.count;

    res.json({
      data: rows,
      pagination: {
        page: +page,
        size: +size,
        totalPages,
        totalElements: totalElements-1
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

      const usuarioCreador = await getUsuarioCreadorRegistro(id);
      const fechaCreacion = await getFechaCreacionRegistro(id);
      const usuarioActualizo = await getUsuarioActualizoRegistro(id);
      const fechaActualizacion = await getFechaActualizacionRegistro(id);

    const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(u.id) as id, 
        u.correo, 
        BIN_TO_UUID(u.id_rol) as id_rol,
        (SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_rol)) AS rol,
        (SELECT descripcion FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS desc_rol, 
        u.id_titulo,
        (SELECT titulo FROM cat_titulos WHERE id = id_titulo) AS titulo,  
        u.nombre, 
        u.apellidop, 
        u.apellidom, 
        u.id_especialidad,
        (SELECT especialidad FROM cat_especialidades WHERE id = u.id_especialidad) AS especialidad, 
        u.telefono, 
        u.llave_status, 
        BIN_TO_UUID(u.id_clinica) as id_clinica,

        ? AS nombre_usuario_creador,
        ? AS fecha_creacion,
        ? AS nombre_usuario_actualizo,    
        ? AS fecha_actualizacion

      FROM usuarios u
      LEFT JOIN auditoria a ON BIN_TO_UUID(a.id_registro) = BIN_TO_UUID(u.id) -- Únete con auditoria usando el id del registro de auditoría
      WHERE BIN_TO_UUID(u.id) = ?`, [usuarioCreador, fechaCreacion, usuarioActualizo, fechaActualizacion, id]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      //console.log(rows[0])
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
      const { correo, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, id_usuario_actualizo, id_clinica, fecha_actualizacion } = req.body;
      console.log("correo:: "+correo)
  
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
      
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id, nombre, apellidop, apellidom FROM usuarios WHERE BIN_TO_UUID(id) = ?", [id]);

      if (result.affectedRows === 1) {
        console.log("Usuario actualizado");
      } else {
        return res.status(500).json({ message: "Failed to update user" });
      }

      // ------------------------------------- REGISTRO
      registroAuditoria(id, id_usuario_actualizo, id_clinica, 'UPDATE', 'usuarios', fecha_actualizacion)
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del usuario" });
    }
  };

 // REGISTRO USER
  export const updateUserRegister = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { nombre, apellidop, id_clinica } = req.body;

      console.log("id actualizar::: "+id)
      //console.log(req.body)
  
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

      const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id FROM usuarios WHERE BIN_TO_UUID(id) = ?",[id]);

      //NOTA: No se registra este evento, ya que el usuario está creando su clinica y sólo actualizó su nombre real
      //registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'usuarios', fecha_creacion)
      console.log("Usuario actualizado")
  
      res.json(rows[0]);
    } catch (error) {
      console.log("Error al actualizar")
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del usuario, (al registrarse)" });
    }
  };


  export const deleteUser = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { id_usuario_elimino, id_clinica, fecha_eliminacion } = req.query;
      console.log("ELIMINAR USUARIO")
      //console.log(req.body)
      console.log("id:: "+id)
      console.log(fecha_eliminacion)

      const [rows] = await pool.query("DELETE FROM usuarios WHERE id = uuid_to_bin(?)", [id]);
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // ------------------------------------- REGISTRO
      registroAuditoria(id, id_usuario_elimino, id_clinica, 'DELETE', 'usuarios', fecha_eliminacion)
  
      res.json({id});
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar el usuario" });
    }
  };


  export const getUsuariosMedicosBuscadorByIdClinica = async (req, res) => {

    console.log("Buscando usuarios medicos...");
  
    const { id_clinica } = req.params;
    const { query } = req.body;
  
    console.log("Query: "+query);
  
    try {
      if(query.length > 0){
        const [rows] = await pool.query(`
        SELECT 
          BIN_TO_UUID(id) AS id, 
          id_titulo, 
          (SELECT titulo FROM cat_titulos WHERE id = id_titulo) AS titulo, 
          id_especialidad,
          (SELECT especialidad FROM cat_especialidades WHERE id = id_especialidad) AS especialidad,  
          nombre, apellidop, apellidom
        FROM usuarios
        WHERE BIN_TO_UUID(id_clinica) = ? 
          AND BIN_TO_UUID(id_rol) = 'b290fa05-5d9b-11ee-8537-00090ffe0001'
          AND (nombre LIKE ? OR apellidop LIKE ? OR apellidom LIKE ?)
        `, [id_clinica, `%${query}%`, `%${query}%`, `%${query}%`]);
        res.json(rows);
      }else{
        res.json({});
      }
  
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Ocurrió un error al buscar usuarios médicos." });
    }
  };