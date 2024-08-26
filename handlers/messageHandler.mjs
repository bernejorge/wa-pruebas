import handleTextMessage from "./textHandler.mjs";
import handleButtonMessage from "./buttonHandler.mjs";
import handleInteractiveMessage from "./interactiveHandler.mjs";
import handleMessageStatus from "./statusHandler.mjs";

const messageHandler = (message) => {
  if (message.text) {
    handleTextMessage(message);
  } else if (message.button) {
    handleButtonMessage(message);
  } else if (message.interactive) {
    handleInteractiveMessage(message);
  } else if (message.statuses) {
    message.statuses.forEach(handleMessageStatus);
  } else {
    console.log("Tipo de mensaje no manejado:", message);
  }
};

export default messageHandler;
