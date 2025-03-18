import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import webhookRouter from './routes/webhook.mjs';
import toolsRouter from './routes/tools.routes.mjs';
import turnos_routes from './routes/turnos.routes.mjs'
import turnos_hp_route from './routes/turnosHP.route.mjs'
import flow_route from './routes/flows.routes.mjs'
import {envCheck} from './middlewares/testing.middleware.mjs'


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//app.use(bodyParser.json());

app.use(
   express.json({
     // store the raw request body to use it for signature verification
     verify: (req, res, buf, encoding) => {
       req.rawBody = buf?.toString(encoding || "utf8");
     },
   }),
 );

//middleware para quitar los 9 de numeros de telefono en testing
//5493413500536 -> 543413500536
app.use(envCheck);

app.get('/health', (req, res) => {
  const uptimeSeconds = process.uptime(); // Obtener los segundos totales

  // Calcular días, horas, minutos y segundos
  const days = Math.floor(uptimeSeconds / 86400); // 86400 segundos en un día
  let remaining = uptimeSeconds % 86400;

  const hours = Math.floor(remaining / 3600); // 3600 segundos en una hora
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60); // 60 segundos en un minuto
  const seconds = remaining % 60;

  res.json({
    status: 'ok',
    uptime: {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: Number(seconds.toFixed(2)) // Mantener 2 decimales para los segundos
    },
    timestamp: Date.now()
  });
});

app.get('/', async (req, res) => {
   res.json({
      message: "Bienvenido whatapp testing api v1.022 ..."
   });
 });

app.use(webhookRouter);

app.use(toolsRouter);

app.use(turnos_routes);

app.use(turnos_hp_route);

app.use(flow_route);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
