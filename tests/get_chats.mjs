import fs from 'fs';
import path from 'path';
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

// Configuración del cliente de PostgreSQL
const pool = new Pool({
  //  host: process.env.PG_HOST || "172.29.238.51", // Solo una vez, IP del servidor o variable de entorno
  //  user: process.env.PG_USER || "admin",
  //  database: process.env.PG_DB || "vector_commerce",
  //  password: process.env.PG_PASSWORD || "admin",
  //  port: process.env.PG_PORT || 5432,
    host: "172.29.230.73", // Solo una vez, IP del servidor o variable de entorno
    user: "admin",
    database: "vector_commerce",
    password: "Tips2024PG01",
    port: 5432,
});

async function getMessages(startDate, endDate) {
  const query = `
    SELECT 
      chat_message."sessionId",
      json_agg(
          jsonb_build_object(
              'id', chat_message.id,
              'role', chat_message.role,
              'chatflowid', chat_message.chatflowid,
              'content', chat_message.content,
              'sourceDocuments', chat_message."sourceDocuments",
              'createdDate', chat_message."createdDate",
              'chatType', chat_message."chatType",
              'chatId', chat_message."chatId",
              'memoryType', chat_message."memoryType",
              'sessionId', chat_message."sessionId",
              'usedTools', chat_message."usedTools",
              'fileAnnotations', chat_message."fileAnnotations",
              'fileUploads', chat_message."fileUploads",
              'leadEmail', chat_message."leadEmail",
              'agentReasoning', chat_message."agentReasoning",
              'action', chat_message.action,
              'artifacts', chat_message.artifacts
          ) ORDER BY chat_message."createdDate"
      ) AS messages,
      MIN(chat_message."createdDate") AS session_start,
      MAX(chat_message."createdDate") AS session_end
    FROM 
      public.chat_message
    WHERE 
      chat_message."createdDate" BETWEEN $1 AND $2 AND
      chat_message."sessionId" like '%377253802146492%'
    GROUP BY 
      chat_message."sessionId"
    ORDER BY 
      session_start;
  `;

  try {
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  } catch (err) {
    console.error('Error ejecutando la consulta', err);
    throw err;
  }
}

function saveMessagesToFile(data) {
   data.forEach((element, index) => {
     const messagesString = JSON.stringify(element.messages, null, 2);
 
     // Crear el contenido del archivo
     const fileContent = `
     """${messagesString}"""
     
     La conversión de arriba es una conversación entre un usuario y un agente virtual.
     Tu objetivo es determinar si el usuario pudo resolver su consulta.
     `;
 
     // Crear un nombre de archivo único, usando el sessionId o el índice
     let fileName = `conversation_${element.sessionId || index}.txt`;
     fileName = fileName.replace('/', '_');
     // Guardar el archivo en el directorio actual
     const filePath = path.join(process.cwd(), fileName);
 
     try {
       fs.writeFileSync(filePath, fileContent);
       console.log(`Archivo ${fileName} creado con éxito.`);
     } catch (err) {
       console.error(`Error creando el archivo ${fileName}:`, err);
     }
   });
 }
// Llamar la función
getMessages('2024-11-09', '2024-11-10')
  .then(data => {
   saveMessagesToFile(data);
  })
  .catch(err => {
    console.error('Error', err);
  });
