import { Router } from "express";

import { verificarToken } from "../controllers/verificarToken.js";
import { login, getRestringido, userByCorreo } from "../controllers/seguridad.controller.js";

const router = Router();

//router.post('/registro', createRegistro)
router.post('/login', login)
router.get('/userbycorreo/:correo', userByCorreo)
router.get('/restringido', verificarToken, getRestringido)

export default router;
