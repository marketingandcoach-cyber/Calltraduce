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
