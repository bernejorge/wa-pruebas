import pkg from "pg";
import { v4 as uuidv4 } from "uuid"; // Librería para generar UUID
const { Pool } = pkg;
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Configurar la API de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
  host: process.env.PG_HOST || "172.29.230.73", // Solo una vez, IP del servidor o variable de entorno
  user: process.env.PG_USER || "admin",
  database: process.env.PG_DB || "vector_commerce",
  password: process.env.PG_PASSWORD || "Tips2024PG01",
  port: process.env.PG_PORT || 5432,
});

// Búsqueda por similitud utilizando el campo de embedding
export const searchByEmbedding = async (inputText, tableName, limit = 40) => {
  try {
    // Generar el embedding del texto de entrada usando OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small", // "text-embedding-ada-002",
      input: inputText,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Realizar la consulta a la base de datos ordenada por similitud de embeddings (distancia coseno)
    const query = `
      SELECT id, "pageContent"
      FROM ${tableName}
      ORDER BY embedding <=> $1
      LIMIT $2;
    `;

    // Ejecutar la consulta pasando el embedding de entrada
    const result = await pool.query(query, [`[${embedding.join(",")}]`, limit]);

    return result.rows;
  } catch (error) {
    console.error("Error al hacer la búsqueda por embedding:", error);
    throw error;
  }
};

export const getGroupByCentro = async (inputText, tableName, limit = 40) => {
  try {
    // Llamar a searchByEmbedding con el texto de entrada
    const results = await searchByEmbedding(inputText, tableName, limit);

    // Objeto para agrupar los datos por CentroDeAtencion
    const groupedData = {};

    results.forEach((row) => {
      // Parsear el campo pageContent
      const parsedContent = parsePageContent(row.pageContent);

      const {
        Origen,
        Institucion,
        IdCentroAtencion,
        CentroDeAtencion,
        IdProfesional,
        Profesional,
        IdServicio,
        Servicio,
      } = parsedContent;

      // Si el CentroDeAtencion no existe en groupedData, inicializarlo
      const key = `${IdCentroAtencion}-${CentroDeAtencion}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          Institucion,
          IdCentroAtencion: Number(IdCentroAtencion),
          CentroDeAtencion,
          Profesionales: [],
        };
      }

      // Agregar el profesional a la lista de profesionales
      groupedData[key].Profesionales.push({
        Origen,
        IdProfesional: Number(IdProfesional),
        Profesional,
        IdServicio: Number(IdServicio),
        Servicio,
      });
    });

    // Convertir groupedData en un array
    const groupedDataArray = Object.values(groupedData);

    return groupedDataArray;
  } catch (error) {
    console.error("Error al obtener y agrupar los datos:", error);
    throw error;
  }
};

// Función para parsear el campo pageContent
const parsePageContent = (pageContent) => {
  const lines = pageContent.split("\n");
  const data = {};

  lines.forEach((line) => {
    const [key, ...rest] = line.split(": ");
    if (key && rest.length > 0) {
      data[key.trim()] = rest.join(": ").trim();
    }
  });

  return data;
};
