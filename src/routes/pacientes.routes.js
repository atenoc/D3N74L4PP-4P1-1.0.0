import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createPaciente,
  getPacientesPaginationByIdClinica

} from "../controllers/pacientes.controller.js";

const router = Router();
const path = "/pacientes"

// POST One
router.post(path, verificarToken, createPaciente);

router.get(path+"/paginacion/pacientes/:id_clinica", verificarToken, getPacientesPaginationByIdClinica);

export default router;