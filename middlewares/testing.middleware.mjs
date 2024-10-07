// middleware/envCheck.mjs
export const envCheck = (req, res, next) => {
   if (process.env.NODE_ENV === 'testing') {
       console.log('Testing environment detected');
       
       // Verificamos si es una solicitud POST al webhook
       if (req.method === 'POST' && req.url === '/webhook') {
           const body = req.body;

           if (body.object && body.entry) {
               body.entry.forEach(entry => {
                   const changes = entry.changes;

                   changes.forEach(change => {
                       const value = change.value;

                       if (value.messages) {
                           value.messages.forEach(message => {
                               if (message.from.startsWith('549')) {
                                   console.log(`Modificando número de ${message.from} a ${'54' + message.from.slice(3)}`);
                                   message.from = '54' + message.from.slice(3); // Modificamos el número
                               }
                           });
                       }
                   });
               });
           }
       }
   }

   next();
}
