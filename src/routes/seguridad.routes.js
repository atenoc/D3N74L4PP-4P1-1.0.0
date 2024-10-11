import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import { 
    login, 
    //getRestringido,
    getUserByCorreo,
    validarUsuarioActivo,
    getPassByIdUser,
    updateUserPassword,
    generaSecreto,
    validarSecreto2FA
} from "../controllers/seguridad.controller.js";

const router = Router();
const path = "/seguridad"

// Obtener token - Login 1
router.post(path+'/login', login)

// getUserByCorreo - After Login 2
router.post(path+"/usuario/correo", getUserByCorreo) 
// verificar usuario activo - After Login 3 - Sidebar/Header/Footer
router.post(path+"/valida/usuario/activo", verificarToken, validarUsuarioActivo) 

// old
//router.get(path+'/restringido', verificarToken, getRestringido)

router.get(path+"/:id/contrasena", verificarToken, getPassByIdUser);
router.patch(path+"/password/usuario/:id", verificarToken, updateUserPassword);

router.put(path+"/genera-secreto/usuario/:id", verificarToken, generaSecreto);
router.post(path+"/validar-secreto", validarSecreto2FA) 

export default router;
