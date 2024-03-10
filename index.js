const express = require('express');
const axios = require('axios');
const fs = require('fs').promises; // Para usar async/await con fs
const path = require('path');
const cors = require('cors');
const { config } = require('dotenv');
config();

const token = process.env.WHATSAPP_TOKEN;

const app = express();
const port = process.env.PORT || 8080;

// Habilitar CORS para todos los orígenes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/', async (req, res) => {
  res.json({
     message: "Bienvenido whatapp testing api v1.02 ..."
  });
});

app.get('/api/', async (req, res) => {
   res.json({
      message: "Bienvenido al webhook server..."
   });
});

app.post('/api/', async (req,res) => {
   if(req.body) console.log(req.body);

   res.sendStatus(200);
});

app.post("/webhook", async (req, res) => { // Asegúrate de que la función es asíncrona
   // Parse the request body from the POST
   let body = req.body;

   // Check the Incoming webhook message
   console.log(JSON.stringify(req.body, null, 2));

   if (req.body.object) {
     if (
       req.body.entry &&
       req.body.entry[0].changes &&
       req.body.entry[0].changes[0] &&
       req.body.entry[0].changes[0].value.messages &&
       req.body.entry[0].changes[0].value.messages[0]
     ) {
       let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
       let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
       let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload

       try {
         // Usar await para esperar la respuesta de axios.post
         // const response = await axios.post(`https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`, {
         //   messaging_product: "whatsapp",
         //   to: from,
         //   text: { body: "Ack: " + msg_body },
         // }, {
         //   headers: { "Content-Type": "application/json" },
         // });
         // console.log(response.data); // Opcional: manejar la respuesta de alguna manera
       } catch (error) {
         console.error(error); // Manejar el error aquí
         return res.sendStatus(500); // Devolver un estado de error adecuado
       }

       res.sendStatus(200);
     } else {
       res.sendStatus(404); // No se encontró el formato esperado del mensaje
     }
   } else {
     // Return a '404 Not Found' if event is not from a WhatsApp API
     res.sendStatus(404);
   }
 });

 app.get("/webhook", (req, res) => {
   /**
    * UPDATE YOUR VERIFY TOKEN
    *This will be the Verify Token value when you set up webhook
   **/
   const verify_token = process.env.VERIFY_TOKEN;
 
   // Parse params from the webhook verification request
   let mode = req.query["hub.mode"];
   let token = req.query["hub.verify_token"];
   let challenge = req.query["hub.challenge"];
 
   // Check if a token and mode were sent
   if (mode && token) {
     // Check the mode and token sent are correct
     if (mode === "subscribe" && token === verify_token) {
       // Respond with 200 OK and challenge token from the request
       console.log("WEBHOOK_VERIFIED");
       res.status(200).send(challenge);
     } else {
       // Responds with '403 Forbidden' if verify tokens do not match
       res.sendStatus(403);
     }
   }
 });

 app.post('/sendTemplateMessage', async (req, res) => {
  const apiVersion = process.env.API_VERSION;
  const phoneNumberId = req.body.phoneNumberId || process.env.BUSSINESS_PHONE_NUMBER_ID;
  const accessToken = req.body.accessToken || process.env.WHATSAPP_TOKEN;
  const { recipientNumber, templateName, headerParams, bodyParams, footerParams } = req.body;

  // URL para enviar mensajes de plantilla a través de la API de WhatsApp
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  // Construcción de la estructura de components basada en la presencia de los parámetros
  const components = [];
  if (headerParams && headerParams.length > 0) {
    components.push({
      type: "header",
      parameters: headerParams.map(param => ({ type: "text", text: param }))
    });
  }
  if (bodyParams && bodyParams.length > 0) {
    components.push({
      type: "body",
      parameters: bodyParams.map(param => ({ type: "text", text: param }))
    });
  }
  if (footerParams && footerParams.trim() !== '') {
    components.push({
      type: "footer",
      text: footerParams
    });
  }

  const data = {
    messaging_product: "whatsapp",
    to: recipientNumber,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "es_AR" // Todos los templates estan en español argentina, ajustar si es necesario
      },
      components: components.length > 0 ? components : undefined
    }
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error al enviar mensaje de plantilla:', error.response.data);
    res.status(500).json({ success: false, error: error.response.data });
  }
});

app.post('/sendTemplateMessageMediaHeader', async (req, res) => {
  const apiVersion = process.env.API_VERSION;
  const phoneNumberId = req.body.phoneNumberId || process.env.BUSSINESS_PHONE_NUMBER_ID;
  const accessToken = req.body.accessToken || process.env.WHATSAPP_TOKEN;
  const { recipientNumber, templateName, headerParams, bodyParams, footerParams } = req.body;

  // URL para enviar mensajes de plantilla a través de la API de WhatsApp
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  // Construcción de la estructura de components basada en la presencia de los parámetros
  const components = [];
  if (headerParams && headerParams.mimeType && headerParams.base64) {
    try {
      const { fileUrl, type } = await saveBase64FileAndGetDetails(headerParams.base64, headerParams.mimeType);
    
      components.push({
        type: "header",
        parameters: [
          {
            type: type, // "image" o "document"
            [type]: { // Usa la clave dinámicamente basada en el tipo de archivo
              link: fileUrl // La URL del archivo subido
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error guardando el archivo:', error);
      // Manejar el error adecuadamente
    }
  }
  if (bodyParams && bodyParams.length > 0) {
    components.push({
      type: "body",
      parameters: bodyParams.map(param => ({ type: "text", text: param }))
    });
  }
  if (footerParams && footerParams.trim() !== '') {
    components.push({
      type: "footer",
      text: footerParams
    });
  }

  const data = {
    messaging_product: "whatsapp",
    to: recipientNumber,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "es_AR" // Todos los templates estan en español argentina, ajustar si es necesario
      },
      components: components.length > 0 ? components : undefined
    }
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error al enviar mensaje de plantilla:', error.response.data);
    res.status(500).json({ success: false, error: error.response.data });
  }
});


async function saveBase64FileAndGetDetails(base64Data, mimeType) {
  const extension = mimeType.split('/')[1];
  const fileName = `file_${Date.now()}.${extension}`;
  const filePath = path.join(__dirname, 'uploads', fileName);

  // Convertir base64 a buffer y guardar el archivo de manera asíncrona
  const buffer = Buffer.from(base64Data, 'base64');
  await fs.writeFile(filePath, buffer);

  // Determinar el tipo basado en el MIME type
  const type = mimeType.startsWith('image/') ? 'image' : 'document';

  // Utilizar una variable de entorno para el URL base (asegúrate de configurar esto cuando despliegues tu servicio)
  const baseUrl = process.env.BASE_URL; // Ejemplo: 'https://tu-servicio.a.run.app'
  
  // Construir y devolver la URL usando el URL base y el nombre del archivo
  const fileUrl = `${baseUrl}/uploads/${fileName}`;

  return { fileUrl, type };
}

app.listen(port, () =>{
   console.log("listening on port " + port);
});