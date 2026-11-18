
const $ = (id) => document.getElementById(id);

const pages = {
  voice: {
    title: "VOICE SYSTEM",
    content: "SHRETRONX voice assistant"
  },
  knowledge: {
    title: "AI KNOWLEDGE",
    content: "AI connection is not configured yet."
  },
  devices: {
    title: "DEVICE CONNECTION",
    content: "Device pairing will be added later."
  },
  tools: {
    title: "AI TOOLS",
    content: "Your AI tools dashboard."
  },
  language: {
    title: "LANGUAGE SETTINGS",
    content: "Choose your preferred language."
  },
  privacy: {
    title: "PRIVACY CENTRE",
    content: "Microphone permission is requested only when you start listening."
  },
  settings: {
    title: "SYSTEM SETTINGS",
    content: "Personalize SHRETRONX."
  }
};

const getLanguage = () => localStorage.getItem("shreyLanguage") || "en";

const speechLanguage = () => ({
  hi: "hi-IN",
  mr: "mr-IN",
  en: "en-IN",
  hinglish: "hi-IN"
}[getLanguage()] || "en-IN");

function speak(message) {
  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = speechLanguage();
  utterance.rate = Number(localStorage.getItem("shreySpeed") || 1);

  const voices = speechSynthesis.getVoices();
  const selected = localStorage.getItem("shreyVoice");

  if (selected !== null && selected !== "") {
    utterance.voice = voices[Number(selected)] || null;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function openPage(name) {
  const page = pages[name];
  if (!page) return;

  $("pageTitle").textContent = page.title;
  $("pageContent").replaceChildren();

  const paragraph = document.createElement("p");
  paragraph.textContent = page.content;
  $("pageContent").appendChild(paragraph);

  if (name === "voice") {
    const status = document.createElement("p");
    status.id = "micStatus";
    status.textContent = "Microphone ready. Tap below to speak.";

    const listen = document.createElement("button");
    listen.textContent = "🎙️ START LISTENING";
    listen.className = "primary-btn";
    listen.addEventListener("click", startListening);

    const stop = document.createElement("button");
    stop.textContent = "STOP LISTENING";
    stop.className = "back-btn";
    stop.addEventListener("click", stopListening);

    $("pageContent").append(status, listen, stop);
  }

  if (name === "language") {
    const select = document.createElement("select");

    [
      ["en", "English"],
      ["hi", "Hindi"],
      ["mr", "Marathi"],
      ["hinglish", "Hinglish"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });

    select.value = getLanguage();
    select.addEventListener("change", () => {
      localStorage.setItem("shreyLanguage", select.value);
    });

    $("pageContent").appendChild(select);
  }

  if (name === "settings") {
    const label = document.createElement("label");
    label.textContent = "Assistant voice: ";

    const select = document.createElement("select");
    const voices = speechSynthesis.getVoices();

    const first = document.createElement("option");
    first.value = "";
    first.textContent = "Choose a voice";
    select.appendChild(first);

    voices.forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = voice.name;
      select.appendChild(option);
    });

    select.value = localStorage.getItem("shreyVoice") || "";
    select.addEventListener("change", () => {
      localStorage.setItem("shreyVoice", select.value);
    });

    label.appendChild(select);
    $("pageContent").appendChild(label);
  }

  $("pagePanel").hidden = false;
  $("pagePanel").scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => openPage(button.dataset.page));
});

$("settingsBtn").addEventListener("click", () => openPage("settings"));

$("backBtn").addEventListener("click", () => {
  stopListening();
  $("pagePanel").hidden = true;
});

function respond(command) {
  const text = command.toLowerCase();

  if (
    text.includes("hello") ||
    text.includes("namaste") ||
    text.includes("नमस्ते")
  ) {
    return "नमस्ते कमांडर। SHRETRONX तैयार है।";
  }

  if (text.includes("status") || text.includes("स्थिति")) {
    return "SHRETRONX सिस्टम सक्रिय है।";
  }

  if (text.includes("time") || text.includes("समय")) {
    return "अभी समय है " + new Date().toLocaleTimeString();
  }

  if (text.includes("date") || text.includes("तारीख")) {
    return "आज की तारीख है " + new Date().toLocaleDateString();
  }

  if (text.includes("help") || text.includes("मदद")) {
    return "आप नमस्ते, समय, तारीख या स्थिति पूछ सकते हैं।";
  }

  return "आपका आदेश प्राप्त हुआ। इस सवाल के लिए AI कनेक्शन जरूरी है।";
}

function sendCommand(command) {
  const input = $("commandInput");
  const message = command || input.value;
  const result = respond(message);

  $("response").textContent = result;

  if (input) input.value = "";

  speak(result);
}

$("sendBtn").addEventListener("click", () => sendCommand());

$("commandInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendCommand();
});

$("startBtn").addEventListener("click", () => {
  $("response").textContent = "SHRETRONX initialized. Awaiting your command.";
  speak("नमस्ते। SHRETRONX तैयार है।");
});

let recognition = null;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function startListening() {
  if (!SpeechRecognition) {
    $("micStatus").textContent =
      "Speech recognition is not supported in this browser. Try Chrome.";
    return;
  }

  if (recognition) recognition.stop();

  recognition = new SpeechRecognition();
  recognition.lang = speechLanguage();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    $("micStatus").textContent = "Listening... Speak now.";
  };

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript;
    $("micStatus").textContent = "You said: " + command;
    sendCommand(command);
  };

  recognition.onerror = (event) => {
    $("micStatus").textContent = "Microphone error: " + event.error;
  };

  recognition.onend = () => {
    if ($("micStatus") && $("micStatus").textContent === "Listening... Speak now.") {
      $("micStatus").textContent = "Listening stopped.";
    }
  };

  recognition.start();
}

function stopListening() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = () => {};
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch((error) => console.error("Service worker error:", error));
  });
}
