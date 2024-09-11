import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
    getAccesoByIdUsuario
} from "../controllers/auditoria.controller.js";

const router = Router();
const path = "/auditoria/acceso"

router.get(path+"/:id", verificarToken, getAccesoByIdUsuario);

export default router;