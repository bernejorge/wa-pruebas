import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { queryFlowise } from '../utils/flowiseApi.mjs'; 
import path from 'path';

import dotenv from 'dotenv';

dotenv.config();

const api_ver =  process.env.API_VERSION;

const handleMediaMessage = async (message, phone_number_id) => {
    const from = message.from;

    try {
        const mediaType = Object.keys(message).find(key => ['image', 'video', 'audio', 'document', 'sticker'].includes(key));
        const media = message[mediaType];

        console.log(`Mensaje de tipo media recibido de ${from}: ${mediaType}`);

        // Si el archivo no es de audio, enviar un mensaje indicando que solo procesamos audios
        if (mediaType !== 'audio') {
            console.log('Solo procesamos archivos de audio.');
            await sendMessage(phone_number_id, from, "Por el momento, solo procesamos archivos de audio.");
            return;
        }

        // Descargar el archivo de audio desde WhatsApp
        const mediaUrl = await getMediaUrl(media.id);
        const filePath = await downloadMedia(mediaUrl, media.id);

        // Verificar si hubo error en la descarga del archivo
        if (!filePath) {
            throw new Error("Error al descargar el archivo de audio.");
        }

        // Transcribir el audio con OpenAI
        const transcription = await transcribeAudio(filePath);
        console.log("Transcripcion => " + transcription);

        // Enviar la transcripción a Flowise
        const flowiseResponse = await queryFlowise({
            question: transcription,
            overrideConfig: { sessionId: phone_number_id + "/" + from }
        }, phone_number_id);

        const flowiseAnswer = flowiseResponse.text || "No se pudo obtener una respuesta de Flowise";

        // Enviar la respuesta de Flowise al usuario
        await sendMessage(phone_number_id, from, flowiseAnswer);

        // Eliminar archivos antiguos (más de 24 horas)
        deleteOldFiles('./downloads', 24);
    } catch (error) {
        console.error('Error en el procesamiento del mensaje multimedia:', error);

        // Enviar un mensaje al usuario explicando que hay problemas técnicos
        await sendMessage(phone_number_id, from, "Estamos teniendo inconvenientes técnicos para procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.");
    }
};

// Función para obtener la URL del archivo multimedia
const getMediaUrl = async (mediaId) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/${api_ver}/${mediaId}`, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`
            }
        });
        return response.data.url;
    } catch (error) {
        console.error('Error al obtener la URL del archivo multimedia:', error);
        throw error; // Lanzar el error para que sea capturado en el try-catch principal
    }
};

// Función para descargar el archivo multimedia
const downloadMedia = async (mediaUrl, mediaId) => {
    const downloadsDir = './downloads';
    const filePath = path.join(downloadsDir, `${mediaId}.ogg`); // Guardar el archivo como .ogg

    // Verificar si la carpeta 'downloads' existe, y crearla si no es así
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const writer = fs.createWriteStream(filePath);

    try {
        const response = await axios({
            url: mediaUrl,
            method: 'GET',
            responseType: 'stream',
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`
            }
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error al descargar el archivo multimedia:', error);
        throw error; // Lanzar el error para que sea capturado en el try-catch principal
    }
};

// Función para transcribir el archivo de audio con OpenAI
const transcribeAudio = async (filePath) => {
    const apiKey = process.env.OPENAI_API_KEY; 

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'whisper-1'); // modelo de transcripción

    try {
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...formData.getHeaders(),
            },
        });

        return response.data.text; // La transcripción del audio
    } catch (error) {
        console.error('Error al transcribir el audio:', error);
        throw error; // Lanzar el error para que sea capturado en el try-catch principal
    }
};

// Función para enviar mensajes de WhatsApp
const sendMessage = async (phone_number_id, to, messageBody) => {
    const replyMessage = {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
            body: messageBody
        }
    };

    try {
        await axios.post(`https://graph.facebook.com/v20.0/${phone_number_id}/messages`, replyMessage, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        console.log(`Mensaje enviado a ${to}`);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
};

const deleteOldFiles = (directoryPath, maxFileAgeInHours) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error al leer el directorio:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directoryPath, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error al obtener la información del archivo:', err);
                    return;
                }

                const now = Date.now();
                const fileModifiedTime = new Date(stats.mtime).getTime();
                const ageInHours = (now - fileModifiedTime) / (1000 * 60 * 60);

                if (ageInHours > maxFileAgeInHours) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error al eliminar el archivo:', err);
                        } else {
                            console.log(`Archivo eliminado: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
};

export default handleMediaMessage;
