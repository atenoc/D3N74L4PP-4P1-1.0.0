import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

  getRoles,
  getTitulos,
  getEspecialidades,
  getSexo

} from "../controllers/catalogos.controller.js";

const router = Router();

router.get("/roles", verificarToken, getRoles);
router.get("/titulos", verificarToken, getTitulos);
router.get("/especialidades", verificarToken, getEspecialidades);
router.get("/sexo", verificarToken, getSexo);

export default router;
