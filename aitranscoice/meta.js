const express = require('express');
const { translateWithMeta } = require('./meta-translate');
const { execFile } = require('node:child_process');
const { mkdtemp, readFile, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { promisify } = require('node:util');

const run = promisify(execFile);
const router = express.Router();
let voiceBusy = false;

router.get('/capabilities', (req, res) => {
    res.json({
        text: Boolean(process.env.MODEL_API_KEY && process.env.META_MODEL),
        voice: Boolean(process.env.SEAMLESS_EXPRESSIVE_CLI),
    });
});

router.post('/translate', express.json({ limit: '24kb' }), async (req, res) => {
    const { text, from, to } = req.body ?? {};
    const locale = /^[a-z]{2,3}-[A-Z]{2}$/;
    if (typeof text !== 'string' || !text.trim() || text.length > 5000 ||
        typeof from !== 'string' || typeof to !== 'string' || !locale.test(from) || !locale.test(to)) {
        return res.status(400).json({ error: 'Texto o idioma inválido.' });
    }
    const { MODEL_API_KEY, META_MODEL } = process.env;
    if (!MODEL_API_KEY || !META_MODEL) {
        return res.status(503).json({ error: 'Configura Meta Model API en el servidor.' });
    }

    try {
        const translation = await translateWithMeta(text, from, to);
        res.json({ translation });
    } catch {
        res.status(502).json({ error: 'Meta Model API no pudo completar la traducción.' });
    }
});

router.post('/expressive', express.raw({ type: 'audio/wav', limit: '5mb' }), async (req, res) => {
    const cli = process.env.SEAMLESS_EXPRESSIVE_CLI;
    if (!cli) return res.status(503).json({ error: 'SeamlessExpressive requiere configuración.' });
    const { from, to } = req.query;
    const target = from === 'es-ES' && to === 'en-US' ? 'eng'
        : from === 'en-US' && to === 'es-ES' ? 'spa' : null;
    const audio = req.body;
    if (!target || !Buffer.isBuffer(audio) || audio.length < 44 ||
        audio.toString('ascii', 0, 4) !== 'RIFF' || audio.toString('ascii', 8, 12) !== 'WAVE') {
        return res.status(400).json({ error: 'Selecciona español ↔ inglés (EE. UU.) y un archivo WAV válido.' });
    }
    if (voiceBusy) return res.status(429).json({ error: 'Hay una traducción en curso. Intenta de nuevo.' });

    voiceBusy = true;
    let folder;
    try {
        folder = await mkdtemp(join(tmpdir(), 'calltraduce-'));
        const input = join(folder, 'original.wav');
        const output = join(folder, 'traducido.wav');
        await writeFile(input, audio);
        await run(cli, [
            input, '--tgt_lang', target, '--model_name', 'seamless_expressivity',
            '--vocoder_name', 'vocoder_pretssel', '--output_path', output,
        ], { timeout: 120000 });
        const translated = await readFile(output);
        res.set('Cache-Control', 'no-store').type('audio/wav').send(translated);
    } catch {
        res.status(502).json({ error: 'SeamlessExpressive no pudo procesar el audio.' });
    } finally {
        voiceBusy = false;
        if (folder) await rm(folder, { recursive: true, force: true }).catch(() => {});
    }
});

module.exports = router;
