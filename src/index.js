import app from "./app.js";
import { PORT } from "./config.js";
import { pool } from "./db.js";

app.listen(PORT);
console.log(`Server on port http://localhost:${PORT}`);

const [conn] = await pool.query('SELECT "DB Pong" as result');
console.log(conn[0])



