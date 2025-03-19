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

router.get("/turnoshp/obtener-centros-atencion", async (req, res) => {
  try {
    //TODO: llamar a => curl -X POST "http://innova.testing.hospitalprivado.com.ar/Comun/IntegracionMETA/api/CentrosDeAtencion/Obtener" -H "accept: text/plain" -H "From: tips" -H "Content-Type: application/json-patch+json" -d "{\"IdsCentrosDeAtencion\":[0],\"IdPersonaRelacion\":0}"
    const fromToken = "webhook"; // El token de acceso está en los headers
    ///api/Meta/ObtenerCentrosAtencion
    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ObtenerCentrosAtencion`;

    const mockCentros = [
      { IdCentroAtencion: 14, nombre: "Central", domicilio: "Av. Naciones Unidas 346, Córdoba", telefono: "0351-4688200" },
      { IdCentroAtencion: 15, nombre: "Patio Olmos", domicilio: "Obispo Trejo 320, Córdoba", telefono: "0351-5697600" },
      { IdCentroAtencion: 16, nombre: "Hiper Libertad", domicilio: "Hiper Libertad Rodriguez del Busto - Fray Luis Beltrán y Cardeñosa, Poeta Lugones - Córdoba", telefono: "0351-4779500" },
      { IdCentroAtencion: 17, nombre: "Cerro", domicilio: "Luis de Tejeda 4625. Córdoba. CP 5000.", telefono: "0351-4118336" },
      { IdCentroAtencion: 18, nombre: "Villa Allende", domicilio: "Río de Janeiro 1725 (esq. Mendoza) - Villa Allende", telefono: "0351-5697610" },
      //{ IdCentroAtencion: 19, nombre: "Hospital Raúl Ángel Ferreyra", domicilio: "Av. Pablo Ricchieri 2200, Córdoba", telefono: "0351-4476500" },
      { IdCentroAtencion: 20, nombre: "Anexo Jardin", domicilio: "Av. Richieri 3176", telefono: "351-4865557" },
      { IdCentroAtencion: 21, nombre: "Centro Médico San Vicente", domicilio: "Sargento Cabral 1385. Córdoba", telefono: "0351-4558041" },
      { IdCentroAtencion: 22, nombre: "Cañada Honda", domicilio: "", telefono: "" },
      { IdCentroAtencion: 23, nombre: "Centro Rivadavia", domicilio: "Rivadavia 150 1er piso", telefono: "" },
      { IdCentroAtencion: 24, nombre: "Ctro Perif. Villa Maria", domicilio: "", telefono: "" },
      { IdCentroAtencion: 25, nombre: "Centro de Atención Calazans", domicilio: "Calazans", telefono: "" },
      { IdCentroAtencion: 26, nombre: "Velez Sarsfield", domicilio: "Velez Sarsfield 478, Córdoba", telefono: "" },
      { IdCentroAtencion: 27, nombre: "PRUEBA", domicilio: "Naciones Unidas 346, Bº Parque Vélez Sarsfield, Córdoba", telefono: "0351-4688200" },
      { IdCentroAtencion: 28, nombre: "Ctro Perif. Rogelio Martínez", domicilio: "Rogelio Martínez", telefono: "" },
      { IdCentroAtencion: 29, nombre: "Hospital Privado Nuñez", domicilio: "Av. Rafael Nuñez 5229 - Córdoba", telefono: "" },
      { IdCentroAtencion: 30, nombre: "Ctro Perif. Recta Martinolli", domicilio: "Recta Martinolli", telefono: "" },
      { IdCentroAtencion: 31, nombre: "Ctro Perif. Jardín Espinosa", domicilio: "Jardín Espinosa", telefono: "" },
      //{ IdCentroAtencion: 32, nombre: "HRF Anexo Centro", domicilio: "Santa Rosa 770, Córdoba", telefono: "351-5711020" },
      { IdCentroAtencion: 33, nombre: "Ctro Perif. Finochietto", domicilio: "Enrique Finocchietto 460", telefono: "" },
      { IdCentroAtencion: 34, nombre: "Centro Rehabilitación SDE", domicilio: "Santiago del Estero 333, Córdoba", telefono: "351-5697640" },
      { IdCentroAtencion: 35, nombre: "Ctro Perif. SDE", domicilio: "Santiago del Estero 333, Córdoba", telefono: "" },
      { IdCentroAtencion: 36, nombre: "Cent Perif. Recta Martinolli", domicilio: "recta", telefono: "035153035565" }
    ];

    const response = await axios.get(apiUrl, {
      headers: { From: fromToken }, // Headers adicionales
    });

    const data = response.data;

    const centrosFiltrados = data.CentrosDeAtenciones.map(centro => ({
      IdCentroAtencion: centro.Id,
      nombre: centro.Nombre,
      telefono: centro.Telefono
    })).filter(
      centro => centro.IdCentroAtencion !== 32 && centro.IdCentroAtencion !== 19
    );;
    
     

    res.json({
      exito: true,
      Centros: centrosFiltrados
    });

  } catch (error) {
    console.error("Error al llamar a la API externa /api/CentrosDeAtencion/Obtener:", error);
    
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
  }
});

router.get("/turnoshp/obtener-servicios-centros", async (req, res)=>{
   try {
      const IdRecurso = req.query.IdProfesional;
      const fromToken = "webhook"; // El token de acceso está en los headers
      const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ObtenerCentroServicios`; //completar la url con la que haga el seba
      
      const response = await axios.get(apiUrl, {
         params: { IdRecurso: IdRecurso }, // Parámetros enviados como parte de la URL
         headers: { From: fromToken }, // Headers adicionales
      });

      const filteredCentros = response.data.ListaCentroAtencionServicio.filter(
        item => item.IdCentroAtencion !== 32 && item.IdCentroAtencion !== 19
      );
      
      response.data.ListaCentroAtencionServicio = filteredCentros;

      res.json(response.data); 

   } catch (error) {
      console.error("Error al llamar a la API externa /Meta/ObtenerCentroServicios:", error) //completar la url;

    // Verifica si el error viene con una respuesta del backend
    const errorMessage =
      error.response && error.response.data
        ? error.response.data
        : { mensaje: "Error desconocido al llamar a la API externa." };

    res.status(error.response ? error.response.status : 500).json(errorMessage);
   }
});

router.get("/turnoshp/ObtenerCentroPorServiciosPrestacion", async (req, res)=>{
  try {
     const IdPrestacion = req.query.IdPrestacion;
     const IdServicio = req.query.IdServicio;
     const fromToken = "webhook"; // El token de acceso está en los headers
     ///api/Meta/ObtenerCentroPorServiciosPrestacion
     const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ObtenerCentroPorServiciosPrestacion`; //completar la url con la que haga el seba
     
     const response = await axios.get(apiUrl, {
        params: { 
          IdPrestacion: IdPrestacion,
          IdServicio: IdServicio
        }, // Parámetros enviados como parte de la URL
        headers: { From: fromToken }, // Headers adicionales
     });

     const filteredCentros = response.data.ListaCentroAtencionServicio.filter(
       item => item.IdCentroAtencion !== 32 && item.IdCentroAtencion !== 19
     );
     
     response.data.ListaCentroAtencionServicio = filteredCentros;

     res.json({
      success: true,
      data: response.data,
    }); 

  } catch (error) {
     console.error("Error al llamar a la API externa /Meta/ObtenerCentroServicios:", error) //completar la url;

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
      IdPrestacion: IdPrestacion,
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
      const { IdCentro, IdServicio, IdPrestacion, IdPersona, IdCobertura } = req.body;

      if (IdPersona === 0);
      if (IdCobertura === 0);

      const respuesta =  await obtenerPrimerosTurnos(
        IdCentro,
        IdServicio,
        IdPrestacion,
        IdPersona,
        IdCobertura
      );

      const turnos = respuesta.Turnos.map((turno) => ({
        IdTurno: turno.Id,
        Fecha: turno.Fecha,
        Profesional: turno.Medico,
        IdProfesional: turno.IdRecurso,
        Especialidad: turno.Especialidad,
        Lugar: turno.Lugar,
        IdCentroDeAtencion: turno.IdCentroDeAtencion,
        IdPrestacion: IdPrestacion,
      })).sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

      respuesta.Turnos = turnos; //mi mapeo de turnos.

      res.json(respuesta);
    } catch (error) {
      // Manejo de errores
      console.error("Error general al obtener turnos:", error);

      const errorMessage =
        error.response && error.response.data
          ? error.response.data
          : {
              mensaje: "Error desconocido al procesar los turnos",
              detalles: error.message,
            };

      res
        .status(error.response ? error.response.status : 500)
        .json(errorMessage);
    }
  }
);

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

    const { IdPersona, IdTurno } = req.body;
    const email = "";
    const fromToken = "webhook"; // El token de acceso está en los headers
    const apiUrl = `${process.env.API_BASE_URL}/api/Meta/AnularTurno`;

    //construccion del params
    const params = {
      idPersona: IdPersona,
      idTurno: IdTurno,
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
