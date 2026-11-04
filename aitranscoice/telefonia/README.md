# Piloto de Calltraduce por línea fija

El piloto responde una llamada entrante, pide autorización con la tecla 1, graba hasta diez segundos de español y reproduce el resultado en inglés al mismo interlocutor. Usa la ruta local de SeamlessExpressive y convierte su salida al formato WAV telefónico. La prueba de traducción entre dos personas queda para la siguiente etapa.

## Preparación en un entorno de prueba

1. Instala Asterisk, Python 3 y FFmpeg en la misma máquina que el servidor Node. Activa SeamlessExpressive según el README raíz y verifica primero la ruta de audio en el navegador. El piloto usa el puerto 3000.
2. Instala `calltraduce_agi.py` con permiso de ejecución en el directorio AGI de Asterisk, habitualmente `/var/lib/asterisk/agi-bin`. Crea `/var/spool/asterisk/calltraduce` con acceso de escritura únicamente para la cuenta de servicio de Asterisk.
3. Copia `extensions-calltraduce.conf` al directorio de configuración de Asterisk e inclúyelo desde `extensions.conf`. Graba dos avisos WAV mono a 8 kHz en el subdirectorio `custom` de sonidos de Asterisk. Guarda el primero como `calltraduce-consent.wav` y el segundo como `calltraduce-error.wav`.
   - Consentimiento. «Esta prueba procesa y graba temporalmente tu voz para reproducirla traducida. Si estás de acuerdo, marca uno. Después del tono, habla en español y marca numeral al terminar».
   - Error. «No se pudo traducir el audio. Gracias por llamar».
4. Recarga el dialplan y llama a la extensión privada 600 desde un cliente SIP de prueba. Confirma que sin pulsar 1 se corta la llamada sin grabar. Con consentimiento, verifica el audio traducido y revisa que se eliminen los archivos temporales al colgar.
5. Para una prueba desde teléfono fijo, configura con tu operador una troncal SIP con número dedicado y dirige solo ese número al contexto `calltraduce-piloto`, extensión 600. En RD puedes consultar [Altice SIP Trunking](https://altice.com.do/negocios/soluciones/voz-fija/sip-trunking) o [Claro Troncal Virtual](https://www.claro.com.do/negocios/servicios/voz/troncal-virtual/). Usa la configuración PJSIP y las reglas de red que entregue el operador.

La traducción empieza al terminar cada frase. La fidelidad de voz depende de la grabación telefónica y del modelo. Si el servicio se reinicia abruptamente, elimina cualquier archivo temporal residual antes de reutilizar el piloto.
