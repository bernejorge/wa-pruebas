const handleInteractiveMessage = (message, phone_number_id) => {
   const interactiveData = message.interactive;
   const from = message.from;

   console.log(`Interactive message received from ${from}:`, interactiveData);
   // Lógica para procesar mensajes interactivos
};

export default handleInteractiveMessage;
