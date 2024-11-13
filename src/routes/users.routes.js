import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import { authMiddleware } from "../controllers/verificarToken.js";

import {
  getUser,
  getUsersOnlySop,
  createUser,
  updateUser,
  updateUserRegister,
  deleteUser,
  getUsersPaginationByIdUser,
  getUsersPaginationByIdClinica,
  getUsuariosMedicosBuscadorByIdClinica
} from "../controllers/users.controller.js";

const router = Router();
const path = "/usuarios"

// POST One
router.post(path, authMiddleware, createUser);
router.post(path + "/buscador/:id_clinica", authMiddleware, getUsuariosMedicosBuscadorByIdClinica);

// GET All
router.get(path+"/:id", authMiddleware, getUser);
router.get(path+"/roles/onlysop", authMiddleware, getUsersOnlySop);
// GET One By
router.get(path+"/paginacion/usuario/:id", authMiddleware, getUsersPaginationByIdUser);
router.get(path+"/paginacion/clinica/:id_clinica", authMiddleware, getUsersPaginationByIdClinica);

// PATCH One
router.patch(path+"/:id", authMiddleware, updateUser);
router.patch(path+"/usuario/:id/registro", authMiddleware, updateUserRegister);

// DELETE One
router.delete(path+"/:id", authMiddleware, deleteUser);

export default router;