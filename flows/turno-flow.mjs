

// To navigate to a screen, return the corresponding response from the endpoint. Make sure the response is enccrypted.
const SCREEN_RESPONSES = {
   APPOINTMENT: {
       "screen": "APPOINTMENT",
       "data": {}
   },
   COBERTURAS: {
       "screen": "COBERTURAS",
       "data": {
           "dni": "29066913",
           "coberturas": [
               {
                   "id": "1",
                   "title": "Particular"
               },
               {
                   "id": "2",
                   "title": "SWISS MEDICAL"
               },
               {
                   "id": "3",
                   "title": "OSDE"
               }
           ]
       }
   },
   SUCCESS: {
       "screen": "SUCCESS",
       "data": {
           "extension_message_response": {
               "params": {
                   "flow_token": "REPLACE_FLOW_TOKEN",
                   "some_param_name": "PASS_CUSTOM_VALUE"
               }
           }
       }
   },
};

export const getNextScreenTurnos = async (decryptedBody) => {
   const { screen, data, version, action, flow_token } = decryptedBody;
   // handle health check request
   if (action === "ping") {
     return {
       data: {
         status: "active",
       },
     };
   }

   // handle error notification
   if (data?.error) {
      console.warn("Received client error:", data);
      return {
        data: {
          acknowledged: true,
        },
      };
    }

    // handle initial request when opening the flow and display APPOINTMENT screen
   if (action === "INIT") {
      return {
        ...SCREEN_RESPONSES.APPOINTMENT
      };
    }

    if (action === "data_exchange") {
      // handle the request based on the current screen

      switch (screen) {
         case "APPOINTMENT":

            return{
               ...SCREEN_RESPONSES.COBERTURAS,
               data: {
                  dni: data.dni,
                  coberturas: [
                     {
                        "id": "10",
                        "title": "Particular"
                    },
                    {
                        "id": "20",
                        "title": "SWISS MEDICAL"
                    }
                  ]
               }
            }
            break;
         case "COBERTURAS":
            
         return {

         }
            break;
      

         default:
            break;
      }

    }
}