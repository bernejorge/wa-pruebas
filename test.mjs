import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
// Configurar la API de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Asegúrate de que la API key esté configurada
});

export const generateEmbedding = async (productName) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", //"text-embedding-ada-002",
      input: productName,
      encoding_format: "float",  // Opcional, puede depender del uso
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generando embedding:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const emb = await generateEmbedding('Servicio: REUMATOLOGIA');

console.log(emb.join(','));