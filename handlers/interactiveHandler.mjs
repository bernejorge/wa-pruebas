import { Json } from "sequelize/lib/utils";
import {procesarDNI} from './flows-handlers/dniHandler.mjs'

const handleInteractiveMessage = async (message, phone_number_id) => {
   const interactiveData = message.interactive;
   const data = JSON.parse(interactiveData.nfm_reply.response_json);

   data.phone_number = message.from;

   if (data.pantalla){
      switch (data.pantalla) {
         case "dni":
            await procesarDNI(data);
            break;
      
         case "cobertura":

            break;
         
         case "buscar_turno":

            break;
         
         default:
            break;
      }
   }
   const from = message. from;


   console.log(`Interactive message received from ${from}:`, interactiveData);
   // Lógica para procesar mensajes interactivos
};

export default handleInteractiveMessage;
