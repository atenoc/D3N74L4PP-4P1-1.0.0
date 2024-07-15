import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {

    validarPlaGratuito,

  } from "../controllers/planes.controller.js";

  const router = Router();
  const path = "/planes"

  router.get(path+"/validar/plan/usuario/:id/fecha/:fecha", verificarToken, validarPlaGratuito);

  export default router;