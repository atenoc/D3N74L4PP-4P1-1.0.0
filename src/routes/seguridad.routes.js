import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import { authMiddleware } from "../controllers/verificarToken.js";
import { 
    login, 
    logout,
    //getRestringido,
    getUserByCorreo,
    validarUsuarioActivo,
    getPassByIdUser,
    updateUserPassword,
    generaSecreto,
    validarSecreto2FA,
    setCookie
} from "../controllers/seguridad.controller.js";

const router = Router();
const path = "/seguridad"

// Obtener token - Login 1
router.post(path+'/login', login)
router.post(path+'/logout', logout);

// getUserByCorreo - After Login 2
router.post(path+"/usuario/correo", authMiddleware, getUserByCorreo) 

// verificar usuario activo - After Login 3 - Sidebar/Header/Footer
router.post(path+"/valida/usuario/activo", authMiddleware, validarUsuarioActivo) 

// old
//router.get(path+'/restringido', verificarToken, getRestringido)

router.get(path+"/:id/contrasena", authMiddleware, getPassByIdUser);
router.patch(path+"/password/usuario/:id", authMiddleware, updateUserPassword);

router.put(path+"/genera-secreto/usuario/:id", authMiddleware, generaSecreto);
router.post(path+"/validar-secreto", validarSecreto2FA) 

//test
router.get(path+"/set-cookie", setCookie);

export default router;
