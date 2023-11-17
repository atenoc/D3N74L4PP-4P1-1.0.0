import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  createCita,

} from "../controllers/citas.controllers.js";

const router = Router();
const path = "/citas"

router.post(path, verificarToken, createCita);

export default router;