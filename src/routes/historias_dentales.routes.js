import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
    createHistoriaDental,
    getHistoriaDentalByIdPaciente,
    updateHistoriaDental

} from "../controllers/historia_dental.controller.js";

const router = Router();
const path = "/historias"

router.post(path, verificarToken, createHistoriaDental);
router.get(path+"/paciente/:id", verificarToken, getHistoriaDentalByIdPaciente);
router.patch(path+"/:id", verificarToken, updateHistoriaDental);

export default router;