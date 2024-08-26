const handleInteractiveMessage = (message) => {
   const interactiveData = message.interactive;
   const from = message.from;

   console.log(`Interactive message received from ${from}:`, interactiveData);
   // Lógica adicional para procesar mensajes interactivos
};

export default handleInteractiveMessage;
