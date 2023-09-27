import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
  createEspecialidad,
  getEspecialidades,
  getEspecialidad,
  updateEspecialidad,
  deleteEspecialidad
} from "../controllers/cat_especialidades.js";

const router = Router();
const path = "/especialidades"

router.post(path, verificarToken, createEspecialidad);
router.get(path, verificarToken, getEspecialidades);
router.get(path+"/:id", verificarToken, getEspecialidad);
router.patch(path+"/:id", verificarToken, updateEspecialidad);
router.delete(path+"/:id", verificarToken, deleteEspecialidad);

export default router;