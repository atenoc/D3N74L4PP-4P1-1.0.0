import cloudinary from '../cloudinary-config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pool } from "../db.js";
import fs from 'fs';

import { 
  registroAuditoria, 
  getUsuarioCreadorRegistro, 
  getFechaCreacionRegistro, 
  getUsuarioActualizoRegistro, 
  getFechaActualizacionRegistro 
} from "../controllers/auditoria.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*export const uploadFiles = async (req, res) => {
    console.log("subir archivo imagen ")
    try {
       const { url, descripcion, comentarios, id_paciente, id_diagnostico, id_clinica, id_usuario_creador, fecha_creacion} = req.body;
       console.log(req.body)

        // Define __filename y __dirname manualmente
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        // Ruta del archivo local en tu servidor
        const filePath = path.join(__dirname, '..','assets', '00000.png');
        console.log("filePath:: "+filePath)

        const resultUpload = await cloudinary.uploader.upload(filePath, {
            folder: 'dental_images', // Opcional: define una carpeta en Cloudinary
        });

        const [result] = await pool.execute(`
          INSERT INTO imagenes (id, url, descripcion, comentarios, id_paciente, id_diagnostico, id_clinica, id_usuario_creador, fecha_creacion) 
          VALUES (UUID_TO_BIN(UUID()),?,?,?, UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
          [resultUpload.secure_url, descripcion, comentarios, id_paciente || null, id_diagnostico || null, id_clinica, id_usuario_creador, fecha_creacion]
        );

        res.json({
          message: 'Imagen subida con éxito',
          url: "resultUpload.secure_url",
        });

      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al subir la imagen', details: error });
      }

}*/

export const uploadFiles = async (req, res) => {
  try {
    
    const { image, filename, descripcion, id_paciente, id_diagnostico, id_clinica, id_usuario_creador, fecha_creacion } = req.body;

    // Verificar que ambos campos existan
    if (!image || !filename) {
      return res.status(400).json({ message: 'Faltan campos necesarios (imagen o nombre de archivo).' });
    }

    // Define la ruta donde se guardará el archivo
    const uploadsDir = path.join(__dirname, '../assets/uploads');

    // Verificar si la carpeta 'uploads' existe, si no, crearla
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);

    // Decodifica la imagen Base64 y guarda el archivo
    fs.writeFile(filePath, image, 'base64', async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al guardar la imagen.', error: err.message });
      }

      try {
        // Subir la imagen a Cloudinary
        const resultUpload = await cloudinary.uploader.upload(filePath, {
          folder: 'dental_images', // Opcional: define una carpeta en Cloudinary
        });

        // Eliminar el archivo local después de subirlo a Cloudinary
        fs.unlinkSync(filePath);

        // Guardamos en bd
        const [result] = await pool.execute(`
          INSERT INTO imagenes (id, url, descripcion, id_paciente, id_diagnostico, id_clinica) 
          VALUES (UUID_TO_BIN(UUID()),?,?, UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?))`,
          [resultUpload.secure_url, descripcion, id_paciente || null, id_diagnostico || null, id_clinica]
        );

        if (result.affectedRows === 1) {
          console.log("Imagen registrada en bd con éxito")
        }

        const [idResult] = await pool.execute(`
          SELECT BIN_TO_UUID(id) as id FROM imagenes 
          WHERE BIN_TO_UUID(id_diagnostico) = ?
            AND BIN_TO_UUID(id_paciente) = ?
            AND BIN_TO_UUID(id_clinica) = ?`, 
          [id_diagnostico, id_paciente, id_clinica]);

        if (!idResult.length) {
          return res.status(500).json({ message: "No se encontró el ID del seguimiento insertado" });
        }

        const { id } = idResult[0];

        // ------------------------------------- REGISTRO
        registroAuditoria(id, id_usuario_creador, id_clinica, 'CREATE', 'imagenes', fecha_creacion)

        // Responder con el resultado de Cloudinary
        res.status(200).json({
          message: 'Imagen guardada con éxito en Cloudinary.',
          url: resultUpload.secure_url, // URL de la imagen en Cloudinary
        });

      } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Error al subir la imagen a Cloudinary.', error: error.message });
      }
    });


  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error en el servidor.', error: error.message });
  }
};
