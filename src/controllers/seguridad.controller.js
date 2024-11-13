import { pool } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getDecryptedPassword } from "../utils/encriptacion.js";
import { registroAcceso } from "../controllers/auditoria.controller.js";
import speakeasy from "speakeasy";
import QRCode from 'qrcode';
import cookie from 'cookie';

const cookieOptions = {
  httpOnly: true, // La cookie no es accesible a JavaScript
  secure: process.env.NODE_ENV === 'production', // true si es producción, false si es local
  maxAge: 60 * 60 * 12, // 12 horas (media día)
  expires: new Date(Date.now() + 60 * 60 * 12 * 1000), // Expira en 12 horas (media día).
  path: '/', // La cookie es válida en todo el sitio
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' en producción, 'lax' en local
  // domain: 'tu-dominio.com' // Cambia esto a tu dominio (opcional)
};

//test
export const setCookie = (req, res) => {
  res.setHeader('Set-Cookie', cookie.serialize('testCookie', 'testValue', {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: true // Este valor debería ser aceptado
  }));
  res.status(200).json({ message: 'Cookie establecida' });
};

export const login = async (req, res) => {
    try {
        //console.log(">>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> Logueando <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<<")
        const { correo, llave, fecha } =  req.body
        const ipOrigen = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, correo, llave, id_rol, secreto FROM usuarios WHERE correo = ? ", [correo]);

        if (rows.length <= 0) {
            //console.log("Usuario no encontrado | seguridad controller")
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (rows.length === 1){
            const desLlave = getDecryptedPassword(llave);
            const user = rows[0];
            const match = await bcrypt.compare(desLlave, user.llave);

            if(match){
              
              if(rows[0].secreto){
                console.log("Este USUARIO tiene SECRETO")
                res.status(200).json({id_usuario:rows[0].id, secreto:true}) 
              }else{
                console.log("Id logueado: "+rows[0].id)
                registroAcceso(rows[0].id, ipOrigen, 'Exitoso', fecha)
                const token = jwt.sign({_id: rows[0].id}, 'secretkey')

                // Establecer la cookie con propiedades de seguridad
                res.setHeader('Set-Cookie', cookie.serialize('token', token, cookieOptions));

                res.status(200).json({token}) 
              }
            }else{
              registroAcceso(rows[0].id, ipOrigen, 'Fallido', fecha)
                console.log("Contraseña incorrecta")
                return res.status(404).json({ message: "Contraseña incorrecta" });
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (login)" });
    }
}

export const validarSecreto2FA = async (req, res) => {
  try {
      console.log(">>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> >>>>>>>>>> 2FA <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<< <<<<<<<<<<")

      const { correo, codigoIngresado } =  req.body
      console.log(req.body)
      const desCode = getDecryptedPassword(codigoIngresado);

      const [rows] = await pool.query("SELECT BIN_TO_UUID(id) id, secreto FROM usuarios WHERE correo = ? ", [correo]);

      if (rows.length <= 0) {
          //console.log("Usuario no encontrado | seguridad controller")
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (rows.length === 1){
        const userSecret = rows[0].secreto;

        console.log('Secreto:', userSecret);
        console.log('Código ingresado:', codigoIngresado);

        /*
        console.log('Código esperado:', speakeasy.totp({ secret: userSecret, encoding: 'base32' }));
        console.log('¿Es una cadena?', typeof userSecret === 'string');  
        const expectedCode = speakeasy.totp({
          secret: userSecret, // Debe ser una cadena
          encoding: 'base32'
        });
        console.log('Código esperado:', expectedCode);
        */

        const valid = speakeasy.totp.verify({
          secret: userSecret, // el secreto almacenado en la base de datos
          encoding: 'base32',
          token: codigoIngresado // el código que el usuario ingresó
        });

        if (valid) {
          console.log("Id logueado: "+rows[0].id)
          const token = jwt.sign({_id: rows[0].id}, 'secretkey')
          res.setHeader('Set-Cookie', cookie.serialize('token', token, cookieOptions));
          // Imprimir el token en la consola del servidor
          console.log('Token establecido en cookie:', token);

          console.log("COOKIE devuelta por 2FA")
          res.status(200).json({token}) 
        } else {
          //registroAcceso(rows[0].id, ipOrigen, 'Fallido', fecha)
          console.log("Código de verificación incorrecto")
          return res.status(400).json({ message: "Código de verificación incorrecto" });
        }
      }

  } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (login)" });
  }
}

export const logout = (req, res) => {
  console.log("Logout")
  res.setHeader('Set-Cookie', cookie.serialize('token', '', {
      httpOnly: true,
      maxAge: 0, // Establece la cookie para que expire inmediatamente
      path: '/',
  }));

  console.log("Logout exitoso")
  return res.status(200).json({ message: 'Logout exitoso' });
};

// getUsuarioByCorreo // After Login 2
export const getUserByCorreo = async (req, res) => {
    console.log("INICIANDO...................................................................................................................................................................... ")
    try {
      console.log("Valida Usuario Por Correo............")
      console.log(req.body)
      //const {correo } = req.params;
      const { correo } = req.body;
      console.log("Correo Login: " + correo)
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) id,
        BIN_TO_UUID(id_rol) id_rol,
        nombre,
        apellidop,
        (SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS rol,
        BIN_TO_UUID(id_clinica) id_clinica,
        (SELECT id_plan FROM clinicas WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_clinica)) AS id_plan
      FROM usuarios 
      WHERE correo = ?
      `, [correo]);

      if (rows.length <= 0) {
        console.log("Usuario N0 encontrado por correo")
        return res.status(404).json({ message: "Usuario no encontrado (por correo)" });
      }
      console.log(rows[0])
      res.json(rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Ocurrió un error al obtener el usuario (por correo)" });
    }
};


// validarUsuarioActivo - id usuario / correo // After Login 3
export const validarUsuarioActivo = async (req, res) => {
    try {
      console.log("Validando Usuario Activo ------------------------------------------------------------------------------------------------------------------------------------------");
      //console.log(req.body)
      const {id, correo, id_clinica } = req.body;
      const [rows] = await pool.query(`
      SELECT 
        BIN_TO_UUID(id) id,
        correo,
        (SELECT rol FROM cat_roles WHERE BIN_TO_UUID(id) = BIN_TO_UUID(id_rol)) AS rol,
        nombre,
        apellidop,
        llave_status, 
        (SELECT id_plan FROM clinicas WHERE BIN_TO_UUID(id) = ?) AS id_plan 
      FROM usuarios 
      WHERE BIN_TO_UUID(id) = ?
      AND correo = ?
      `, [id_clinica, id, correo]);

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

// Generar secreto
export const generaSecreto = async (req, res) => {
  try {
    console.log("Genera secreto");
    const { id } = req.params;
    
    const [usuario] = await pool.query(
      "SELECT correo FROM usuarios WHERE BIN_TO_UUID(id) = ?",
      [id]
    );

    if (usuario.length === 0) {
      console.log("Usuario no encontrado en generaSecreto");
      return res.status(404).json({ message: "Usuario no encontrado en generaSecreto" });
    }

    const correo = usuario[0].correo;
    const secret = speakeasy.generateSecret({
      length: 20,
    });

    // Construcción manual del URL
    const otpauthUrl = `otpauth://totp/DentalApp:${correo}?secret=${secret.base32}&issuer=DentalApp`;

    await pool.query(
      "UPDATE usuarios SET secreto = ? WHERE BIN_TO_UUID(id) = ?",
      [secret.base32, id]
    );

    console.log("Secreto generado correctamente");
    console.log(otpauthUrl); // Asegúrate de que esté bien formado

    // Generar el QR
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Devolver el QR como una imagen
    res.json({ qr: qrCodeDataUrl });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ocurrió un error al generar el secreto" });
  }
};