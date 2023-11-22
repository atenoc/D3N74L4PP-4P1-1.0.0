import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createPaciente

} from "../controllers/pacientes.controller.js";

const router = Router();
const path = "/pacientes"

// POST One
router.post(path, verificarToken, createPaciente);

export default router;