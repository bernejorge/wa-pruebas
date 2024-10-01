import express from 'express';
import messageHandler from '../handlers/messageHandler.mjs';
import handleMessageStatus from '../handlers/statusHandler.mjs';
import {getGroupByCentro} from './../utils/profesionales_servicio.mjs'

const router = express.Router();

// Ruta que recibe un string por query param y devuelve el JSON agrupado
router.get('/getGroupByCentro', async (req, res) => {
   try {
     const inputText = req.query.inputText;
 
     if (!inputText) {
       return res.status(400).json({ error: 'El parámetro "inputText" es requerido.' });
     }
 
     const data = await getGroupByCentro(inputText);
     res.json(data);
   } catch (error) {
     console.error('Error en la ruta /getGroupByCentro:', error);
     res.status(500).json({ error: 'Error interno del servidor.' });
   }
 });
 
 export default router;