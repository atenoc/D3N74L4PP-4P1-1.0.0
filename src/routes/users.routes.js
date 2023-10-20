import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
  getUser,
  getUsers,
  //getUsersPagination,
  createUser,
  updateUser,
  updateUserRegister,
  deleteUser,
  getUserByCorreo,
  getUserByIdUserAndCorreo,
  getUsersPaginationByIdUser,
  updateUserPassword
  
} from "../controllers/users.controller.js";

const router = Router();
const path = "/usuarios"

// POST One
router.post(path, verificarToken, createUser);

// GET All
router.get(path, verificarToken, getUsers);
router.get(path+"/:id", verificarToken, getUser);

// PATCH One
router.patch(path+"/:id", verificarToken, updateUser);
router.patch(path+"/usuario/:id", verificarToken, updateUserRegister);

// DELETE One
router.delete(path+"/:id", verificarToken, deleteUser);

// GET One By
router.get(path+"/usuario/correo/:correo", verificarToken, getUserByCorreo) // After Login
router.get(path+"/usuario/:id/correo/:correo", verificarToken, getUserByIdUserAndCorreo) // After Login 2
router.get(path+"/paginacion/usuario/:id", verificarToken, getUsersPaginationByIdUser);

// PATCH One
router.patch(path+"/password/usuario/:id", verificarToken, updateUserPassword);


export default router;