import fetch from 'node-fetch';
import axios from 'axios'; 
import {getFlowiseToken, getFlowiseURL} from './../utils/flowiseApi.mjs'
import dotenv from 'dotenv';

dotenv.config();

const api_ver =  process.env.API_VERSION;

// Array para rastrear números de teléfono que están procesando un mensaje
const processingPhones = [];

async function query(data, phone_number_id) {
    const flowiseApiUrl = getFlowiseURL(phone_number_id);
    const flowiseAuthToken = getFlowiseToken(phone_number_id);

    const response = await fetch(flowiseApiUrl, {
        headers: {
            Authorization: 'Bearer ' + flowiseAuthToken,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
}

async function queryWithRetry(data, phone_number_id, maxRetries = 3, retryDelay = 5000) {
    const flowiseApiUrl = getFlowiseURL(phone_number_id);
    const flowiseAuthToken = getFlowiseToken(phone_number_id);

    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await fetch(flowiseApiUrl, {
                headers: {
                    Authorization: 'Bearer ' + flowiseAuthToken,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.text && result.text.trim() !== "") {
                return result; // Éxito
            }

            console.log(`Intento ${attempt + 1} fallido: Respuesta vacía de Flowise`);
        } catch (error) {
            console.error(`Intento ${attempt + 1} fallido: ${error.message}`);
        }

        attempt++;
        if (attempt < maxRetries) {
            console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }

    throw new Error('Error tras múltiples reintentos: no se pudo obtener respuesta de Flowise.');
}

const handleTextMessage = async (message, phone_number_id) => {
    const text = message.text.body;
    const from = message.from;

    // Verificar si el número de teléfono ya está siendo procesado
    if (processingPhones.includes(from)) {
        console.log(`Mensaje ignorado de ${from}: ya hay un mensaje en proceso`);
        return;
    }

    // Agregar el número de teléfono al array de procesamiento
    processingPhones.push(from);

    console.log(`Mensaje de texto recibido de ${from}: ${text}`);

    try {
        // Preparar el JSON con el formato correcto para la API de Flowise
        const requestData = { 
            question: text,
            overrideConfig:{
                sessionId: phone_number_id + "/" + from
            }
        };

        // Llamar a la API de Flowise con el texto del mensaje
        const flowiseResponse = await queryWithRetry(requestData, phone_number_id, 3, 10000);

        console.log('Respuesta de Flowise:', flowiseResponse.text);

        // Enviar la respuesta de Flowise de vuelta al usuario
        const replyMessage = {
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: {
                body: flowiseResponse.text || "No se pudo obtener una respuesta de Flowise"
            }
        };

        await axios.post(`https://graph.facebook.com/${api_ver}/${phone_number_id}/messages`, replyMessage, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        console.log(`Respuesta enviada a ${from}`);
    } catch (error) {
        console.error('Error al procesar el mensaje de texto:', error);
        // Enviar mensaje de error al usuario si todos los reintentos fallan
        const errorMessage = {
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: {
                body: "Lo sentimos, no pudimos procesar tu mensaje en este momento. Por favor, inténtalo nuevamente en unos minutos."
            }
        };

        try {
            await axios.post(`https://graph.facebook.com/${api_ver}/${phone_number_id}/messages`, errorMessage, {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            });
            console.log(`Mensaje de error enviado a ${from}`);
        } catch (sendError) {
            console.error('Error al enviar el mensaje de error:', sendError);
        }
    } finally {
        // Eliminar el número de teléfono del array de procesamiento
        const index = processingPhones.indexOf(from);
        if (index > -1) {
            processingPhones.splice(index, 1);
        }
    }
};

export default handleTextMessage;