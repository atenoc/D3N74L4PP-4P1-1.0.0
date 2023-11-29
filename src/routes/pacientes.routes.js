import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createPaciente,
  getPacientesPaginationByIdClinica,
  getPacientesBuscadorByIdClinica,
  updatePaciente

} from "../controllers/pacientes.controller.js";

const router = Router();
const path = "/pacientes"

// POST One
router.post(path, verificarToken, createPaciente);
router.post(path + "/buscador/:id_clinica", verificarToken, getPacientesBuscadorByIdClinica);

router.patch(path+"/:id", verificarToken, updatePaciente);

router.get(path+"/paginacion/pacientes/:id_clinica", verificarToken, getPacientesPaginationByIdClinica);

export default router;