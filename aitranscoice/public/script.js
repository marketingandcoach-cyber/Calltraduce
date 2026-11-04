// Lista de idiomas disponibles
const idiomas = {
  "es-ES": "Español",
  "en-US": "Inglés (EE.UU.)",
  "en-GB": "Inglés (UK)",
  "fr-FR": "Francés",
  "de-DE": "Alemán",
  "it-IT": "Italiano",
  "pt-PT": "Portugués",
  "pt-BR": "Portugués (Brasil)",
  "ru-RU": "Ruso",
  "zh-CN": "Chino (Mandarín)",
  "ja-JP": "Japonés",
  "ko-KR": "Coreano",
  "ar-SA": "Árabe",
  "hi-IN": "Hindi"
};

// Rellenar selects
const fromSelect = document.getElementById("fromLanguage");
const toSelect = document.getElementById("toLanguage");

for (const code in idiomas) {
  const option1 = document.createElement("option");
  option1.value = code;
  option1.textContent = idiomas[code];
  fromSelect.appendChild(option1);

  const option2 = document.createElement("option");
  option2.value = code;
  option2.textContent = idiomas[code];
  toSelect.appendChild(option2);
}

// Botones
const dictateBtn = document.getElementById("dictateBtn");
const translateBtn = document.getElementById("translateBtn");
const speakBtn = document.getElementById("speakBtn");

dictateBtn.addEventListener("click", startDictation);
translateBtn.addEventListener("click", () => translateText(document.getElementById("inputText").value));
speakBtn.addEventListener("click", speakTranslation);

const useMeta = document.getElementById("useMeta");
const expressiveBtn = document.getElementById("expressiveBtn");
const voiceFile = document.getElementById("voiceFile");
const expressiveAudio = document.getElementById("expressiveAudio");
const translationStatus = document.getElementById("translationStatus");
let audioUrl;

fetch("/api/meta/capabilities")
  .then(response => response.ok ? response.json() : {})
  .then(({ text, voice }) => {
    useMeta.disabled = !text;
    expressiveBtn.disabled = !voice;
  })
  .catch(() => {});

expressiveBtn.addEventListener("click", async () => {
  const file = voiceFile.files[0];
  if (!file || file.size > 5 * 1024 * 1024) {
    translationStatus.textContent = "Selecciona un archivo WAV de hasta 5 MB.";
    return;
  }

  expressiveBtn.disabled = true;
  expressiveAudio.hidden = true;
  expressiveAudio.removeAttribute("src");
  expressiveAudio.load();
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  translationStatus.textContent = "Traduciendo el audio…";
  try {
    const query = new URLSearchParams({ from: fromSelect.value, to: toSelect.value });
    const response = await fetch(`/api/meta/expressive?${query}`, {
      method: "POST",
      headers: { "Content-Type": "audio/wav" },
      body: file,
    });
    if (!response.ok) throw new Error((await response.json()).error);
    audioUrl = URL.createObjectURL(await response.blob());
    expressiveAudio.src = audioUrl;
    expressiveAudio.hidden = false;
    translationStatus.textContent = "Audio traducido. Pulsa reproducir para escucharlo.";
  } catch (error) {
    translationStatus.textContent = error.message;
  } finally {
    expressiveBtn.disabled = false;
  }
});

// 🎤 Dictado
function startDictation() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Tu navegador no soporta dictado de voz.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = fromSelect.value;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function (event) {
    const texto = event.results[0][0].transcript;
    document.getElementById("inputText").value = texto;
    translateText(texto);
  };

  recognition.start();
}

// 🌍 Traducción con API gratuita (MyMemory)
async function translateText(text) {
  if (!text.trim()) return;
  translationStatus.textContent = "";
  const output = document.getElementById("outputText");
  output.value = "";
  if (useMeta.checked) {
    try {
      const response = await fetch("/api/meta/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: fromSelect.value, to: toSelect.value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      output.value = result.translation;
    } catch (error) {
      translationStatus.textContent = error.message;
    }
    return;
  }
  const from = fromSelect.value.split("-")[0]; // solo código base (es, en, fr)
  const to = toSelect.value.split("-")[0];
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
    const data = await res.json();
    const translated = data.responseData.translatedText;
    document.getElementById("outputText").value = translated;
  } catch (err) {
    console.error(err);
  }
}

// 🔊 Texto a voz
function speakTranslation() {
  const text = document.getElementById("outputText").value;
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = toSelect.value;
  speechSynthesis.speak(utterance);
}
