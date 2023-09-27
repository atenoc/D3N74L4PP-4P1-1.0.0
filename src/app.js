import express from "express";
import morgan from "morgan";
import cors from "cors";

import indexRoutes from "./routes/index.routes.js";
import seguridadRoutes from "./routes/seguridad.routes.js";
import usersRoutes from "./routes/users.routes.js";
import centrosRoutes from "./routes/centros.routes.js";
import catRolRoutes from "./routes/cat_rol.routes.js";
import catTitulosRoutes from "./routes/cat_titulos.routes.js";
import catEspecialidadesRoutes from "./routes/cat_especialidades.routes.js";

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended:false })) // entender informacion recibida de un formulario html
app.use(cors()) //

// Routes
app.use("/", indexRoutes);
app.use("/api", seguridadRoutes);
app.use("/api", usersRoutes);
app.use("/api", centrosRoutes);
app.use("/api", catRolRoutes);
app.use("/api", catTitulosRoutes);
app.use("/api", catEspecialidadesRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "End point no encontrado" });
});

export default app;
