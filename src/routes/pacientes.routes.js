import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createPaciente,
  getPacientesPaginationByIdClinica,
  getPacientesBuscadorByIdClinica,
  getPacienteById,
  updatePacienteCita,
  updatePaciente,
  deletePaciente

} from "../controllers/pacientes.controller.js";

const router = Router();
const path = "/pacientes"

// POST One
router.post(path, verificarToken, createPaciente);
router.get(path+"/:id", verificarToken, getPacienteById);
router.post(path + "/buscador/:id_clinica", verificarToken, getPacientesBuscadorByIdClinica);

router.patch(path+"/cita/:id", verificarToken, updatePacienteCita);
router.patch(path+"/:id", verificarToken, updatePaciente);

router.get(path+"/paginacion/pacientes/:id_clinica", verificarToken, getPacientesPaginationByIdClinica);

router.delete(path+"/:id", verificarToken, deletePaciente);

export default router;