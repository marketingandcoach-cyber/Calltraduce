# Calltraduce
## Prueba en Visual Studio Code

Abre una terminal en `aitranscoice` con Node.js 22 o posterior.

```sh
npm install --no-save --no-package-lock express socket.io
node server.js
```

Visita http://localhost:3000. La traducción original y la voz del navegador siguen disponibles.

### Traducción natural con Meta Model API

Define `MODEL_API_KEY` y `META_MODEL` en el entorno del servidor. Usa una clave y el identificador de un modelo de texto habilitado en tu [panel de Meta](https://dev.meta.ai/). Puedes guardar ambas variables en un archivo local `.env` e iniciar con `node --env-file=.env server.js`. Activa la casilla **Traducción de texto con Meta Model API** para usarla con texto escrito o dictado. Esta modalidad envía el texto a Meta.

### Prueba de voz expresiva

Solicita los artefactos de [SeamlessExpressive](https://github.com/facebookresearch/seamless_communication#seamlessexpressive-models) y sigue la instalación y licencia de Meta. Una vez que funcione `expressivity_predict` en tu entorno Python, define `SEAMLESS_EXPRESSIVE_CLI` con la ruta absoluta de ese ejecutable y reinicia Node. Selecciona español e inglés (EE. UU.) en el orden deseado, carga una grabación WAV propia o autorizada de hasta 5 MB y pulsa **Traducir audio con SeamlessExpressive**.

La prueba genera audio traducido por separado. El modelo busca conservar rasgos como el ritmo, las pausas y el estilo vocal. La semejanza de la voz debe evaluarse con grabaciones reales. Usa esta prueba en localhost.

Para probar una llamada desde telefonía fija, consulta el [piloto con Asterisk](aitranscoice/telefonia/README.md).
