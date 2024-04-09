import { pool } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getDecryptedPassword } from "../utils/encriptacion.js";

export const login = async (req, res) => {
    try {
        console.log(">>>>>>>>>> >>>>>>>>>> Logueando, recibiendo datos... <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<<")
        //console.log(req.body)

        const { correo, llave } =  req.body
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, id_rol, fecha_creacion FROM usuarios WHERE correo = ? ", [correo]);

        if (rows.length <= 0) {
            console.log("Usuario no encontrado | seguridad controller")
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (rows.length === 1){

            console.log("Llave encript: "+llave)
            const desLlave = getDecryptedPassword(llave);
            console.log("Llave real: "+desLlave)

            const user = rows[0];
            const match = await bcrypt.compare(desLlave, user.llave);

            if(match){
                console.log("Id logueado: "+rows[0].id)
                const token = jwt.sign({_id: rows[0].id}, 'secretkey')
                res.status(200).json({token}) 
            }else{
                console.log("Contraseña incorrecta")
                return res.status(404).json({ message: "Contraseña incorrecta" });
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (login)" });
    }
}

/*export const getRestringido = async (req, res) => {
    // POSTMAN: Validar token en la cabecera -> Authorization = Bearer + token
    return res.json({status: 'Acceso a ruta protegida :D' })
}*/

// getUsuarioByCorreo // After Login 2
export const getUserByCorreo = async (req, res) => {
    console.log("INICIANDO................................................................................................. ")
    try {
      //console.log(req.body)
      const {correo } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) id,
        BIN_TO_UUID(id_rol) id_rol,
        nombre,
        apellidop,
        (SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS rol,
        BIN_TO_UUID(id_clinica) id_clinica,
        id_plan
      FROM usuarios 
      WHERE correo = ?
      `, [correo]);

      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado (por correo)" });
      }
      console.log(rows)
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (por correo)" });
    }
};


// validarUsuarioActivo - id usuario / correo // After Login 3
export const getUserByIdUserAndCorreo = async (req, res) => {
    try {
      console.log("After Login 2 ***********************************************************************************************");
      //console.log(req.body)
      const {id, correo } = req.params;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) id,
        correo,
        (SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS rol,
        nombre,
        apellidop 
      FROM usuarios 
      WHERE BIN_TO_UUID(id) = ?
      AND correo = ?
      `, [id, correo]);

      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado (por id/correo)" });
      }

      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (por id/correo)" });
    }
};


// Obtener usuario por id
export const getPassByIdUser = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
        const [rows] = await pool.query(`
        SELECT 
          BIN_TO_UUID(id) id, 
          llave
        FROM usuarios 
        WHERE BIN_TO_UUID(id) = ?`
        ,[id]);
  
      if (rows.length <= 0) {
        return res.status(404).json({ message: "Usuario no encontrado - pass" });
      }
  
      const desLlave = getDecryptedPassword(rows[0].llave);
      console.log("Llave real Get Pass: "+desLlave)
  
      console.log(rows[0])
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario - pass" });
    }
};

// actualizar contraseña
export const updateUserPassword = async (req, res) => {
    try {
      //console.log(req.body)
      const { id } = req.params;
      const { llave } = req.body;
      const llave_status=1
  
      const hashedPassword = await bcrypt.hash(llave, 10); // 10: número de rondas de hashing
      console.log("hashedPassword:: "+ hashedPassword)
  
      const [result] = await pool.query(
        "UPDATE usuarios SET llave = IFNULL(?, llave), llave_status = IFNULL(?, llave_status) WHERE BIN_TO_UUID(id) = ?",
        [hashedPassword, llave_status, id]
      );
  
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });
      
      const [rows] = await pool.query("SELECT BIN_TO_UUID(id)id, correo FROM usuarios WHERE BIN_TO_UUID(id) = ?",[id]);
  
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al actualizar la contraseña" });
    }
};
