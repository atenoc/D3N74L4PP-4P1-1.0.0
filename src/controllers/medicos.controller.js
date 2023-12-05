import { pool } from "../db.js";

export const getUsersMedicos = async (req, res) => {
    const { id_clinica } = req.params;
    console.log("MEDICO id_clinica:: "+id_clinica)
    try {
      const [rows] = await pool.query(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY u.autoincremental DESC) AS contador,
        BIN_TO_UUID(u.id) AS id, 
        t.titulo, 
        u.nombre, 
        u.apellidop, 
        u.apellidom, 
        e.especialidad,  
        u.telefono
      FROM usuarios u
      LEFT JOIN cat_roles r ON u.id_rol = r.id
      LEFT JOIN cat_titulos t ON u.id_titulo = t.id
      LEFT JOIN cat_especialidades e ON u.id_especialidad = e.id 
      WHERE BIN_TO_UUID(u.id_clinica) = ?
      AND r.rol = 'medic' 
      ORDER BY u.autoincremental DESC
      `, [id_clinica]);
  
      res.json(rows);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener los usuarios médicos" });
    }
};