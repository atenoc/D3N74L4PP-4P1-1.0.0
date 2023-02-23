import jwt from "jsonwebtoken";

export function verificarToken(req, res, next){
    if (!req.headers.authorization){
        return res.status(401).send('Peticion no autorizada')    
    }
    //console.log(req.headers.authorization)

    const token = req.headers.authorization.split(' ')[1]
    if(token === null){
        return res.status(401).send('Peticion no autorizada') 
    }

    const payload = jwt.verify(token, 'secretkey')
    //console.log("payload id: " +payload._id + " | payload iat:" + payload.iat)

    req.userId = payload._id;
    next()
}


