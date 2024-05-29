import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
    createTratamiento,
    getTratamientosByIpPaciente,
    getTratamiento,
    updateTratamiento,
    deleteTratamiento
} from "../controllers/tratamientos.controller.js";

const router = Router();
const path = "/tratamientos"

router.post(path, verificarToken, createTratamiento);
router.get(path+"/paciente/:id", verificarToken, getTratamientosByIpPaciente);
router.get(path+"/:id", verificarToken, getTratamiento);
router.patch(path+"/:id", verificarToken, updateTratamiento);
router.delete(path+"/:id", verificarToken, deleteTratamiento);

export default router;