import { pool } from "../db.js";

export const createTitulo = async (req, res) => {
    try {
      const { descripcion } = req.body;
      const [result] = await pool.query(
        "INSERT INTO cat_titulos (id, descripcion) VALUES (UUID_TO_BIN(UUID()), ?)",
        [descripcion]
      );
      if (result.affectedRows === 1) {
        console.log("Titulo registrado")
      }
  
      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM cat_titulos WHERE descripcion = ?", [descripcion]);
  
      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID titulo insertado" });
      }
  
      const { id } = idResult[0];
      res.status(201).json({ id, descripcion});

    } catch (error) {
      console.log("createTitulo:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al registrar el Titulo" });
    }
};

export const getTitulos = async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_titulos ORDER BY autoincremental DESC");
      res.json(rows);
    } catch (error) {
      console.log("getTitulos:: "+ error)
      return res.status(500).json({ message: "Ocurrió un error al obtener los Titulos" });
    }
};

export const getTitulo = async (req, res) => {
    try {
      const { id } = req.params;
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_titulos WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Titulo no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.log("getTitulo:: " +error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el Titulo" });
    }
};

export const updateTitulo = async (req, res) => {
    try {
      const { id } = req.params;
      const { descripcion } = req.body;
  
      const [result] = await pool.query(
        "UPDATE cat_titulos SET descripcion = IFNULL(?, descripcion) WHERE BIN_TO_UUID(id) = ?",
        [descripcion, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Titulo no encontrado" });
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_titulos WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      res.json(rows[0]);
    } catch (error) {
      console.log("updateTitulo:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar el Titulo" });
    }
};

export const deleteTitulo = async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query("DELETE FROM cat_titulos WHERE id = uuid_to_bin(?)", [id]);
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Titulo no encontrado" });
      }

      res.json({id});
    } catch (error) {
      console.log("deleteTitulo:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar el Titulo" });
    }
};