import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import { authMiddleware } from "../controllers/verificarToken.js";
import {

  getRoles,
  getTitulos,
  getEspecialidades,
  getSexo

} from "../controllers/catalogos.controller.js";

const router = Router();

router.get("/roles", authMiddleware, getRoles);
router.get("/titulos", authMiddleware, getTitulos);
router.get("/especialidades", authMiddleware, getEspecialidades);
router.get("/sexo", authMiddleware, getSexo);

export default router;
