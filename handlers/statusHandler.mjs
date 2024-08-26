const handleMessageStatus = (status) => {
   const { id, status: messageStatus, timestamp, recipient_id } = status;

   switch (messageStatus) {
       case 'sent':
           console.log(`Message ${id} sent to ${recipient_id} at ${timestamp}`);
           // Lógica adicional para manejar el estado "sent"
           break;
       case 'delivered':
           console.log(`Message ${id} delivered to ${recipient_id} at ${timestamp}`);
           // Lógica adicional para manejar el estado "delivered"
           break;
       case 'read':
           console.log(`Message ${id} read by ${recipient_id} at ${timestamp}`);
           // Lógica adicional para manejar el estado "read"
           break;
       case 'failed':
           console.log(`Message ${id} failed to send to ${recipient_id} at ${timestamp}`);
           // Lógica adicional para manejar el estado "failed"
           break;
       default:
           console.log(`Unhandled message status: ${messageStatus}`);
   }
};

export default handleMessageStatus;
