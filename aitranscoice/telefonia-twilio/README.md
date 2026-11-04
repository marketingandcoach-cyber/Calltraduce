# AITRANSVOICE · servidor telefónico recuperado

El servidor recupera el flujo histórico de Twilio y Google Cloud. Escucha una frase en español y reproduce su traducción en inglés al mismo interlocutor. Usa voz sintética de Twilio.

Desde este directorio, instala las dependencias con `npm install`. Para usar Meta Model API, define `MODEL_API_KEY` y `META_MODEL` juntos. Si omites ambos, habilita Cloud Translation y configura Application Default Credentials de Google Cloud. Define `TWILIO_AUTH_TOKEN` y `TWILIO_WEBHOOK_ORIGIN` (origen HTTPS público del servidor, sin ruta). Ejecuta `npm start` y configura el webhook de voz de un número de Twilio como `POST /voice` en ese origen. La aplicación valida la firma de los webhooks antes de procesar audio transcrito.

Para probar con una llamada real hacen falta una cuenta y un número Twilio habilitados, el servidor HTTPS accesible y credenciales operativas de Meta Model API o Google Cloud. Los proveedores procesan la voz y el texto durante la llamada.

Meta Model API traduce la transcripción de la llamada. La salida telefónica usa la voz sintética de Twilio. La prueba de SeamlessExpressive, que recibe un WAV, se ejecuta aparte desde la interfaz web.

## Despliegue en Render

[Desplegar AITRANSVOICE en Render](https://render.com/deploy?repo=https://github.com/marketingandcoach-cyber/Calltraduce)

Completa los campos `TWILIO_AUTH_TOKEN`, `MODEL_API_KEY` y `META_MODEL` en Render. Una vez que el servicio esté activo, configura la URL HTTPS que te asigna Render, seguida de `/voice`, como webhook entrante de tu número de Twilio (método POST). El servicio usa su URL externa de Render para verificar la firma de Twilio. Para un dominio personalizado, fija `TWILIO_WEBHOOK_ORIGIN` a ese origen.
