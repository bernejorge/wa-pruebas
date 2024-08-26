import express from 'express';
import messageHandler from '../handlers/messageHandler.mjs';
import handleMessageStatus from '../handlers/statusHandler.mjs';

const router = express.Router();

// Ruta GET para la verificación del webhook
router.get('/webhook', (req, res) => {
    const verify_token = process.env.VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === verify_token) {
        console.log('Webhook verified successfully');
        res.status(200).send(challenge);
    } else {
        console.log('Webhook verification failed');
        res.sendStatus(403);
    }
});

// Ruta POST para recibir las notificaciones del webhook
router.post('/webhook', (req, res) => {
    const body = req.body;

    console.log('Webhook received:', body);

    if (body.object && body.entry) {
        body.entry.forEach(entry => {
            const changes = entry.changes;

            changes.forEach(change => {
                const value = change.value;

                if (value.messages) {
                    value.messages.forEach(message => {
                        messageHandler(message);
                    });
                }

                if (value.statuses) {
                    value.statuses.forEach(status => {
                        handleMessageStatus(status);
                    });
                }
            });
        });
    }

    res.sendStatus(200);
});

export default router;
