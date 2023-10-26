import { pool } from "../db.js";

export const getRoles = async (req, res) => {
    const id_us = req.query.id_us; 
    console.log("id_usuario: "+id_us)
    
    try {
      const [roles] = await pool.execute("SELECT BIN_TO_UUID(id_rol)id_rol FROM usuarios WHERE BIN_TO_UUID(id) = ?", [id_us]);
      console.log("id Rol: "+roles[0].id_rol)
      var id_rol = roles[0].id_rol

      const [desc] = await pool.execute("SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = ?", [id_rol]);
      console.log("Desc Rol: "+ desc[0].rol)
      var descRol = desc[0].rol

      let rows; 

      if (descRol == "admin") {
        const [adminRows] = await pool.query("SELECT BIN_TO_UUID(id) id, rol, descripcion FROM cat_roles WHERE rol != 'sop' ORDER BY autoincremental");
        rows = adminRows;
      } else if ((descRol == "sop")){
        const [userRows] = await pool.query("SELECT BIN_TO_UUID(id) id, rol, descripcion FROM cat_roles ORDER BY autoincremental");
        rows = userRows;
      }

      res.json(rows);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener los roles" });
    }
};

export const getTitulos = async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, titulo, descripcion FROM cat_titulos ORDER BY autoincremental");
      res.json(rows);
    } catch (error) {
      console.log("getTitulos:: "+ error)
      return res.status(500).json({ message: "Ocurrió un error al obtener los Titulos" });
    }
};

export const getEspecialidades = async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT id, especialidad FROM cat_especialidades ORDER BY autoincremental");
      res.json(rows);
    } catch (error) {
      console.log("getEspecialidades:: "+ error)
      return res.status(500).json({ message: "Ocurrió un error al obtener las Especialidades" });
    }
};