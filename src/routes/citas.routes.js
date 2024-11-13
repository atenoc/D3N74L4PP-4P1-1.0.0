import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import { authMiddleware } from "../controllers/verificarToken.js";
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

router.post(path+"/evento", authMiddleware, createEvento);
router.post(path, authMiddleware, createCita);
router.get(path+"/clinica/:id_clinica", authMiddleware, getCitas);
router.get(path+"/:id", authMiddleware, getCitaById);

router.patch(path+"/:id", authMiddleware, updateCita);

// DELETE One
router.delete(path+"/:id", authMiddleware, deleteCita);

router.get(path+"/paciente/:id_paciente", authMiddleware, getCitasByIdPaciente);

export default router;