import express from "express";
import morgan from "morgan";
import cors from "cors";

import indexRoutes from "./routes/index.routes.js";
import seguridadRoutes from "./routes/seguridad.routes.js";
import usersRoutes from "./routes/users.routes.js";
import centrosRoutes from "./routes/centros.routes.js";
import catCatalogosRoutes from "./routes/catalogos.routes.js";
import medicosRoutes from "./routes/medicos.routes.js";
import pacientesRoutes from "./routes/pacientes.routes.js";
import citasRoutes from "./routes/citas.routes.js";
import historiasRoutes from "./routes/historias_dentales.routes.js";
import diagnosticosRoutes from "./routes/diagnosticos.routes.js";
import tratamientosRoutes from "./routes/tratamientos.routes.js";
import planesRoutes from "./routes/planes.routes.js";

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
app.use("/api", catCatalogosRoutes);
app.use("/api", medicosRoutes);
app.use("/api", pacientesRoutes);
app.use("/api", citasRoutes);
app.use("/api", historiasRoutes);
app.use("/api", historiasRoutes);
app.use("/api", diagnosticosRoutes);
app.use("/api", tratamientosRoutes);
app.use("/api", planesRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "End point no encontrado" });
});

export default app;
