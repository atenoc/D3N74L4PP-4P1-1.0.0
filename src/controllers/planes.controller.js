import { pool } from "../db.js";

export const validarPlaGratuito = async (req, res) => {

    try {
        const { id, fecha } = req.params;
        const fecha_hoy = new Date(fecha);

        const [rows] = await pool.query(`
        SELECT fecha_creacion FROM clinicas WHERE BIN_TO_UUID(id) = ? AND id_plan = '0401PF30' `,[id]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Clinica no encontrada (para validar plan)" });
        }

        const fecha_creacion = new Date(rows[0].fecha_creacion);
        fecha_creacion.setHours(0,0,0,0);
        console.log("FECHA CREACION:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: "+fecha_creacion)
        console.log("FECHA HOY::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: "+fecha_hoy)
        const diferencia_ms = fecha_hoy.getTime() - fecha_creacion.getTime();
        let dias_de_diferencia = Math.floor(diferencia_ms / (1000 * 60 * 60 * 24));
        console.log("Días de diferencia ============================================ ", dias_de_diferencia);

        //dias_de_diferencia = 29
        if(dias_de_diferencia >= 30){
            //console.log("Actualizar Plan BD")
            const [result] = await pool.query( "UPDATE clinicas SET id_plan = '0402PF3T' WHERE BIN_TO_UUID(id) = ?",[id] );
            
            if (result.affectedRows === 0)
                return res.status(404).json({ message: "Clinica no encontrada (para actualizar plan)" });

            res.json(30);

        }else{
            //console.log("No hacer nada")
            res.json(dias_de_diferencia);
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Ocurrió al validar el plan" });
    }

};