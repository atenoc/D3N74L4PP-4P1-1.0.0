import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import { authMiddleware } from "../controllers/verificarToken.js";
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
router.post(path, authMiddleware, createCentro);

// GET All
router.get(path, authMiddleware, getCentros);


// GET One
router.get(path+"/:id", authMiddleware, getCentro);

// PATCH One
router.patch(path+"/:id", authMiddleware, updateCentro);

// DELETE One
router.put(path+"/:id", authMiddleware, deleteCentro);

// GET One By
router.get(path+"/usuario/:id_usuario", authMiddleware, getCentroByIdUserSuAdmin);

export default router;