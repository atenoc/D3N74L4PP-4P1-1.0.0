import { pool } from "../db.js";
import jwt from "jsonwebtoken"

/*
export const createRegistro = async (req, res) => {
    try {
        const { nombre, email, pass } = req.body;
        const [rows] = await pool.query(
          "INSERT INTO users (nombre, email, pass) VALUES (?, ?, ?)",
          [nombre, email, pass]
        );
        //res.status(201).json({ id: rows.insertId, nombre, email, pass });
        const token = jwt.sign({_id: rows.insertId}, 'secretkey') // crear un token
        res.status(200).json({token}) //devolver el token al usuario 
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error al crear Usuario" });
    }
}*/

export const login = async (req, res) => {
    try {
        console.log("Logueando, recibiendo datos...")
        console.log(req.body)

        const { correo, llave } =  req.body
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ? AND llave = ?", [
            correo, llave
        ]);

        if (rows.length <= 0) {
            console.log("Usuario no encontrado | seguridad controller")
          return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (rows[0].correo == correo && rows[0].llave == llave){
            console.log("Id logueado: "+rows[0].id)
            const token = jwt.sign({_id: rows[0].id}, 'secretkey')
            res.status(200).json({token})                      
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error bd obtener Usuario | seguridad controller" });
    }
}

export const userByCorreo = async (req, res) => {
    try {
      const {correo } = req.params;
      console.log("Se recibe correo: " + correo)
      // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
      const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [
        correo,
      ]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado por correo" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      return res.status(500).json({ message: "Error bd obtener Usuario por correo" });
    }
  };

export const getRestringido = async (req, res) => {
    //Validar token en la cabecera -> Authorization = Bearer + token
    return res.json({status: 'Acceso a ruta protegida :D' })
}
