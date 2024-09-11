import fetch from 'node-fetch'; // Asegúrate de que 'node-fetch' esté instalado

const flowiseApiUrl = "http://149.50.142.145:3001/api/v1/prediction/feddcaa1-24d3-437f-a774-17dc917faa9c";
const flowiseAuthToken = "Bearer qdMWjrAi0bhLyl_7KWkBHwrOtSEyCrHagMCtXvu9XTg";

export const queryFlowise = async (data) => {
    try {
        const response = await fetch(flowiseApiUrl, {
            headers: {
                Authorization: flowiseAuthToken,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error al llamar a Flowise:', error);
        throw error;
    }
};