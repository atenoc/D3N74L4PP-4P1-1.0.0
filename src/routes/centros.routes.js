import { Router } from "express";
import {
  getCentro,
  getCentros,
  createCentro,
  updateCentro,
  deleteCentro
} from "../controllers/centros.controller.js";

const router = Router();
const path = "/centros"

// INSERT
router.post(path, createCentro);

// GET All
router.get(path, getCentros);

// GET One
router.get(path+"/:id", getCentro);

// PATCH 
router.patch(path+"/:id", updateCentro);

// DELETE
router.delete(path+"/:id", deleteCentro);


export default router;