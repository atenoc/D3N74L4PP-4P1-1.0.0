import cookie from 'cookie';
import jwt from "jsonwebtoken";

export function verificarToken(req, res, next){
    if (!req.headers.authorization){
        console.log("Petición N0 autorizada 1")
        return res.status(401).send('Peticion no autorizada')    
    }
    
    console.log("VALIDA TOKEN")
    console.log(req.headers.authorization)

    const token = req.headers.authorization.split(' ')[1]
    if(token === null){
        console.log("Petición N0 autorizada 2")
        return res.status(401).send('Peticion no autorizada') 
    }

    const payload = jwt.verify(token, 'secretkey')
    //console.log("payload id: " +payload._id + " | payload iat:" + payload.iat)

    req.userId = payload._id;
    next()
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<------------------------TOKEN VALIDO")
}

export function authMiddleware(req, res, next) {

    //console.log("------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>  authMiddleware")
    // Parsear las cookies del encabezado
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token; // Nombre de tu cookie
    //console.log("token:: "+token)

    // Verificar si el token está presente
    if (!token) {
        console.log("Petición N0 Autorizada");
        return res.status(401).send('Petición no autorizada');
    }

    //console.log("VALIDA TOKEN");
    //console.log(token);

    try {
        // Validar el token
        const payload = jwt.verify(token, 'secretkey');
        req.userId = payload._id; // Almacenar el ID del usuario en la solicitud
        next(); // Continuar al siguiente middleware o ruta
    } catch (error) {
        console.log("Token N0 VALID0")
        return res.status(401).send('Token N0 válido');
    }
}