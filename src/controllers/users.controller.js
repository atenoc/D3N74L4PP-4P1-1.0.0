import { pool } from "../db.js";
import  moment  from "moment";

const fecha_hoy = new Date();
//                            format('YYYY-MM-DD');
var fecha_creacion = moment(fecha_hoy).format('YYYY-MM-DD HH:mm:ss');

export const createUser = async (req, res) => {
  try {
    console.log(req.body)
    const { correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, id_usuario, id_centro } = req.body;

    // Validar si el correo ya existe en la base de datos
    const [existingUser] = await pool.execute("SELECT id FROM usuarios WHERE correo = ?", [correo]);

    if (existingUser.length > 0) {
      // Si el correo ya existe, retornar un error
      return res.status(400).json({ message: "200" });
    }

    // Si el correo no existe, insertar el nuevo registro
    const [result] = await pool.execute(
      "INSERT INTO usuarios (id, correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, fecha_creacion, id_usuario, id_centro) VALUES (UUID_TO_BIN(UUID()),?,?,?,?,?,?,?,?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?))",
      [correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, fecha_creacion, id_usuario, id_centro]
    );

    if (result.affectedRows === 1) {
      console.log("Usuario registrado")
    }

    const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM usuarios WHERE correo = ?", [correo]);

    if (!idResult.length) {
      return res.status(500).json({ message: "No se encontró el ID del usuario insertado" });
    }

    const { id } = idResult[0];
    res.status(201).json({ id, correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, fecha_creacion, id_usuario, id_centro });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al registrar el usuario" });
  }
};


export const getUsers = async (req, res) => {
  try {
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // const [rows] = await pool.query("SELECT * FROM usuarios");
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, fecha_creacion, BIN_TO_UUID(id_usuario)id_usuario, BIN_TO_UUID(id_centro)id_centro FROM usuarios ORDER BY autoincremental DESC");
    // Formatear la lista de usuarios antes de enviarla como respuesta
    const usuariosFormateados = rows.map(response => {
      const fecha_formateada = moment(response.fecha_creacion).format('DD-MM-YYYY HH:mm:ss');
      const usuario_formateado = {
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
        id_centro: response.id_centro
      };
      return usuario_formateado;
    });

    res.json(usuariosFormateados);
  } catch (error) {
    //console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios" });
  }
};

export const getUser = async (req, res) => {
    try {
      const { id } = req.params;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      // const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, fecha_creacion, BIN_TO_UUID(id_usuario)id_usuario, BIN_TO_UUID(id_centro)id_centro FROM usuarios WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      //console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario" });
    }
  };

  export const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono } = req.body;
  
      const [result] = await pool.query(
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        // "UPDATE usuarios SET correo = IFNULL(?, correo), llave = IFNULL(?, llave), rol = IFNULL(?, rol) WHERE id = ?",
        "UPDATE usuarios SET correo = IFNULL(?, correo), llave = IFNULL(?, llave), rol = IFNULL(?, rol), titulo = IFNULL(?, titulo), nombre = IFNULL(?, nombre), apellidop = IFNULL(?, apellidop), apellidom = IFNULL(?, apellidom), especialidad = IFNULL(?, especialidad), telefono = IFNULL(?, telefono) WHERE BIN_TO_UUID(id) = ?",
        [correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, fecha_creacion FROM usuarios WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      res.json(rows[0]);
    } catch (error) {
      //console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del usuario" });
    }
  };

  export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      //const [rows] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
      const [rows] = await pool.query("DELETE FROM usuarios WHERE id = uuid_to_bin(?)", [id]);
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      //res.sendStatus(204);
      //res.sendStatus(200);
      res.json({id});
    } catch (error) {
      //console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar el usuario" });
    }
  };

  export const getUserByCorreo = async (req, res) => {
    console.log("CONSULTANDO: ")
    try {
      const {correo } = req.params;
      console.log("Se recibe correo: " + correo)
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
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
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      // const [rows] = await pool.query("SELECT * FROM usuarios");
      const { id } = req.params;
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, titulo, nombre, apellidop, apellidom, especialidad, telefono, fecha_creacion, BIN_TO_UUID(id_usuario)id_usuario, BIN_TO_UUID(id_centro)id_centro FROM usuarios WHERE BIN_TO_UUID(id_usuario) = ?", [id]);
      res.json(rows);
    } catch (error) {
      //console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios (por id usuario)" });
    }
  };

  