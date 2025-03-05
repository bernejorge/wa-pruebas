import fetch from "node-fetch"; // Asegúrate de que 'node-fetch' esté instalado
import axios from 'axios';
import { toZonedTime } from 'date-fns-tz';
import { recuperarUltimoMensaje } from './profesionales_servicio.mjs'

export const queryFlowise = async (data, phone_number_id) => {

  const flowiseApiUrl = getFlowiseURL(phone_number_id);
  const flowiseAuthToken = getFlowiseToken(phone_number_id);

  try {
    const response = await fetch(flowiseApiUrl, {
      headers: {
        Authorization: "Bearer " + flowiseAuthToken,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error al llamar a Flowise:", error);
    throw error;
  }
};

export const getFlowiseURL = (phone_number_id) => {
  //HP => FLOWISE_API_URL
  //HRF => FLOWISE_API_URL2
    const flowiseApiUrl = (phone_number_id == '330861496787830' ? process.env.FLOWISE_API_URL : process.env.FLOWISE_API_URL2) ;
    return flowiseApiUrl;
}

export const getFlowiseToken = (phone_number_id) => {
    //por el momento usamos un mismo token para ambos chatbots
    const flowiseAuthToken = process.env.FLOWISE_AUTH_TOKEN;
    if(flowiseAuthToken)
    return flowiseAuthToken;
}

/**
 * Función para verificar la antigüedad del último mensaje en una sesión.
 * @param {string} sessionId - ID de la sesión.
 * @param {number} tiempoLimiteMinutos - Tiempo límite en minutos para considerar un mensaje como viejo.
 * @returns {Object} Resultado de la operación.
 */
export const checkUltimoMensajeDeSesion = async (sessionId) => {
  try {
    // Recuperar el último mensaje de la sesión
    const ultimoMensaje = await recuperarUltimoMensaje(sessionId);

    if (!ultimoMensaje) {
      console.log("No se encontró ningún mensaje para esta sesión.");
      return { mensaje: null }; // No hay mensajes para este sessionId
    }

    // Definir la zona horaria de Argentina
    const timeZone = 'America/Argentina/Buenos_Aires'; // Zona horaria para Argentina

    // Convertir la fecha del mensaje a la zona horaria de Argentina
    const createdDateUTC = new Date(ultimoMensaje.createdDateLocal); 
    const createdDateLocal = createdDateUTC; //toZonedTime(createdDateUTC, timeZone);

    // Obtener la fecha actual en la zona horaria de Argentina
    const nowUTC = new Date();
    const nowLocal = toZonedTime(nowUTC, timeZone);

    // Calcular la antigüedad del mensaje en minutos
    const antiguedadEnMinutos = Math.floor((nowLocal - createdDateLocal) / (1000 * 60));

    // Logs de información
    console.log(`Fecha del mensaje (Argentina):`, createdDateLocal);
    console.log(`Fecha actual (Argentina):`, nowLocal); // Log de la fecha actual
    console.log(`Antigüedad en minutos: ${antiguedadEnMinutos}`);

    // Devolver la antigüedad y el mensaje
    return {
      mensaje: ultimoMensaje,
      antiguedadEnMinutos
    };
  } catch (error) {
    console.error("Error al verificar el último mensaje de la sesión:", error);
    throw error;
  }
};

export const checkAntiguedadUltimoMensaje = async (sessionId, tiempoLimiteMinutos = 60) => {
  try {
    // Llamar a checkUltimoMensajeDeSesion para obtener el último mensaje y su antigüedad
    const { mensaje, antiguedadEnMinutos } = await checkUltimoMensajeDeSesion(sessionId);

    if (!mensaje) {
      console.log("No se encontró ningún mensaje para esta sesión.");
       return {
        mensaje: "No hay mensajes"
      }
    }

    const { chatId, chatflowid , chatType } = mensaje;

    // Comprobar si la antigüedad supera el límite
    const esMayorQueLimite = antiguedadEnMinutos > tiempoLimiteMinutos;

    // Log de la verificación
    console.log(`El mensaje tiene una antigüedad de ${antiguedadEnMinutos} minutos.`);
    console.log(`¿Es mayor al límite de ${tiempoLimiteMinutos} minutos? ${esMayorQueLimite}`);
    console.log(`Chat ID: ${chatId}, Chatflow ID: ${chatflowid}, Chat Type: ${chatType}`);

    if (esMayorQueLimite) {
      const authToken = process.env.FLOWISE_AUTH_TOKEN;
      const baseUrl = process.env.FLOWISE_URL;
      const endpoint = `/api/v1/chatmessage/${chatflowid }`;
      const url = 
        `${baseUrl}${endpoint}?chatflowid=${chatflowid }&isClearFromViewMessageDialog=true&chatId=${encodeURIComponent(chatId)}&chatType=${chatType}&memoryType=Postgres+Agent+Memory&sessionId=${encodeURIComponent(sessionId)}`;

      //console.log(`URL construida para la API: ${url}`);

      try {
        // Realizar la llamada DELETE a la API usando axios
        const response = await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        console.log(`Respuesta de la API:`, response.data);
      } catch (apiError) {
        console.error("Error al realizar la llamada DELETE a la API:", apiError);
      }
      return {
        mensaje: "memoria borrada"
      }
    }else{
      return {
        mensaje: "No hay mensajes viejos."
      }
    }
    
  } catch (error) {
    console.error("Error al comprobar la antigüedad del último mensaje:", error);
    throw error;
  }
};