import { pool } from "../db.js";
import  moment  from "moment";

const fecha_hoy = new Date();
//                            format('YYYY-MM-DD');
var fecha = moment(fecha_hoy).format('YYYY-MM-DD HH:mm:ss');
//console.log("fecha hoy: "+ fecha)

export const createUser = async (req, res) => {
  try {
    
    const { correo, llave, rol } = req.body;
    console.log(req.body)
    console.log("fecha_creacion: "+fecha)
    const [rows] = await pool.query(
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      "INSERT INTO usuarios (correo, llave, rol, fecha_creacion) VALUES (?, ?, ?, ?)",
      [correo, llave, rol, fecha]
    );
    res.status(201).json({ id: rows.insertId, correo, llave, rol, fecha });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error bd insertar Usuario" });
  }
};

export const getUsers = async (req, res) => {
  try {
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Error bd obtener Usuarios" });
  }
};

export const getUser = async (req, res) => {
    try {
      const { id } = req.params;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
        id,
      ]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ message: "Error bd obtener Usuario" });
    }
  };

  export const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { correo, llave, rol } = req.body;
  
      const [result] = await pool.query(
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        "UPDATE usuarios SET correo = IFNULL(?, correo), llave = IFNULL(?, llave), rol = IFNULL(?, rol) WHERE id = ?",
        [correo, llave, rol, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [
        id,
      ]);
  
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ message: "Error bd actualizar Usuario" });
    }
  };

  export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      const [rows] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
  
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      //res.sendStatus(204);
      //res.sendStatus(200);
      res.json({"status":"Id:"+ id +" - Usuario eliminado"});
    } catch (error) {
      return res.status(500).json({ message: "Error DB Delete Usuario" });
    }
  };