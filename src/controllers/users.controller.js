import { pool } from "../db.js";
import  moment  from "moment";

const fecha_hoy = new Date();
//                            format('YYYY-MM-DD');
var fecha_creacion = moment(fecha_hoy).format('YYYY-MM-DD HH:mm:ss');

export const createUser = async (req, res) => {
  try {
    
    const { correo, llave, rol, id_usuario } = req.body;
    //console.log("fecha_creacion: "+fecha_creacion)
    const [rows] = await pool.query(
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      "INSERT INTO usuarios (id, correo, llave, rol, fecha_creacion, id_usuario) VALUES (UUID_TO_BIN(UUID()),?, ?, ?, ?, UUID_TO_BIN(?))",
      [correo, llave, rol, fecha_creacion, id_usuario]
    );
    res.status(201).json({ id: rows.insertId, correo, llave, rol, fecha_creacion, id_usuario });
    
  } catch (error) {
    //console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al registrar el usuario" });
  }
};

export const getUsers = async (req, res) => {
  try {
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // const [rows] = await pool.query("SELECT * FROM usuarios");
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, fecha_creacion, BIN_TO_UUID(id_usuario)id_usuario FROM usuarios");
    res.json(rows);
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
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, fecha_creacion, BIN_TO_UUID(id_usuario)id_usuario FROM usuarios WHERE BIN_TO_UUID(id) = ?", [
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
      const { correo, llave, rol } = req.body;
  
      const [result] = await pool.query(
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        // "UPDATE usuarios SET correo = IFNULL(?, correo), llave = IFNULL(?, llave), rol = IFNULL(?, rol) WHERE id = ?",
        "UPDATE usuarios SET correo = IFNULL(?, correo), llave = IFNULL(?, llave), rol = IFNULL(?, rol) WHERE BIN_TO_UUID(id) = ?",
        [correo, llave, rol, id]
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
      res.json({"status":"Id:"+ id +" - Usuario eliminado"});
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
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, fecha_creacion, BIN_TO_UUID(id_usuario) id_usuario FROM usuarios WHERE correo = ?", [  
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
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, rol, fecha_creacion, BIN_TO_UUID(id_usuario)id_usuario FROM usuarios WHERE BIN_TO_UUID(id_usuario) = ?", [id]);
      res.json(rows);
    } catch (error) {
      //console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios (por id usuario)" });
    }
  };

  