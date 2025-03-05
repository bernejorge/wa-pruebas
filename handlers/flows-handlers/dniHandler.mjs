import axios from "axios";

export const procesarDNI = async (data) => {
   try {
      const dni = data.dni;
      const fromToken = "webhook"; // El token de acceso está en los headers

      // Llamada a la API para validar el DNI
      const apiUrl = `${process.env.API_BASE_URL}/api/Meta/ValidarDNI`;
      const response = await axios.post(apiUrl, null, {
         params: { DNI: dni },
         headers: { From: fromToken },
      });

      console.log(response.data);

      // Mapear las coberturas extrayendo solo id y NombreFinanciador (renombrado a title)
      const coberturas = response.data.Coberturas;
      const coberturasFlow = coberturas.map(c => ({
         id: c.Id.toString(),
         title: c.NombreFinanciador
      }));

      // Construir el payload que se enviará en el mensaje interactivo
      const dataPayload = {
         dni: dni,
         IdPersona: response.data.IdPersona,
         coberturas: coberturasFlow
      };

      const payload = {
         messaging_product: "whatsapp",
         to: "543413500536",
         recipient_type: "individual",
         type: "interactive",
         interactive: {
            type: "flow",
            body: {
               text: "hello"
            },
            action: {
               name: "flow",
               parameters: {
                  mode: "draft",
                  flow_message_version: "3",
                  flow_token: "TIPS2005",
                  flow_id: "1809350546521232",
                  flow_cta: "Insert",
                  flow_action: "navigate",
                  flow_action_payload: {
                     screen: "COBERTURAS",
                     data: dataPayload
                  }
               }
            }
         }
      };

      // URL de Facebook para enviar mensajes de WhatsApp
      const whatsappUrl = 'https://graph.facebook.com/v22.0/371940746003639/messages';

      // Enviar el mensaje interactivo a WhatsApp
      const fbResponse = await axios.post(whatsappUrl, payload, {
         headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer EAARLbvN5K80BO8ZBCoaxffw9zosieEhXVh7QVUEqZAFxfnslLZA00wDMwRwBzH7sR2fOv44HBwyuS3JnTJE1Rt2gZAnfHIG7cGynSjZAHZBG9NRZAuRQlGIyPZAjdrWhv5PLflrlFCnyD2ZACresOBR09ZAU5TUf06Eo8E82ObfqRymT2DswPIBLOc35cICy3DQfJZAMgZDZD'
         }
      });

      console.log(fbResponse.data);

      //TODO: Enviar flow con las coberturas o mensaje de que no está empadronado

   } catch (error) {
      console.error(error);
   }
}
