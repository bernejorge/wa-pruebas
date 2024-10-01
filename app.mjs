import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import webhookRouter from './routes/webhook.mjs';
import toolsRouter from './routes/tools.routes.mjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', async (req, res) => {
   res.json({
      message: "Bienvenido whatapp testing api v1.022 ..."
   });
 });

app.use(webhookRouter);

app.use(toolsRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
