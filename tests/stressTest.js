// stressTest.js
const axios = require('axios');

const url = 'http://localhost:3050/api/v1/prediction/fa99ac30-b408-4aad-81fa-7876d284d01f';
//const url = 'http://172.29.238.51:3002/api/v1/prediction/5fb2be27-d208-4e07-b03b-a78fde46868d';
//const url = 'http://172.29.238.51:3002/api/v1/prediction/fbf63207-a0d7-4387-9893-6e379a90c7d2';
//const url = 'http://localhost:3050/api/v1/prediction/661e81ab-0418-41fd-81cb-887961f6b2b6';
//const url = 'http://172.29.230.73:3002/api/v1/prediction/dea2d4bc-6fe6-4215-a8db-62de0e8ad082';
const headers = {
  'Content-Type': 'application/json'
};
const data = {
  question: "Hola"
};

const totalRequests = 1;

const performStressTest = async () => {
  const requests = [];

  for (let i = 0; i < totalRequests; i++) {
    requests.push(
      axios.post(url, data, { headers })
        .then(response => {
          console.log(`Solicitud ${i + 1} exitosa:`, response.data);
        })
        .catch(error => {
          if (error.response) {
            console.log(`Solicitud ${i + 1} fallida:`, error.response.status, error.response.data);
          } else {
            console.log(`Solicitud ${i + 1} fallida:`, error.message);
          }
        })
    );
  }

  // Ejecuta todas las solicitudes concurrentemente
  await Promise.all(requests);
  console.log('Prueba de estrés completada.');
};

performStressTest();
