import axios from 'axios';
import http from 'http';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const maxSockets = parseInt(process.env.MAX_SOCKETS) || 10;

// agentes con keepAlive y maxSockets
const httpAgent = new http.Agent({ 
  keepAlive: true, 
  maxSockets: maxSockets 
});

const httpsAgent = new https.Agent({ 
  keepAlive: true, 
  maxSockets: 10 
});

// Creamos una instancia de axios que utilizará dichos agentes
const axiosInstance = axios.create({
  httpAgent,
  httpsAgent
});

export default axiosInstance;
