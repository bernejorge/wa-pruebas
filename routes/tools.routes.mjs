import express from "express";
import messageHandler from "../handlers/messageHandler.mjs";
import handleMessageStatus from "../handlers/statusHandler.mjs";
import { getGroupByCentro } from "./../utils/profesionales_servicio.mjs";

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

export default router;
