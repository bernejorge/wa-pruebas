const handleTextMessage = (message) => {
   const text = message.text.body;
   const from = message.from;

   console.log(`Mensaje de texto recivido de ${from}: ${text}`);
   // Lógica para procesar mensajes de texto
};

export default handleTextMessage;
