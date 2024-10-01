import { Json } from 'sequelize/lib/utils';
import { searchByEmbedding } from './utils/profesionales_servicio.mjs'; // Importa la función searchByEmbedding desde el módulo correspondiente

import dotenv from 'dotenv';
dotenv.config();

export const getGroupedData = async (inputText) => {
  try {
    // Llamar a searchByEmbedding con el texto de entrada
    const results = await searchByEmbedding(inputText);

    // Objeto para agrupar los datos por CentroDeAtencion
    const groupedData = {};

    results.forEach((row) => {
      // Parsear el campo pageContent
      const parsedContent = parsePageContent(row.pageContent);

      const {
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
        IdProfesional: Number(IdProfesional),
        Profesional,
        IdServicio: Number(IdServicio),
        Servicio,
      });
    });

    // Convertir groupedData en un array si es necesario
    const groupedDataArray = Object.values(groupedData);

    return groupedDataArray;
  } catch (error) {
    console.error('Error al obtener y agrupar los datos:', error);
    throw error;
  }
};

// Función para parsear el campo pageContent
const parsePageContent = (pageContent) => {
  const lines = pageContent.split('\n');
  const data = {};

  lines.forEach((line) => {
    const [key, ...rest] = line.split(': ');
    if (key && rest.length > 0) {
      data[key.trim()] = rest.join(': ').trim();
    }
  });

  return data;
};

const res = await getGroupedData("Cardiologia");
console.log(JSON.stringify(res));
console.dir(res, {depth: null, colors: true})
