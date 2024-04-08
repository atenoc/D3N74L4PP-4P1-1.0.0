import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
  getUser,
  createUser,
  updateUser,
  updateUserRegister,
  deleteUser,
  getUsersPaginationByIdUser,
  getUsersPaginationByIdClinica,
} from "../controllers/users.controller.js";

const router = Router();
const path = "/usuarios"

// POST One
router.post(path, verificarToken, createUser);

// GET All
router.get(path+"/:id", verificarToken, getUser);

// PATCH One
router.patch(path+"/:id", verificarToken, updateUser);
router.patch(path+"/usuario/:id/registro", verificarToken, updateUserRegister);

// DELETE One
router.delete(path+"/:id", verificarToken, deleteUser);

// GET One By
router.get(path+"/paginacion/usuario/:id", verificarToken, getUsersPaginationByIdUser);
router.get(path+"/paginacion/clinica/:id_clinica", verificarToken, getUsersPaginationByIdClinica);

export default router;