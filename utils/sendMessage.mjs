import axios from 'axios';

export const sendMessage = async (phone_number_id, to, messageBody) => {
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

        console.log(`Respuesta enviada a ${to}`);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
};
