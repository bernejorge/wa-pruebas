import fetch from "node-fetch"; // Asegúrate de que 'node-fetch' esté instalado

export const queryFlowise = async (data, phone_number_id) => {

  const flowiseApiUrl = getFlowiseURL(phone_number_id);
  const flowiseAuthToken = getFlowiseToken(phone_number_id);

  try {
    const response = await fetch(flowiseApiUrl, {
      headers: {
        Authorization: "Bearer " + flowiseAuthToken,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error al llamar a Flowise:", error);
    throw error;
  }
};

export const getFlowiseURL = (phone_number_id) => {
    const flowiseApiUrl = (phone_number_id == '330861496787830' ? process.env.FLOWISE_API_URL : process.env.FLOWISE_API_URL2) ;
    return flowiseApiUrl;
}

export const getFlowiseToken = (phone_number_id) => {
    //por el momento usamos un mismo token para ambos chatbots
    const flowiseAuthToken = process.env.FLOWISE_AUTH_TOKEN;
    if(flowiseAuthToken)
    return flowiseAuthToken;
}