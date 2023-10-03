import { pool } from "../db.js";
import  moment  from "moment";

const fecha_hoy = new Date();
//                            format('YYYY-MM-DD');
var fecha_creacion = moment(fecha_hoy).format('YYYY-MM-DD HH:mm:ss');

export const createCentro = async (req, res) => {
  try {
    const { nombre, telefono, correo, direccion, id_usuario} = req.body;
    const [result] = await pool.query(
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      "INSERT INTO clinicas (id, nombre, telefono, correo, direccion, fecha_creacion, id_usuario) VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, ?, ?, UUID_TO_BIN(?))",
      [nombre, telefono, correo, direccion, fecha_creacion, id_usuario]
    );
    if (result.affectedRows === 1) {
      console.log("Centro registrado")
    }

    const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM clinicas WHERE nombre = ? AND telefono = ? AND BIN_TO_UUID(id_usuario) = ?", [nombre, telefono, id_usuario]);

    if (!idResult.length) {
      return res.status(500).json({ message: "No se encontró el ID del centro insertado" });
    }

    const { id } = idResult[0];
    res.status(201).json({ id, nombre, telefono, correo, direccion, fecha_creacion, id_usuario });

    //res.status(201).json({ id: rows.insertId, nombre, telefono, correo, direccion, fecha_creacion, id_usuario });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al registrar el centro dental" });
  }
};

export const getCentros = async (req, res) => {
  try {
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, nombre, telefono, correo, direccion, fecha_creacion, BIN_TO_UUID(id_usuario)id_usuario FROM clinicas ORDER BY autoincremental DESC");
    // Formatear la lista de antes de enviarla como respuesta
    const centrosFormateados = rows.map(response => {
      const fecha_formateada = moment(response.fecha_creacion).format('DD/MM/YYYY HH:mm:ss');
      const centro_formateado = {
        id: response.id,
        nombre: response.nombre,
        telefono: response.telefono,
        correo: response.correo,
        direccion: response.direccion,
        fecha_creacion: fecha_formateada,
        id_usuario: response.id_usuario
      };
      return centro_formateado;
    });

    res.json(centrosFormateados);
    //res.json(rows);
  } catch (error) {
    //console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener los centros" });
  }
};

export const getCentro = async (req, res) => {
    try {
      const { id } = req.params;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      const [rows] = await pool.query(`
        SELECT 
          BIN_TO_UUID(id) id, 
          nombre, 
          telefono, 
          correo, 
          direccion, 
          DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion, 
          id_usuario 
        FROM clinicas 
        WHERE BIN_TO_UUID(id) = ?`
        ,[id,
      ]);
  
      if (rows.length <= 0) {
        console.log("Centro no encontrado")
        return res.status(404).json({ message: "Centro no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      //console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el centro dental" });
    }
};

export const updateCentro = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, telefono, correo, direccion } = req.body;
  
      const [result] = await pool.query(
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        "UPDATE clinicas SET nombre = IFNULL(?, nombre), telefono = IFNULL(?, telefono), correo = IFNULL(?, correo), direccion = IFNULL(?, direccion) WHERE BIN_TO_UUID(id) = ?",[nombre, telefono, correo, direccion, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Centro no encontrado" });
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, nombre, telefono, correo, direccion, fecha_creacion, id_usuario FROM clinicas WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      res.json(rows[0]);
    } catch (error) {
      //console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la información del centro dental" });
    }
};

export const deleteCentro = async (req, res) => {
    try {
      const { id } = req.params;
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      const [rows] = await pool.query("DELETE FROM clinicas WHERE id = uuid_to_bin(?)", [id]);
  
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Centro no encontrado" });
      }
  
      //res.sendStatus(204);
      //res.sendStatus(200);
      res.json({"status":"Id:"+ id +" - Centro eliminado"});
    } catch (error) {
      //console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar el centro dental" });
    }
};

export const getCentroByIdUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    const [rows] = await pool.query(`
    SELECT 
      BIN_TO_UUID(id) id, 
      nombre, 
      telefono, 
      correo, 
      direccion, 
      DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i:%s') as fecha_creacion,
      id_usuario 
    FROM clinicas 
    WHERE BIN_TO_UUID(id_usuario) = ?`
    ,[id_usuario,
    ]);

    if (rows.length <= 0) {
      console.log("Centro no encontrado (por id_usuario)")
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
    //console.log(error)
    return res.status(500).json({ message: "Ocurrió un error al obtener el centro (por id_usuario)" });
  }
};


  