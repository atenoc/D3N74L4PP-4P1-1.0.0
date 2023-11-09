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

export const getRestringido = async (req, res) => {
    // POSTMAN: Validar token en la cabecera -> Authorization = Bearer + token
    return res.json({status: 'Acceso a ruta protegida :D' })
}
