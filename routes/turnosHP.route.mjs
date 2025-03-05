import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Middleware para registrar la ruta y los parámetros usados
const logRouteAndParams = (req, res, next) => {
  console.log(`Ruta llamada: ${req.originalUrl}`);
  console.log("Parámetros:", req.method === "GET" ? req.query : req.body);
  next();
};

// Aplica el middleware a todas las rutas
router.use(logRouteAndParams);

router.get("/turnoshp/validar-dni", async (req, res) => {
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

    // Verifica si el error viene con una respuesta del backend
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnoshp/obtener-prestaciones", async (req, res) => {
  try {
    ///api/Meta/ObtenerPrestaciones

    const { IdCentroAtencion, IdServicio, IdProfesional } = req.body;
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ObtenerPrestaciones`;

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
      "Error al llamar a la API externa /api/Meta/ObtenerPrestaciones: ",
      error
    );

    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnoshp/obtener_primeros_turnos", async (req, res) => {
  try {
    ///api/Meta/ObtenerPrimerTurnos
    const {
      IdCentroAtencion,
      IdServicio,
      IdProfesional,
      IdPrestacion,
      IdPersona,
      IdCobertura,
    } = req.body;
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ObtenerPrimerTurnos`;

    //construccion del params
    const params = {
      idPersona: IdPersona,
      idPersonaRelacion: IdPersona,
      idCentrAtencion: IdCentroAtencion,
      idServicio: IdServicio,
      idRecurso: IdProfesional,
      idCobertura: IdCobertura,
      idPrestacion: IdPrestacion,
    };

    //construccion del body
    const body = {};

    const response = await axios.post(apiUrl, body, {
      params: params,
      headers: { From: fromToken },
    });

    let turnos = response.data.Turnos.map((turno) => ({
      IdTurno: turno.Id,
      Fecha: turno.Fecha,
      Profesional: turno.Medico,
      IdProfesional: turno.IdRecurso,
      IdPrestacion: IdPrestacion
    })).sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

    const data = response.data;
    data.Turnos = turnos; //mi mapeo

    res.json(data);
  } catch (error) {
    // Manejo de errores
    console.error("Error al llamar a ObtenerPrimerosTurnos:");
    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnoshp/obtener_primeros_turnos_x_servicio", async (req, res) => {
  try {
    ///api/Meta/ObtenerPrimerTurnos
    const {
      IdServicio,
      IdPrestacion,
      IdPersona,
      IdCobertura,
    } = req.body;

    if(IdPersona === 0 );
    if(IdCobertura === 0);

    const respuesta = {
      Exito: true,
      Prestacion: "",
      TurnoDisponibles: [],
      mensaje: ""
    }

    const errores = [];
    let datosHRF = null;
    let datosAnexo = null;

   // Buscar los turnos del HRF
   try {
    datosHRF = await obtenerPrimerosTurnos(19, IdServicio, IdPrestacion, IdPersona, IdCobertura);
    
    if (datosHRF.Turnos && datosHRF.Turnos.length > 0) {
      respuesta.TurnoDisponibles.push(...datosHRF.Turnos);
      respuesta.Prestacion = datosHRF.Prestacion;
    }
  } catch (errorHRF) {
    console.error("Error al obtener turnos de HRF:", errorHRF);
    errores.push({
      fuente: 'Error al buscar turnos en el Hospital Raul Angel Ferreyra',
      error: errorHRF.message || 'Error desconocido',
      detalles: errorHRF
    });
  }

  // buscar los turnos del Anexo
  try {
    datosAnexo = await obtenerPrimerosTurnos(32, IdServicio, IdPrestacion, IdPersona, IdCobertura);
    
    if (datosAnexo.Turnos && datosAnexo.Turnos.length > 0) {
      respuesta.TurnoDisponibles.push(...datosAnexo.Turnos);
      respuesta.Prestacion = datosAnexo.Prestacion || respuesta.Prestacion;
    }
  } catch (errorAnexo) {
    console.error("Error al obtener turnos de Anexo:", errorAnexo);
    errores.push({
      fuente: 'Error al buscar turnos en el Anexo Centro.',
      error: errorAnexo.message || 'Error desconocido',
      detalles: errorAnexo
    });
  }

    // Si ambas llamadas fallaron, envio los errores
    if (errores.length === 2) {
      return res.status(500).json({
        Exito: false,
        Errores: errores
      });
    }

    if (respuesta.TurnoDisponibles.length === 0) {
      respuesta.mensaje = "No se encotraron turnos disponibles",
      respuesta.Exito = true;
      return res.status(200).json(respuesta);
    }
    
    const  turnos = respuesta.TurnoDisponibles.map((turno) => ({
      IdTurno: turno.Id,
      Fecha: turno.Fecha,
      Profesional: turno.Medico,
      IdProfesional: turno.IdRecurso,
      Especialidad: turno.Especialidad,
      Lugar: turno.Lugar,
      IdCentroDeAtencion: turno.IdCentroDeAtencion,
      IdPrestacion: IdPrestacion
    })).sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
    
    respuesta.TurnoDisponibles = turnos; //mi mapeo de turnos.

    res.json(respuesta);
  } catch (error) {
    // Manejo de errores
    console.error("Error general al obtener turnos:", error);
    
    const errorMessage = 
      error.response && error.response.data
        ? error.response.data
        : { 
            mensaje: "Error desconocido al procesar los turnos", 
            detalles: error.message 
          };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnoshp/asignar", async (req, res) => {
  try {
    ///api/Meta/AsignarTurno

    const { IdPersona, IdTurno, IdPrestacion, IdCobertura } = req.body;
    const email = "";
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/AsignarTurno`;

    //construccion del params
    const params = {
      idPersona: IdPersona,
      idTurno: IdTurno,
      idPrestacion: IdPrestacion,
      idCobertura: IdCobertura,
      emailDestinatario: email,
    };

    //construccion del body
    const body = {};

    const response = await axios.post(apiUrl, body, {
      params: params,
      headers: { From: fromToken },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error al llamar a Turnos/AsignarTurno: ", error);
    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnoshp/anular_turno", async (req, res) => {
  try {
    ///api/Meta/AnularTurno

    const { IdPersona, IdTurno} = req.body;
    const email = "";
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/AnularTurno`;

    //construccion del params
    const params = {
      idPersona: IdPersona,
      idTurno: IdTurno
    };

    const response = await axios.get(apiUrl, {
      params: params, // Parámetros enviados como parte de la URL
      headers: { From: fromToken }, // Headers adicionales
    });

     // sepearo el objeto Turno
     const { Turno, ...restoDeLaRespuesta } = response.data;

     // Envio la respuesta sin el objeto Turno
     res.json(restoDeLaRespuesta);

  } catch (error) {
    console.error("Error al llamar a Turnos/AnularTurnos: ", error);
    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnoshp/mis-turnos", async (req, res) => {
  try {
    ///api/Meta/ConsultarProximosTurnos
    const idPersona = req.body.IdPersona;
    const fromToken = "webhook";
    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ConsultarProximosTurnos`;

    const params = {
      idPersona: idPersona,
      idPersonaRelacion: idPersona,
    };
    const response = await axios.get(apiUrl, {
      params: params,
      headers: { From: fromToken },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error al llamar a Turnos/ConsultarProximosTurnos", error);

    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnoshp/turno-mas-proximo", async (req, res) => {
  try {
    let input = req.body.Profesionales;
    const { IdServicio, IdCentro, IdPersona, IdCobertura } = req.body;

    // Check if 'Profesionales' exists in the request body
    if (!input) {
      return res.status(400).json({
        error:
          "El campo 'Profesionales' es requerido en el cuerpo de la solicitud.",
      });
    }

    // If 'input' is a string, attempt to parse it as JSON
    if (typeof input === "string") {
      try {
        input = JSON.parse(input);
      } catch (e) {
        return res
          .status(400)
          .json({ error: "Formato JSON inválido para 'Profesionales'." });
      }
    }

    // Verify that 'input' is an object with a 'Profesionales' array
    if (!input || !Array.isArray(input)) {
      return res.status(400).json({
        error:
          "'Profesionales' debe ser un objeto que contiene un arreglo 'Profesionales'.",
      });
    }

    // Validate each item in the 'Profesionales' array
    for (const prof of input) {
      if (
        !prof.hasOwnProperty("IdProfesional") ||
        typeof prof.IdProfesional !== "number" ||
        !Number.isInteger(prof.IdProfesional)
      ) {
        return res.status(400).json({
          error:
            "Cada elemento en 'Profesionales' debe tener un 'IdProfesional' entero.",
        });
      }
    }

    // Extract 'IdProfesional's for further processing
    const ids = input.map((p) => p.IdProfesional);
    let turnos = [];
    for (const IdProfesional of ids) {
      try {
        const data = await obtenerPrestaciones(
          IdCentro,
          IdServicio,
          IdProfesional
        );
        const prestaciones = data.Prestaciones;

        for (const prestacion of prestaciones) {
          const IdPrestacion = prestacion.IdPrestacion;
          try {
            const dataTurnos = await obtenerPrimerosTurnos(
              IdCentro,
              IdServicio,
              IdProfesional,
              IdPrestacion,
              IdPersona,
              IdCobertura
            );
            const turnosProfesional = dataTurnos.map((t) => ({
              ...t,
              ...prestacion,
            }));
            console.log(turnosProfesional);
            turnos.push(...turnosProfesional);
          } catch (error) {}
        }

        console.log(prestaciones);
      } catch (error) {}
    }

    let msg = "";
    if (turnos.length == 0) {
      msg = `No se encontraron turnos para los Ids ' + ${input}. 
      Revisa que sean los recuperados con la herramienta "profesionalesferreyra"`;
    }
    res.status(200).json({ message: "Validación exitosa.", turnos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

async function obtenerPrestaciones(
  IdCentroAtencion,
  IdServicio,
  IdProfesional
) {
  const fromToken = "webhook"; // Token de acceso en los headers
  const apiUrl = `${process.env.API_BASE_URL}/api/Turnos/ObtenerPrestaciones`;

  try {
    const response = await axios.post(apiUrl, null, {
      params: {
        IdProfesional,
        IdCentro: IdCentroAtencion,
        IdServicio,
      },
      headers: { From: fromToken },
    });
    return response.data.Prestaciones;
  } catch (error) {
    console.error(
      "Error al llamar a la API externa /api/Turnos/ObtenerPrestaciones:",
      error
    );
    throw new Error("Error al obtener prestaciones");
  }
}

async function obtenerPrimerosTurnos(
  IdCentroAtencion,
  IdServicio,
  IdPrestacion,
  IdPersona,
  IdCobertura
) {
  try {
    ///api/Meta/ObtenerPrimerTurnos

    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ObtenerPrimerTurnos`;

    //construccion del params
    const params = {
      idPersona: IdPersona,
      idPersonaRelacion: IdPersona,
      idCentrAtencion: IdCentroAtencion,
      idServicio: IdServicio,
      idCobertura: IdCobertura,
      idPrestacion: IdPrestacion,
    };

    //construccion del body
    const body = {};

    const response = await axios.post(apiUrl, body, {
      params: params,
      headers: { From: fromToken },
    });

    const data = response.data;

    return data;
  } catch (error) {
    // Manejo de errores
    console.error("Error al llamar a ObtenerPrimerosTurnos:");
    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    throw error;
  }
}

export default router;
