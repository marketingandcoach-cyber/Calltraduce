# AITRANSVOICE · servidor telefónico recuperado

El servidor recupera el flujo histórico de Twilio y Google Cloud. Escucha una frase en español y reproduce su traducción en inglés al mismo interlocutor. Usa voz sintética de Twilio.

Desde este directorio, instala las dependencias con `npm install`. Habilita Cloud Translation y configura Application Default Credentials de Google Cloud. Define `TWILIO_AUTH_TOKEN` y `TWILIO_WEBHOOK_ORIGIN` (origen HTTPS público del servidor, sin ruta). Ejecuta `npm start` y configura el webhook de voz de un número de Twilio como `POST /voice` en ese origen. La aplicación valida la firma de los webhooks antes de procesar audio transcrito.

Para probar con una llamada real hacen falta una cuenta y un número Twilio habilitados, el servidor HTTPS accesible y credenciales operativas de Google Cloud. Los proveedores procesan la voz y el texto durante la llamada.
