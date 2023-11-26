import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createCita,
  getCitas,
  deleteCita

} from "../controllers/citas.controllers.js";

const router = Router();
const path = "/citas"

router.post(path, verificarToken, createCita);
router.get(path, verificarToken, getCitas);

// DELETE One
router.delete(path+"/:id", verificarToken, deleteCita);

export default router;