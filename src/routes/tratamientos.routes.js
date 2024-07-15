import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
    createTratamiento,
    getTratamientosByIdPaciente,
    getTratamiento,
    updateTratamiento,
    deleteTratamiento
} from "../controllers/tratamientos.controller.js";

const router = Router();
const path = "/tratamientos"

router.post(path, verificarToken, createTratamiento);
router.get(path+"/paciente/:id", verificarToken, getTratamientosByIdPaciente);
router.get(path+"/:id", verificarToken, getTratamiento);
router.patch(path+"/:id", verificarToken, updateTratamiento);
router.delete(path+"/:id", verificarToken, deleteTratamiento);

export default router;