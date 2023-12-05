import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  getUsersMedicos,
  
} from "../controllers/medicos.controller.js";

const router = Router();
const path = "/medicos"

// GET All
router.get(path + "/id_clinica/:id_clinica", verificarToken, getUsersMedicos);

export default router;