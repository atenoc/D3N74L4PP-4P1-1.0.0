import { Router } from "express";
import {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUsersByUser
} from "../controllers/users.controller.js";

const router = Router();

// INSERT An User
router.post("/usuarios", createUser);

// GET all Users
router.get("/usuarios", getUsers);

// GET An User
router.get("/usuarios/:id", getUser);

// PATCH an User
router.patch("/usuarios/:id", updateUser);

// DELETE An User
router.delete("/usuarios/:id", deleteUser);

// GET Users By An User
router.get("/usuarios/usuario/:id", getUsersByUser);

export default router;