import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
  getUser,
  getUsers,
  getUsersPagination,
  createUser,
  updateUser,
  deleteUser,
  getUserByCorreo,
  getUserByIdUserAndCorreo,
  getUserById,
  getUsersByIdUser,
  updateUserPassword
  
} from "../controllers/users.controller.js";

const router = Router();
const path = "/usuarios"

// POST One
router.post(path, verificarToken, createUser);

// GET All
router.get(path, verificarToken, getUsers);
router.get(path+"/pagination", verificarToken, getUsersPagination);

// GET One
router.get(path+"/:id", verificarToken, getUser);

// PATCH One
router.patch(path+"/:id", verificarToken, updateUser);

// DELETE One
router.delete(path+"/:id", verificarToken, deleteUser);

// GET One By
router.get(path+"/usuarioxcorreo/:correo", verificarToken, getUserByCorreo)

// GET One By
router.get(path+"/usuario/:id/:correo", verificarToken, getUserByIdUserAndCorreo)

// GET One By
router.get(path+"/usuarioxid/:id", verificarToken, getUserById)

// GET All By
router.get(path+"/usuario/:id", verificarToken, getUsersByIdUser);

// PATCH One
router.patch(path+"/passwordusuario/:id", verificarToken, updateUserPassword);

export default router;