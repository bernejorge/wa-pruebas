// stressTest.js
import axios from 'axios'; 
import pLimit from 'p-limit'; 


// Define la URL de destino
//const url = 'http://172.29.230.74:3002/api/v1/prediction/fbf63207-a0d7-4387-9893-6e379a90c7d2';
const url = 'http://172.29.238.51:3002/api/v1/prediction/fbf63207-a0d7-4387-9893-6e379a90c7d2';
//const url = 'http://172.29.238.51:3002/api/v1/prediction/7bdb3737-7ab7-4b97-8132-4398f40767f2';

// Define los encabezados y el cuerpo de la solicitud
const headers = {
  'Content-Type': 'application/json'
};


// Número total de solicitudes y el límite de concurrencia
const totalRequests = 200;
const concurrencyLimit = 50;

// Crear un limitador de concurrencia
const limit = pLimit(concurrencyLimit);

// Función para realizar una sola solicitud
const sendRequest = async (i) => {
  try {
    const data = {
      question: "Hola",
      streaming: false,
      overrideConfig:{
        sessionId:`testE-${i}`
      }
    };
    const response = await axios.post(url, data, { headers });
    console.log(`Solicitud ${i + 1} exitosa:`, response.data);
  } catch (error) {
    if (error.response) {
      console.log(`Solicitud ${i + 1} fallida:`, error.response.status, error.response.data);
    } else {
      console.log(`Solicitud ${i + 1} fallida:`, error.message);
    }
  }
};

// Función principal para realizar el stress test con limitación de concurrencia
const performStressTest = async () => {
  // Iniciamos el tiempo
  const startTime = Date.now();

  const promises = [];
  for (let i = 0; i < totalRequests; i++) {
    // Encolar la solicitud con el limitador de concurrencia
    promises.push(limit(() => sendRequest(i)));
  }

  // Esperar a que todas las solicitudes se completen
  await Promise.all(promises);

  console.log('Prueba de estrés completada.');

  // Calculamos el tiempo transcurrido
  const endTime = Date.now();
  console.log(`Tiempo de ejecución: ${endTime - startTime} ms`);
};

// Ejecutar la función principal
performStressTest();
