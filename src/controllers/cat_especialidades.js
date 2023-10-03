import { pool } from "../db.js";

export const createEspecialidad = async (req, res) => {
    try {
      const { descripcion } = req.body;
      const [result] = await pool.query(
        "INSERT INTO cat_especialidades (id, descripcion) VALUES (UUID_TO_BIN(UUID()), ?)",
        [descripcion]
      );
      if (result.affectedRows === 1) {
        console.log("Especialidad registrada")
      }
  
      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM cat_especialidades WHERE descripcion = ?", [descripcion]);
  
      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID Especialidad insertada" });
      }
  
      const { id } = idResult[0];
      res.status(201).json({ id, descripcion});

    } catch (error) {
      console.log("createEspecialidad:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al registrar la Especialidad" });
    }
};

export const getEspecialidades = async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_especialidades ORDER BY autoincremental DESC");
      res.json(rows);
    } catch (error) {
      console.log("getEspecialidades:: "+ error)
      return res.status(500).json({ message: "Ocurrió un error al obtener las Especialidades" });
    }
};

export const getEspecialidad = async (req, res) => {
    try {
      const { id } = req.params;
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_especialidades WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Especialidad no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.log("getEspecialidad:: " +error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el Especialidad" });
    }
};

export const updateEspecialidad = async (req, res) => {
    try {
      const { id } = req.params;
      const { descripcion } = req.body;
  
      const [result] = await pool.query(
        "UPDATE cat_especialidades SET descripcion = IFNULL(?, descripcion) WHERE BIN_TO_UUID(id) = ?",
        [descripcion, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Especialidad no encontrado" });
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, descripcion FROM cat_especialidades WHERE BIN_TO_UUID(id) = ?", [
        id,
      ]);
  
      res.json(rows[0]);
    } catch (error) {
      console.log("updateEspecialidad:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la Especialidad" });
    }
};

export const deleteEspecialidad = async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.query("DELETE FROM cat_especialidades WHERE id = uuid_to_bin(?)", [id]);
      if (rows.affectedRows <= 0) {
        return res.status(404).json({ message: "Especialidad no encontrada" });
      }

      res.json({id});
    } catch (error) {
      console.log("deleteEspecialidad:: " + error)
      return res.status(500).json({ message: "Ocurrió un error al eliminar la Especialidad" });
    }
};