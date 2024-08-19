import { Router } from "express";
import { verificarToken } from "../controllers/verificarToken.js";
import {
    uploadFiles,

} from "../controllers/uploads.controller.js";

const router = Router();
const path = "/uploads"

router.post(path, verificarToken, uploadFiles);

export default router;