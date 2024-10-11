import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
    getAccesoByIdUsuario,
    getBitacoraByIdClinica
} from "../controllers/auditoria.controller.js";

const router = Router();
const path = "/auditoria"

router.get(path+"/acceso/:id", verificarToken, getAccesoByIdUsuario);
router.get(path+"/bitacora/:id_clinica", verificarToken, getBitacoraByIdClinica);

export default router;