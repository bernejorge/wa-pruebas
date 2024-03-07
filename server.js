const express = require('express');
const multer  = require('multer');
const path = require('path');
const cors = require('cors');
const { sendToDocumentAI } = require('./test');
//const upload = multer({ dest: 'uploads/' }); // Configura Multer para cargar archivos en la carpeta 'uploads'
const app = express();

app.use(cors());
const port = 3000;

// Sirve archivos estáticos (HTML, JS)
app.use(express.static('public'));

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, 'uploads/') // Asegúrate de que este directorio exista
   },
   filename: function (req, file, cb) {
     // Genera un nombre de archivo que incluye la extensión original
     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
   }
 });
 
 const upload = multer({ storage: storage });

// Ruta POST para procesar el archivo
app.post('/process', upload.single('file'), async (req, res) => {
   if (!req.file) {
     return res.status(400).send('No file uploaded.');
   }
 
   try {
     const result = await sendToDocumentAI(req.file.path);
     
     return res.status(200).json(result.document);
   } catch (error) {
     console.error(error);
     return res.status(500).send('Error processing document.');
   }
 })

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
