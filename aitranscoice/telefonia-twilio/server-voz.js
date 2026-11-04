const express = require('express');
const { join } = require('node:path');
const { Translate } = require('@google-cloud/translate').v2;
const twilio = require('twilio');
const { translateWithMeta } = require('../meta-translate');

function createApp({ translate, authToken, webhookUrl }) {
  const app = express();
  app.use(express.static(join(__dirname, '../public')));
  app.use(express.urlencoded({ extended: false }));

  function validate(req, res, next) {
    const url = new URL(req.path, webhookUrl).href;
    if (!twilio.validateRequest(authToken, req.get('X-Twilio-Signature') || '', url, req.body)) {
      return res.sendStatus(403);
    }
    next();
  }

  app.post('/voice', validate, (req, res) => {
    const response = new twilio.twiml.VoiceResponse();
    const gather = response.gather({
      input: ['speech'],
      action: '/process-speech',
      language: 'es-ES',
      speechTimeout: 'auto',
      actionOnEmptyResult: true,
    });
    gather.say({ language: 'es-ES' }, 'Bienvenido a AITRANSVOICE. Diga una frase en español.');
    res.type('text/xml').send(response.toString());
  });

  app.post('/process-speech', validate, async (req, res) => {
    const response = new twilio.twiml.VoiceResponse();
    const text = req.body.SpeechResult;
    if (typeof text !== 'string' || !text.trim()) {
      response.say({ language: 'es-ES' }, 'No se detectó voz. Intente nuevamente.');
      response.redirect('/voice');
    } else {
      try {
        const [translation] = await translate.translate(text.trim(), { from: 'es', to: 'en' });
        response.say({ language: 'en-US' }, translation);
      } catch {
        response.say({ language: 'es-ES' }, 'No se pudo completar la traducción.');
      }
    }
    res.type('text/xml').send(response.toString());
  });

  return app;
}

if (require.main === module) {
  const { TWILIO_AUTH_TOKEN, TWILIO_WEBHOOK_ORIGIN = process.env.RENDER_EXTERNAL_URL, MODEL_API_KEY, META_MODEL, PORT = 3000 } = process.env;
  if (!TWILIO_AUTH_TOKEN || !TWILIO_WEBHOOK_ORIGIN) {
    throw new Error('Define TWILIO_AUTH_TOKEN y TWILIO_WEBHOOK_ORIGIN.');
  }
  if (Boolean(MODEL_API_KEY) !== Boolean(META_MODEL)) {
    throw new Error('Define MODEL_API_KEY y META_MODEL juntos para usar Meta.');
  }
  const translate = MODEL_API_KEY
    ? { async translate(text) { return [await translateWithMeta(text, 'es-ES', 'en-US')]; } }
    : new Translate();
  createApp({
    translate,
    authToken: TWILIO_AUTH_TOKEN,
    webhookUrl: new URL(TWILIO_WEBHOOK_ORIGIN),
  }).listen(PORT, () => console.log(`AITRANSVOICE voz en puerto ${PORT}`));
}

module.exports = { createApp };
