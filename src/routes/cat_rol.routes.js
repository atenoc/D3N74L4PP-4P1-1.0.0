import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
  createRol,
  getRoles,
  getRol,
  updateRol,
  deleteRol
} from "../controllers/cat_rol.controller.js";

const router = Router();
const path = "/roles"

// POST One
router.post(path, verificarToken, createRol);

// GET All
router.get(path, verificarToken, getRoles);

// GET One
router.get(path+"/:id", verificarToken, getRol);

// PATCH One
router.patch(path+"/:id", verificarToken, updateRol);

// DELETE One
router.delete(path+"/:id", verificarToken, deleteRol);

export default router;