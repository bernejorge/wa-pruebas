import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const handleButtonMessage = async (message) => {
   const buttonPayload = message.button.payload;
   const context = message.context;
   const from = message.from;

   console.log(`Mensaje tipo Button recibido de ${from}: ${buttonPayload}`);
   // Lógica adicional para procesar mensajes de botón

   const body = {
      wamid: context.id,
      phone_number: message.from,
      text_boton: buttonPayload,
      payload: message
   }   
   console.log("body_request = ", body);

    // Enviar el body al backend
    try {
      const url = process.env.BACKEND_API_URL + '/' + process.env.BACKEND_WEBHOOK_RESPONSE;
      const response = await axios.post(process.env.BACKEND_API_URL, body);
      console.log('Response from backend:', response.data);
   } catch (error) {
      console.error('Error sending request to backend:', error.message);
   }
};

export default handleButtonMessage;
