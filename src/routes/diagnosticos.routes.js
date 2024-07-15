import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
    createDiagnostico,
    getDiagnosticosByIpPaciente,
    getDiagnostico,
    updateDiagnostico,
    deleteDiagnostico
} from "../controllers/diagnosticos.controller.js";

const router = Router();
const path = "/diagnosticos"

router.post(path, verificarToken, createDiagnostico);
router.get(path+"/paciente/:id", verificarToken, getDiagnosticosByIpPaciente);
router.get(path+"/:id", verificarToken, getDiagnostico);
router.patch(path+"/:id", verificarToken, updateDiagnostico);
router.delete(path+"/:id", verificarToken, deleteDiagnostico);

export default router;