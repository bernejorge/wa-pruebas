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

    // Verifica si el error viene con una respuesta del backend
    const errorMessage = error.response && error.response.data
      ? error.response.data
      : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
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
    console.error("Error al llamar a la API externa /api/Turnos/ObtenerPrestaciones:", error);
    
    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage = error.response && error.response.data
      ? error.response.data
      : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnos/obtener_primeros_turnos", async (req, res) => {
  try {
    ///api/Turnos/ObtenerPrimerosTurnosWsp
    const {
      IdCentroAtencion,
      IdServicio,
      IdProfesional,
      IdPrestacion,
      IdPersona,
      IdCobertura,
    } = req.body;
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Turnos/ObtenerPrimerosTurnosWsp`;

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
    console.error("Error al llamar a ObtenerPrimerosTurnos:");
    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage = error.response && error.response.data
      ? error.response.data
      : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnos/asignar", async (req, res) => {
  try {
    const { IdPersona, IdTurno, IdPrestacion, IdCobertura } = req.body;
    const email = "";
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Turnos/AsignarTurnoWsp`;

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
    console.error("Error al llamar a Turnos/AsignarTurnoWsp: ", error);
    // Verifica si el error viene con una respuesta del backend externo
    const errorMessage = error.response && error.response.data
      ? error.response.data
      : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnos/mis-turnos", async (req, res) => {
  try {
    const idPersona = req.body.IdPersona;
    const fromToken = "webhook";
    const apiUrl = `${process.env.API_BASE_URL}/api/Turnos/ConsultarProximosTurnosWsp`;

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
    const errorMessage = error.response && error.response.data
      ? error.response.data
      : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.post("/turnos/turno-mas-proximo", async (req, res) => {
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
    const ids = input.map((p)=> p.IdProfesional);
    let turnos = [];
    for (const IdProfesional of ids) {
      try {
        const data = await obtenerPrestaciones(IdCentro, IdServicio, IdProfesional);
        const prestaciones = data.Prestaciones;
        
        for (const prestacion of prestaciones){
          const IdPrestacion = prestacion.IdPrestacion;
          try {
            const dataTurnos = await obtenerPrimerosTurnos(IdCentro, IdServicio, IdProfesional, IdPrestacion, IdPersona, IdCobertura);
            const turnosProfesional = dataTurnos.map((t) =>({
              ...t,
              ...prestacion
            }) )
            console.log(turnosProfesional);
            turnos.push(...turnosProfesional);

          } catch (error) {
            
          }
        } 

        console.log(prestaciones);
      } catch (error) {

      }
    }
   
    let msg= "";
    if(turnos.length == 0){
      msg = `No se encontraron turnos para los Ids ' + ${input}. 
      Revisa que sean los recuperados con la herramienta "profesionalesferreyra"`;
    }
    res.status(200).json({ message: "Validación exitosa.", turnos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

async function obtenerPrestaciones(IdCentroAtencion, IdServicio, IdProfesional) {
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
};

async function obtenerPrimerosTurnos(IdCentroAtencion, IdServicio, IdProfesional, IdPrestacion, IdPersona, IdCobertura) {
  const fromToken = "webhook"; // Token de acceso en los headers
  const apiUrl = `${process.env.API_BASE_URL}/api/Turnos/ObtenerPrimerosTurnosWsp`;

  // Construcción de params y body
  const params = {
    idPersona: IdPersona,
    idPersonaRelacion: IdPersona,
    idCentro: IdCentroAtencion,
  };

  const body = {
    IdServicio: IdServicio,
    IdsRecursos: [IdProfesional],
    IdCobertura: IdCobertura,
    IdPrestacion: IdPrestacion,
  };

  try {
    const response = await axios.post(apiUrl, body, {
      params: params,
      headers: { From: fromToken },
    });

    // Mapea los turnos para el formato requerido
    const turnos = response.data.Turnos.map((turno) => ({
      IdTurno: turno.Id,
      Fecha: turno.Fecha,
      Profesional: turno.Medico,
      IdProfesional: turno.IdRecurso,
    }));

    return turnos;
  } catch (error) {
    console.error("Error al llamar a ObtenerPrimerosTurnos:", error);
    throw new Error("Error al obtener los primeros turnos");
  }
};

export default router;
