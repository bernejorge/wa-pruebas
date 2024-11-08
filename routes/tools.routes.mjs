import express from "express";
import messageHandler from "../handlers/messageHandler.mjs";
import handleMessageStatus from "../handlers/statusHandler.mjs";
import { getGroupByCentro } from "./../utils/profesionales_servicio.mjs";
import axios from "axios";

const router = express.Router();

// Ruta que recibe un string por query param y devuelve el JSON agrupado
router.get("/getGroupByCentro", async (req, res) => {
  try {
    const inputText = req.query.inputText;

    if (!inputText) {
      return res
        .status(400)
        .json({ error: 'El parámetro "inputText" es requerido.' });
    }

    const data = await getGroupByCentro(
      inputText,
      "profesionales_servicio_centro_hp0637"
    );
    res.json(data);
  } catch (error) {
    console.error("Error en la ruta /getGroupByCentro:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

router.get("/getGroupByCentrohrf", async (req, res) => {
  try {
    const inputText = req.query.inputText;

    if (!inputText) {
      return res
        .status(400)
        .json({ error: 'El parámetro "inputText" es requerido.' });
    }

    const data = await getGroupByCentro(
      inputText,
      "profesionales_servicio_centro_hrf1325"
    );
    res.json(data);
  } catch (error) {
    console.error("Error en la ruta /getGroupByCentro:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

router.get("/getByProfesionalNameHRF", async (req, res) => {
  try {
    const inputText = req.query.inputText;

    if (!inputText) {
      return res
        .status(400)
        .json({ error: 'El parámetro "inputText" es requerido.' });
    }

    //limito la busqueda a los 5 resultados mas parecidos
    const data = await getGroupByCentro(inputText, "profesionales_servicio_centro_hrf1325",5);
    res.json(data);
  } catch (error) {
    console.error("Error en la ruta /getGroupByCentro:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

router.get("/getByProfesionalNameHP", async (req, res) => {
  try {
    const inputText = req.query.inputText;

    if (!inputText) {
      return res
        .status(400)
        .json({ error: 'El parámetro "inputText" es requerido.' });
    }

    //limito la busqueda a los 5 resultados mas parecidos
    const data = await getGroupByCentro(inputText, "profesionales_servicio_centro_hp0637",5);
    res.json(data);
  } catch (error) {
    console.error("Error en la ruta /getGroupByCentro:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

router.get("/obtenerPreparaciones", async (req, res) => {
  try {
    ///api/Meta/ObtenerPrestacionPorId
    const IdPrestacion = req.query.IdPrestacion;
    const fromToken = "webhook";

    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ObtenerPrestacionPorId`;
   
    const response = await axios.post(apiUrl, null, {
      params: {idPrestacion: IdPrestacion},
      headers: { From: fromToken }
    });

    // Mapear los campos 
    const { Id, Nombre, IntsruccionTxt, Exito } = response.data;

    // Enviar solo los campos mapeados
    res.json({ Id, Nombre, Instruccion: IntsruccionTxt, Exito });


  } catch (error) {
    console.error("Error en la ruta /obtenerPreparaciones:", error);
     // Verifica si el error tiene una respuesta del servidor
     if (error.response && error.response.data) {
      // Extrae el mensaje de error del servidor
      const serverMessage = error.response.data.Mensaje || "Error desconocido del servidor";
      res.status(error.response.status).json({ error: serverMessage });
    } else {
      // Manejo de errores sin respuesta del servidor
      res.status(500).json({ error: "Error al obtener las preparaciones" });
    }
  }
});

export default router;
