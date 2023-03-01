import { pool } from "../db.js";
import  moment  from "moment";

const fecha_hoy = new Date();
//                            format('YYYY-MM-DD');
var fecha_creacion = moment(fecha_hoy).format('YYYY-MM-DD HH:mm:ss');

export const createCentro = async (req, res) => {
  try {
    
    const { nombre, telefono, correo, direccion, id_usuario} = req.body;
    //console.log(req.body)
    const [rows] = await pool.query(
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      "INSERT INTO centros (nombre, telefono, correo, direccion, fecha_creacion, id_usuario) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, telefono, correo, direccion, fecha_creacion, id_usuario]
    );
    res.status(201).json({ id: rows.insertId, nombre, telefono, correo, direccion, fecha_creacion, id_usuario });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al registrar el centro dental" });
  }
};

export const getCentros = async (req, res) => {
  try {
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    const [rows] = await pool.query("SELECT * FROM centros");
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Ocurrió un error al obtener los centros" });
  }
};

export const getCentro = async (req, res) => {
    try {
      const { id } = req.params;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      const [rows] = await pool.query("SELECT * FROM centros WHERE id = ?", [
        id,
      ]);
  
      if (rows.length <= 0) {
        console.log("Centro no encontrado")
        return res.status(404).json({ message: "Centro no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ message: "Ocurrió un error al obtener el centro dental" });
    }
};

export const updateCentro = async (req, res) => {
    console.log("update")
    try {
      const { id } = req.params;
      const { nombre, telefono, correo, direccion } = req.body;
  
      const [result] = await pool.query(
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        "UPDATE centros SET nombre = IFNULL(?, nombre), telefono = IFNULL(?, telefono), correo = IFNULL(?, correo), direccion = IFNULL(?, direccion) WHERE id = ?",[nombre, telefono, correo, direccion, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Centro no encontrado" });
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        const [rows] = await pool.query("SELECT * FROM centros WHERE id = ?", [
        id,
      ]);
  
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del centro dental" });
    }
};

export const deleteCentro = async (req, res) => {
    try {
      const { id } = req.params;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      const [rows] = await pool.query("DELETE FROM centros WHERE id = ?", [id]);
  
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Centro no encontrado" });
      }
  
      //res.sendStatus(204);
      //res.sendStatus(200);
      res.json({"status":"Id:"+ id +" - Centro eliminado"});
    } catch (error) {
      return res.status(500).json({ message: "Ocurrió un error al eliminar el centro dental" });
    }
};

export const getCentroByIdUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    const [rows] = await pool.query("SELECT * FROM centros WHERE id_usuario = ?", [
      id_usuario,
    ]);

    if (rows.length <= 0) {
      console.log("Centro no encontrado por id_usuario")
      //return res.status(404).json({ message: "Centro no encontrado" });
      // Se retorna un json con los datos del centro en vacio, para no mostrar el error del 404 en consola
      return res.json(
        { 
          "id":0,
          "nombre":" ",
          "telefono":"",
          "correo":" ",
          "direccion":" ",
          "fecha_creacion":" ",
          "id_usuario":id_usuario
        }
      );
    }

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Ocurrió un error al obtener el centro" });
  }
};


  