import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
    createSeguimiento,
    getSeguimientosByIdPaciente,
    getSeguimiento,
    updateSeguimiento,
    deleteSeguimiento
} from "../controllers/seguimientos.controller.js";

const router = Router();
const path = "/seguimientos"

router.post(path, verificarToken, createSeguimiento);
router.get(path+"/paciente/:id", verificarToken, getSeguimientosByIdPaciente);
router.get(path+"/:id", verificarToken, getSeguimiento);
router.patch(path+"/:id", verificarToken, updateSeguimiento);
router.delete(path+"/:id", verificarToken, deleteSeguimiento);

export default router;