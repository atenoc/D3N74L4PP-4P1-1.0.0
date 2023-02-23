import { Router } from "express";
import {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/users.controller.js";

const router = Router();

// INSERT An Employee
router.post("/usuarios", createUser);

// GET all Users
router.get("/usuarios", getUsers);

// GET An User
router.get("/usuarios/:id", getUser);

// PATCH an User
router.patch("/usuarios/:id", updateUser);

// DELETE An Employee
router.delete("/usuarios/:id", deleteUser);


export default router;