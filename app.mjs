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
