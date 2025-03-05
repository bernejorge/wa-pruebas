// forceFinWait2Test.js
const net = require('net');

// Ajusta el host y puerto donde está tu endpoint:
const HOST = '172.29.230.73';
const PORT = 3002;

// Path de la ruta a la que haremos el POST
//const PATH = '/api/v1/prediction/5fb2be27-d208-4e07-b03b-a78fde46868d';
const PATH = '/api/v1/prediction/fbf63207-a0d7-4387-9893-6e379a90c7d2';

// El body de la petición
const requestData = JSON.stringify({ question: 'Hola' });

// Creamos la conexión TCP pura:
const client = net.createConnection(PORT, HOST, () => {
  console.log('Conexión establecida con el servidor...');

  // Construimos a mano el HTTP POST
  const httpRequest =
    `POST ${PATH} HTTP/1.1\r\n` +
    `Host: ${HOST}\r\n` +
    `Content-Type: application/json\r\n` +
    `Content-Length: ${Buffer.byteLength(requestData)}\r\n` +
    `\r\n` +
    requestData;

  // Enviamos la petición
  client.write(httpRequest);
});

// Al recibir data, la mostramos y cerramos inmediatamente:
client.on('data', (data) => {
  console.log('Respuesta del servidor:', data.toString());
  
  // Instruimos a Node que cierre el socket (envía un FIN desde el cliente).
  client.end();
});

// Cuando el socket se cierra desde el lado del servidor:
client.on('end', () => {
  console.log('Socket cerrado desde el lado del servidor.');
});

// Manejo de errores
client.on('error', (err) => {
  console.error('Error en la conexión:', err);
});
