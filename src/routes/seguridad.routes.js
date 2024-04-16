import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import { 
    login, 
    //getRestringido,
    getUserByCorreo,
    validarUsuarioActivo,
    getPassByIdUser,
    updateUserPassword
} from "../controllers/seguridad.controller.js";

const router = Router();
const path = "/seguridad"

// Obtener token - Login 1
router.post(path+'/login', login)

// getUserByCorreo - After Login 2
router.get(path+"/usuario/correo/:correo", verificarToken, getUserByCorreo) 

// verificar usuario activo - After Login 3 - Sidebar/Header/Footer
router.get(path+"/verificar/usuario/:id/correo/:correo/clinica/:id_clinica", verificarToken, validarUsuarioActivo) 

// old
//router.get(path+'/restringido', verificarToken, getRestringido)

router.get(path+"/:id/contrasena", verificarToken, getPassByIdUser);
router.patch(path+"/password/usuario/:id", verificarToken, updateUserPassword);

export default router;
