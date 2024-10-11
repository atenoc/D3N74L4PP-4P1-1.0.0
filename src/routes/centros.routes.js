import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
  getCentro,
  getCentros,
  createCentro,
  updateCentro,
  deleteCentro,
  getCentroByIdUserSuAdmin
} from "../controllers/centros.controller.js";

const router = Router();
const path = "/centros"

// POST One
router.post(path, verificarToken, createCentro);

// GET All
router.get(path, verificarToken, getCentros);

// GET One
router.get(path+"/:id", verificarToken, getCentro);

// PATCH One
router.patch(path+"/:id", verificarToken, updateCentro);

// DELETE One
router.put(path+"/:id", verificarToken, deleteCentro);

// GET One By
router.get(path+"/usuario/:id_usuario", verificarToken, getCentroByIdUserSuAdmin);


export default router;