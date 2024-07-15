import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createEvento,
  createCita,
  getCitas,
  getCitaById,
  updateCita,
  deleteCita,
  getCitasByIdPaciente

} from "../controllers/citas.controllers.js";

const router = Router();
const path = "/citas"

router.post(path+"/evento", verificarToken, createEvento);
router.post(path, verificarToken, createCita);
router.get(path+"/clinica/:id_clinica", verificarToken, getCitas);
router.get(path+"/:id", verificarToken, getCitaById);

router.patch(path+"/:id", verificarToken, updateCita);

// DELETE One
router.delete(path+"/:id", verificarToken, deleteCita);

router.get(path+"/paciente/:id_paciente", verificarToken, getCitasByIdPaciente);

export default router;