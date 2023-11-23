import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createCita,
  getCitas

} from "../controllers/citas.controllers.js";

const router = Router();
const path = "/citas"

router.post(path, verificarToken, createCita);
router.get(path, verificarToken, getCitas);

export default router;