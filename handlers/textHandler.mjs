import fetch from 'node-fetch';
import axios from 'axios'; 
import {getFlowiseToken, getFlowiseURL} from './../utils/flowiseApi.mjs'
import dotenv from 'dotenv';

dotenv.config();

const api_ver =  process.env.API_VERSION;

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

const handleTextMessage = async (message, phone_number_id) => {
    const text = message.text.body;
    const from = message.from;

    console.log(`Mensaje de texto recibido de ${from}: ${text}`);

    // Preparar el JSON con el formato correcto para la API de Flowise
    const requestData = { 
        question: text,
        overrideConfig:{
            sessionId: phone_number_id + "/" + from
        }
    };

    // Llamar a la API de Flowise con el texto del mensaje
    try {
        const flowiseResponse = await query(requestData, phone_number_id);
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
    }
};

export default handleTextMessage;
