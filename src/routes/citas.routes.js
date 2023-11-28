import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createCita,
  getCitas,
  getCitaById,
  deleteCita

} from "../controllers/citas.controllers.js";

const router = Router();
const path = "/citas"

router.post(path, verificarToken, createCita);
router.get(path, verificarToken, getCitas);
router.get(path+"/:id", verificarToken, getCitaById);

// DELETE One
router.delete(path+"/:id", verificarToken, deleteCita);

export default router;