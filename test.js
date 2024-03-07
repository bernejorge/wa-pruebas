const {GoogleAuth} = require('google-auth-library');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function sendToDocumentAI(filePath) {
  try {
    const mimeTypeMap = {
      '.pdf': 'application/pdf',
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpeg',
      // Aquí puedes agregar más mapeos de extensión a mimeType si es necesario
    };

    const fileExtension = path.extname(filePath);
    const mimeType = mimeTypeMap[fileExtension] || 'application/octet-stream';

    const content = fs.readFileSync(filePath, {encoding: 'base64'});

    const auth = new GoogleAuth({
      // Especifica el path al archivo JSON de las credenciales de tu cuenta de servicio, si es necesario
      keyFilename: './gcloud.json',
      // O especifica las credenciales directamente
      // credentials: {client_email: '...', private_key: '...'},
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const requestBody = {
      skipHumanReview: true,
      rawDocument: {
        mimeType: mimeType,
        content: content
      }
    };

    const response = await axios.post(
      'https://us-documentai.googleapis.com/v1/projects/1091326469980/locations/us/processors/a6d3232f02266c43:process',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );

    console.log('Response data:',  JSON.stringify(response.data));

    

    return response.data;
  } catch (error) {
    console.error('Error sending request to Document AI:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Uso de la función
//const filePath = './cpe.pdf'; // Asegúrate de reemplazar esto con la ruta real a tu archivo PDF
// const filePath = './01.jpeg';
// sendToDocumentAI(filePath).then(data => {
//   console.log('Document AI response:', data);
// }).catch(error => {
//   console.error('Error:', error);
// });

module.exports.sendToDocumentAI = sendToDocumentAI;