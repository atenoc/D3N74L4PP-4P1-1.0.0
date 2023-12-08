import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createEvento,
  createCita,
  getCitas,
  getCitaById,
  updateCita,
  deleteCita

} from "../controllers/citas.controllers.js";

const router = Router();
const path = "/citas"

router.post(path+"/evento", verificarToken, createEvento);
router.post(path, verificarToken, createCita);
router.get(path, verificarToken, getCitas);
router.get(path+"/:id", verificarToken, getCitaById);

router.patch(path+"/:id", verificarToken, updateCita);

// DELETE One
router.delete(path+"/:id", verificarToken, deleteCita);

export default router;