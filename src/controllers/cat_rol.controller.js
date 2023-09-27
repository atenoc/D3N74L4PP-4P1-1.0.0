import { pool } from "../db.js";

export const createRol = async (req, res) => {
    try {
      const { descripcion } = req.body;
      const [result] = await pool.query(
        "INSERT INTO cat_roles (id, descripcion) VALUES (UUID_TO_BIN(UUID()), ?)",
        [descripcion]
      );
      if (result.affectedRows === 1) {
        console.log("Rol registrado")
      }
  
      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM cat_roles WHERE descripcion = ?", [descripcion]);
  
      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID rol insertado" });
      }
  
      const { id } = idResult[0];
      res.status(201).json({ id, descripcion});

    } catch (error) {
      console.log("createRol:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al registrar el rol" });
    }
};

export const getRoles = async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_roles ORDER BY autoincremental DESC");
      res.json(rows);
    } catch (error) {
      console.log("getRoles:: "+ error)
      return res.status(500).json({ message: "Ocurrió un error al obtener los roles" });
    }
};

export const getRol = async (req, res) => {
    try {
      const { id } = req.params;
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_roles WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Rol no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.log("getRol:: " +error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el rol" });
    }
};

export const updateRol = async (req, res) => {
    try {
      const { id } = req.params;
      const { descripcion } = req.body;
  
      const [result] = await pool.query(
        "UPDATE cat_roles SET descripcion = IFNULL(?, descripcion) WHERE BIN_TO_UUID(id) = ?",
        [descripcion, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Rol no encontrado" });
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_roles WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      res.json(rows[0]);
    } catch (error) {
      console.log("updateRol:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar el rol" });
    }
};

export const deleteRol = async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query("DELETE FROM cat_roles WHERE id = uuid_to_bin(?)", [id]);
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Rol no encontrado" });
      }

      res.json({id});
    } catch (error) {
      console.log("deleteRol:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar el rol" });
    }
};