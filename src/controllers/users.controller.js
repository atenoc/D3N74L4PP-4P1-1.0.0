import { pool } from "../db.js";
import  moment  from "moment";
import { esUUID } from "../utils/validacionUUID.js";

const fecha_hoy = new Date();
var fecha_creacion = moment(fecha_hoy).format('YYYY-MM-DD HH:mm:ss'); //format('YYYY-MM-DD');
var id_clinica

export const createUser = async (req, res) => {
  try {
    console.log(req.body)
    const { correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, id_usuario} = req.body;
    const llave_estatus = 0;

    //Consultamos el id de la clínica del usuario
    const [clinicas] = await pool.query(`SELECT BIN_TO_UUID(id) id FROM clinicas WHERE BIN_TO_UUID(id_usuario) = ?`,[id_usuario]);
    if (clinicas.length > 0 && clinicas[0].id) {
      id_clinica = clinicas[0].id;
      console.log("id_clinica:", id_clinica);
    } else {
      console.log("No se encontró ninguna clínica para el ID de usuario:", id_usuario);
      return res.status(500).json({ message: "No tiene registrado su clínica/consultorio dental. " });
    }

    //comprobar si los parámetros son UUID / caso contrario insertarlos como null
    const tituloUUID = esUUID(titulo) ? titulo : null;
    const especialidadUUID = esUUID(especialidad) ? especialidad : null;


    // Validar si el correo ya existe en la base de datos
    const [existingUser] = await pool.execute("SELECT id FROM usuarios WHERE correo = ?", [correo]);

    if (existingUser.length > 0) {
      // Si el correo ya existe, retornar un error
      return res.status(400).json({ message: "200" });
    }

    // Si el correo no existe, insertar el nuevo registro
    const [result] = await pool.execute(`
      INSERT INTO usuarios (id, correo, llave, rol, id_titulo, nombre, apellidop, apellidom, id_especialidad, llave_status, telefono, fecha_creacion, id_usuario, id_clinica) 
      VALUES (UUID_TO_BIN(UUID()),?,?,?,UUID_TO_BIN(?),?,?,?,UUID_TO_BIN(?),?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?))`,
      [correo, llave, rol, tituloUUID, nombre, apellidop, apellidom, especialidadUUID, llave_estatus, telefono, fecha_creacion, id_usuario, id_clinica]
    );

    if (result.affectedRows === 1) {
      console.log("Usuario registrado")
    }

    const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM usuarios WHERE correo = ?", [correo]);

    if (!idResult.length) {
      return res.status(500).json({ message: "No se encontró el ID del usuario insertado" });
    }

    const { id } = idResult[0];
    res.status(201).json({ id, correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, fecha_creacion, id_usuario, id_clinica });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al registrar el usuario" });
  }
};


export const getUsers = async (req, res) => {
  try {
    // const [rows] = await pool.query("SELECT * FROM usuarios");
    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY u.autoincremental DESC) AS contador,
      BIN_TO_UUID(u.id) AS id, 
      u.correo, 
      u.llave, 
      u.rol, 
      t.descripcion AS titulo, 
      u.nombre, 
      u.apellidop, 
      u.apellidom, 
      e.descripcion AS especialidad,  -- Usar la descripción en lugar del UUID
      u.telefono, 
      u.fecha_creacion AS fecha_creacion,
      BIN_TO_UUID(id_usuario)id_usuario,  
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_usuario)) AS nombre_usuario_creador,
      BIN_TO_UUID(u.id_clinica) AS id_clinica 
    FROM usuarios u
    LEFT JOIN cat_titulos t ON u.titulo = t.id
    LEFT JOIN cat_especialidades e ON u.especialidad = e.id
    ORDER BY u.autoincremental DESC
    `);
    // Formatear la lista de usuarios antes de enviarla como respuesta
    const usuariosFormateados = rows.map(response => {
      const fecha_formateada = moment(response.fecha_creacion).format('DD/MM/YYYY HH:mm:ss');
      const usuario_formateado = {
        contador: response.contador,
        id: response.id,
        correo: response.correo,
        llave: response.lave,
        rol: response.rol,
        titulo: response.titulo,
        nombre: response.nombre, 
        apellidop: response.apellidop, 
        apellidom: response.apellidom, 
        especialidad: response.especialidad, 
        telefono: response.telefono,
        fecha_creacion: fecha_formateada,
        id_usuario: response.id_usuario,
        nombre_usuario_creador: response.nombre_usuario_creador,
        id_clinica: response.id_clinica
      };
      return usuario_formateado;
    });

    console.log(usuariosFormateados)
    res.json(usuariosFormateados);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios" });
  }
};

export const getUsersPagination = async (req, res) => {
  try {
    const { page, size, orderBy, way } = req.query;
    console.log("page: "+page)
    console.log("size: "+size)
    console.log("orderBy: "+orderBy)
    console.log("modeOrder: "+way)
    const offset = (page - 1) *  size;

    let orderByClause = "u.autoincremental DESC"; // Orden predeterminado
    if (orderBy && way) {
      // Verificar si se proporcionaron orderBy y modeOrder
      orderByClause = `${"u."+orderBy} ${way}`;
    }

    const [rows] = await pool.query(`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY ${orderByClause}) AS contador,
      BIN_TO_UUID(u.id) AS id, 
      u.correo, 
      u.llave, 
      u.rol, 
      t.descripcion AS titulo, 
      u.nombre, 
      u.apellidop, 
      u.apellidom, 
      e.descripcion AS especialidad,  -- Usar la descripción en lugar del UUID
      u.telefono, 
      u.fecha_creacion AS fecha_creacion,
      BIN_TO_UUID(id_usuario)id_usuario,  
      (SELECT CONCAT(nombre, ' ', apellidop, ' ', apellidom) FROM usuarios WHERE BIN_TO_UUID(id) = BIN_TO_UUID(u.id_usuario)) AS nombre_usuario_creador,
      BIN_TO_UUID(u.id_clinica) AS id_clinica 
    FROM usuarios u
    LEFT JOIN cat_titulos t ON u.id_titulo = t.id
    LEFT JOIN cat_especialidades e ON u.id_especialidad = e.id
    ORDER BY ${orderByClause}
    LIMIT ? OFFSET ?
    `, [+size, +offset]);

    const [totalPagesData] = await pool.query('SELECT count(*) AS count FROM usuarios');
    const totalPages = Math.ceil(+totalPagesData[0]?.count / size);
    const totalElements = +totalPagesData[0]?.count;

    // Formatear la lista de usuarios antes de enviarla como respuesta
    const usuariosFormateados = rows.map(response => {
      const fecha_formateada = moment(response.fecha_creacion).format('DD/MM/YYYY HH:mm:ss');
      const usuario_formateado = {
        contador: response.contador,
        id: response.id,
        correo: response.correo,
        llave: response.lave,
        rol: response.rol,
        titulo: response.titulo,
        nombre: response.nombre, 
        apellidop: response.apellidop, 
        apellidom: response.apellidom, 
        especialidad: response.especialidad, 
        telefono: response.telefono,
        fecha_creacion: fecha_formateada,
        id_usuario: response.id_usuario,
        nombre_usuario_creador: response.nombre_usuario_creador,
        id_clinica: response.id_clinica
      };
      return usuario_formateado;
    });

    console.log(usuariosFormateados)
    //res.json(usuariosFormateados);
    res.json({
      data: usuariosFormateados,
      pagination:{
        page: +page,
        size: +size,
        totalPages,
        totalElements
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios" });
  }
};

export const getUser = async (req, res) => {
    try {
      const { id } = req.params;
      // const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
        const [rows] = await pool.query(`
        SELECT 
          BIN_TO_UUID(id) id, 
          correo, 
          llave, 
          rol, 
          BIN_TO_UUID(id_titulo)id_titulo,
            (SELECT descripcion FROM cat_titulos WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_titulo)) AS descripcion_titulo, 
          nombre, 
          apellidop, 
          apellidom, 
          BIN_TO_UUID(id_especialidad)id_especialidad,
            (SELECT descripcion FROM cat_especialidades WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_especialidad)) AS descripcion_especialidad, 
          telefono, 
          DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion, 
          BIN_TO_UUID(id_usuario)id_usuario, 
          BIN_TO_UUID(id_clinica)id_clinica 
        FROM usuarios 
        WHERE BIN_TO_UUID(id) = ?`
        ,[id]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario" });
    }
};

  export const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono } = req.body;
  
      const [result] = await pool.query(
        // "UPDATE usuarios SET correo = IFNULL(?, correo), llave = IFNULL(?, llave), rol = IFNULL(?, rol) WHERE id = ?",
        `UPDATE usuarios 
          SET 
          correo = IFNULL(?, correo), 
          llave = IFNULL(?, llave), 
          rol = IFNULL(?, rol), 
          id_titulo = IFNULL(UUID_TO_BIN(?), id_titulo), 
          nombre = IFNULL(?, nombre), 
          apellidop = IFNULL(?, apellidop), 
          apellidom = IFNULL(?, apellidom), 
          id_especialidad = IFNULL(UUID_TO_BIN(?), id_especialidad), 
          telefono = IFNULL(?, telefono) 
        WHERE 
          BIN_TO_UUID(id) = ?`,
        [correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, fecha_creacion FROM usuarios WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del usuario" });
    }
  };

  export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      //const [rows] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
      const [rows] = await pool.query("DELETE FROM usuarios WHERE id = uuid_to_bin(?)", [id]);
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      //res.sendStatus(204);
      //res.sendStatus(200);
      res.json({id});
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar el usuario" });
    }
  };

  export const getUserByCorreo = async (req, res) => {
    console.log("CONSULTANDO: ")
    try {
      const {correo } = req.params;
      console.log("Se recibe correo: " + correo)
      //const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, nombre FROM usuarios WHERE correo = ?", [  
        correo,
      ]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado (por correo)" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (por correo)" });
    }
  };

  export const getUsersByIdUser = async (req, res) => {
    try {
      // const [rows] = await pool.query("SELECT * FROM usuarios");
      const { id } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) id, 
        correo, 
        llave, 
        rol, 
        BIN_TO_UUID(id_titulo)id_titulo, 
        nombre, 
        apellidop, 
        apellidom, 
        BIN_TO_UUID(id_especialidad)id_especialidad, 
        telefono, 
        fecha_creacion, 
        BIN_TO_UUID(id_usuario)id_usuario, 
        BIN_TO_UUID(id_clinica)id_clinica 
      FROM usuarios 
      WHERE BIN_TO_UUID(id_usuario) = ?`, [id]);
      res.json(rows);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios (por id usuario)" });
    }
  };


  