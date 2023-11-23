import { pool } from "../db.js";

export const createPaciente = async (req, res) => {
    try {
        console.log("Paciente::")
      console.log(req.body)
      const { nombre, apellidop, apellidom, edad, id_usuario, id_clinica, fecha_creacion} = req.body;
  
      // insertar el nuevo registro
      const [result] = await pool.execute(`
        INSERT INTO pacientes (id, nombre, apellidop, apellidom, edad, id_usuario, id_clinica, fecha_creacion) 
        VALUES (UUID_TO_BIN(UUID()),?,?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
        [nombre, apellidop, apellidom, edad, id_usuario, id_clinica, fecha_creacion]
      );
  
      if (result.affectedRows === 1) {
        console.log("Paciente registrado")
      }
  
      const [idResult] = await pool.execute("SELECT BIN_TO_UUID(id) as id FROM pacientes WHERE nombre = ? AND apellidop = ? AND BIN_TO_UUID(id_usuario) = ? AND BIN_TO_UUID(id_clinica) = ? AND fecha_creacion = ?", [nombre, apellidop, id_usuario, id_clinica, fecha_creacion]);
      if (!idResult.length) {
        return res.status(500).json({ message: "No se encontró el ID del paciente insertado" });
      }
      const { id } = idResult[0];
  
      res.status(201).json({ id, nombre, apellidop, apellidom, edad, id_usuario, id_clinica, fecha_creacion });
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al registrar el paciente" });
    }
  };