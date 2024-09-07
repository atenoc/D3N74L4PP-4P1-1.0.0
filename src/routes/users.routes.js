import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
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
router.post(path, verificarToken, createUser);
router.post(path + "/buscador/:id_clinica", verificarToken, getUsuariosMedicosBuscadorByIdClinica);

// GET All
router.get(path+"/:id", verificarToken, getUser);
router.get(path+"/roles/onlysop", verificarToken, getUsersOnlySop);
// GET One By
router.get(path+"/paginacion/usuario/:id", verificarToken, getUsersPaginationByIdUser);
router.get(path+"/paginacion/clinica/:id_clinica", verificarToken, getUsersPaginationByIdClinica);

// PATCH One
router.patch(path+"/:id", verificarToken, updateUser);
router.patch(path+"/usuario/:id/registro", verificarToken, updateUserRegister);

// DELETE One
router.put(path+"/:id", verificarToken, deleteUser);

export default router;