import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import { login, getRestringido } from "../controllers/seguridad.controller.js";

const router = Router();

router.post('/seguridad/login', login)
router.get('/seguridad/restringido', verificarToken, getRestringido)

export default router;
