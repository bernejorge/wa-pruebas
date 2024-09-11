import handleTextMessage from "./textHandler.mjs";
import handleButtonMessage from "./buttonHandler.mjs";
import handleInteractiveMessage from "./interactiveHandler.mjs";
import handleMessageStatus from "./statusHandler.mjs";
import handleMediaMessage from "./mediaHandler.mjs"; 

const messageHandler = (message, phone_number_id) => {
  if (message.text) {
    handleTextMessage(message, phone_number_id); // Pasa el phone_number_id
  } else if (message.button) {
    handleButtonMessage(message, phone_number_id);
  } else if (message.interactive) {
    handleInteractiveMessage(message, phone_number_id);
  } else if (message.statuses) {
    message.statuses.forEach(handleMessageStatus);
  } else if (message.image || message.video || message.audio || message.document || message.sticker) {
    handleMediaMessage(message, phone_number_id); 
  } else {
    console.log("Tipo de mensaje no manejado:", message);
  }
};

export default messageHandler;
