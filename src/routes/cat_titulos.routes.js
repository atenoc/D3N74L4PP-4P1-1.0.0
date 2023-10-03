import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
  createTitulo,
  getTitulos,
  getTitulo,
  updateTitulo,
  deleteTitulo
} from "../controllers/cat_titulos.controller.js";

const router = Router();
const path = "/titulos"

router.post(path, verificarToken, createTitulo);
router.get(path, verificarToken, getTitulos);
router.get(path+"/:id", verificarToken, getTitulo);
router.patch(path+"/:id", verificarToken, updateTitulo);
router.delete(path+"/:id", verificarToken, deleteTitulo);

export default router;