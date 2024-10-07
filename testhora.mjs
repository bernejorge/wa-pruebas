function obtenerHoraArgentina() {
   const timeZone = 'America/Argentina/Buenos_Aires';
   const options = {
       timeZone: timeZone,
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       weekday: 'long',
       hour: '2-digit',
       minute: '2-digit',
       second: '2-digit',
       hour12: true
   };
   const hoy = new Date();
   const fechaFormateada = hoy.toLocaleString('es-AR', options);
   const resultado = {
       "fechaFormateada": fechaFormateada,
       "zonaHoraria": timeZone
   };
   return JSON.stringify(resultado);
}

console.log(obtenerHoraArgentina());