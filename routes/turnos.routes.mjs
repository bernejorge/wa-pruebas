import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/turnos/validar-dni", async (req, res) => {
  try {
    const dni = req.query.dni; // Asumo que estás enviando el DNI por el body
    const fromToken = "webhook"; // El token de acceso está en los headers

    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ValidarDNI`;

    const response = await axios.post(apiUrl, null, {
      params: { DNI: dni },
      headers: { From: fromToken },
    });
    let data;
    if (response.data.Nombre) {
      //mapear las coberturas.
      const coberturas = response.data.Coberturas.map((cobertura) => ({
        IdCobertura: cobertura.Id,
        nombre: cobertura.NombreFinanciador,
      }));

      data = {
        exito: true,
        nombre: response.data.Nombre,
        apellido: response.data.Apellido,
        IdPersona: response.data.Id,
        coberturas: coberturas,
        mensaje: "El usuario ha sido validado con éxito.",
      };
    } else {
      data = {
        exito: false,
        mensaje: `${response.data.Mensaje} Confirma con el ususario si el dni '${dni}' es correcto.`,
      };
    }

    res.json(data);
  } catch (error) {
    console.error("Error al llamar a la API externa /Meta/ValidarDNI:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/turnos/obtener-prestaciones", async (req, res) => {
  try {
    const { IdCentroAtencion, IdServicio, IdProfesional } = req.body;
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Turnos/ObtenerPrestaciones`;

    const response = await axios.post(apiUrl, null, {
      params: {
        IdProfesional: IdProfesional,
        IdCentro: IdCentroAtencion,
        IdServicio: IdServicio,
      },
      headers: { From: fromToken },
    });
    let data = response.data.Prestaciones;

    res.json(data);
  } catch (error) {
    console.error(
      "Error al llamar a la API externa /api/Turnos/ObtenerPrestaciones:",
      error,
      "/n Por favor revisa los ids utilizados en la llamadas, No los debes inventar o alucinar."
    );
    res.status(500).json({ error: error });
  }
});

router.post("/turnos/obtener_primeros_turnos", async (req, res) => {
  try {
    ///api/Turnos/ObtenerPrimerosTurnos
    const {
      IdCentroAtencion,
      IdServicio,
      IdProfesional,
      IdPrestacion,
      IdPersona,
      IdCobertura,
    } = req.body;
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Turnos/ObtenerPrimerosTurnos`;

    //construccion del params
    const params = {
      idPersona: IdPersona,
      idPersonaRelacion: IdPersona,
      idCentro: IdCentroAtencion,
    };

    //construccion del body
    const body = {
      IdServicio: IdServicio,
      IdsRecursos: [IdProfesional],
      IdCobertura: IdCobertura,
      IdPrestacion: IdPrestacion,
    };

    const response = await axios.post(apiUrl, body, {
      params: params,
      headers: { From: fromToken },
    });

    let turnos = response.data.Turnos.map((turno) => ({
      IdTurno: turno.Id,
      Fecha: turno.Fecha,
      Profesional: turno.Medico,
      IdProfesional: turno.IdRecurso,
    }));

    const data = response.data;
    data.Turnos = turnos; //mi mapeo

    res.json(data);
  } catch (error) {
    // Manejo de errores
    console.error(
      "Error al llamar a ObtenerPrimerosTurnos:",
      error +
        "/n Resvisa que los ids sean los correctos, deben ser los seleccionados por el usuario en los pasos anteriores."
    );
    res.status(500).json({ error: error.message });
  }
});

router.post("/turnos/asignar", async (req, res) => {
  try {
    const { IdPersona, IdTurno, IdPrestacion, IdCobertura } = req.body;
    const email = "";
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Turnos/Asignar`;

    //construccion del params
    const params = {
      idPersona: IdPersona,
      idPersonaRelacion: IdPersona,
    };

    //construccion del body
    const body = {
      IdTurno: IdTurno,
      IdPrestacion: IdPrestacion,
      IdCobertura: IdCobertura,
      EmailDestinatario: email,
      EmailDestinatarioConDatosDeContacto: email,
    };

    const response = await axios.post(apiUrl, body, {
      params: params,
      headers: { From: fromToken },
    });

    res.json(response.data);

  } catch (error) {

   console.error("Error al llamar a Turnos/Asignar: " , error);
   res.status(500).json({ error: error.message + '/n Resvisa que los ids sean los correctos, deben ser los seleccionados por el usuario en los pasos anteriores.', });

  }
});

export default router;
