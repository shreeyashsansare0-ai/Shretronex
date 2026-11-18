
const $ = (id) => document.getElementById(id);

const pages = {
  voice: {
    title: "VOICE SYSTEM",
    content: "Voice interface preview. Microphone and speech features will be configured in a later stage."
  },
  knowledge: {
    title: "AI KNOWLEDGE",
    content: "AI knowledge connection is not configured yet. A secure AI service will be needed."
  },
  devices: {
    title: "DEVICE CONNECTION",
    content: "Android and Windows device pairing will be added in a later stage."
  },
  tools: {
    title: "AI TOOLS",
    content: "Your future tools dashboard. Features will be activated in later development stages."
  },
  language: {
    title: "LANGUAGE SETTINGS",
    content: "Choose your preferred language."
  },
  privacy: {
    title: "PRIVACY CENTRE",
    content: "Manage microphone permissions, device access and privacy settings here."
  },
  settings: {
    title: "SYSTEM SETTINGS",
    content: "Personalize your SHRETRONX experience."
  }
};

function openPage(name) {
  const page = pages[name];
  if (!page) return;

  $("pageTitle").textContent = page.title;
  $("pageContent").replaceChildren();

  const paragraph = document.createElement("p");
  paragraph.textContent = page.content;
  $("pageContent").appendChild(paragraph);

  if (name === "language") {
    const select = document.createElement("select");
    select.id = "languageSelect";

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

    select.value = localStorage.getItem("shreyLanguage") || "en";
    select.addEventListener("change", () => {
      localStorage.setItem("shreyLanguage", select.value);
    });

    $("pageContent").appendChild(select);
  }

  if (name === "settings") {
    const label = document.createElement("label");
    label.textContent = "Assistant voice: ";

    const select = document.createElement("select");
    select.id = "voiceSelect";

    const voices = window.speechSynthesis
      ? window.speechSynthesis.getVoices()
      : [];

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choose a voice";
    select.appendChild(defaultOption);

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

    const speedLabel = document.createElement("p");
    speedLabel.textContent = "Speech speed";

    const speed = document.createElement("input");
    speed.type = "range";
    speed.min = "0.7";
    speed.max = "1.4";
    speed.step = "0.1";
    speed.value = localStorage.getItem("shreySpeed") || "1";

    speed.addEventListener("input", () => {
      localStorage.setItem("shreySpeed", speed.value);
    });

    $("pageContent").append(speedLabel, speed);
  }

  $("pagePanel").hidden = false;
  $("pagePanel").scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    openPage(button.dataset.page);
  });
});

$("settingsBtn").addEventListener("click", () => openPage("settings"));

$("backBtn").addEventListener("click", () => {
  $("pagePanel").hidden = true;
});

function respond(command) {
  const text = command.trim().toLowerCase();
  if (!text) return "Please enter a command.";

  if (text.includes("hello") || text.includes("namaste")) {
    return "Namaste, Commander. SHRETRONX interface is ready.";
  }

  if (text.includes("status")) {
    return "Interface active. AI and device connections are not configured yet.";
  }

  if (text.includes("time")) {
    return "Your device time is " + new Date().toLocaleTimeString();
  }

  if (text.includes("date")) {
    return "Today's date is " + new Date().toLocaleDateString();
  }

  if (text.includes("help")) {
    return "Try: hello, status, time, or date.";
  }

  return "Command received. This feature needs an AI connection to answer intelligently.";
}

function sendCommand() {
  const input = $("commandInput");
  const result = respond(input.value);

  $("response").textContent = result;
  input.value = "";

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(result);
    utterance.rate = Number(localStorage.getItem("shreySpeed") || 1);

    const voices = speechSynthesis.getVoices();
    const selected = localStorage.getItem("shreyVoice");

    if (selected !== null && selected !== "") {
      utterance.voice = voices[Number(selected)] || null;
    }

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}

$("sendBtn").addEventListener("click", sendCommand);

$("commandInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendCommand();
});

$("startBtn").addEventListener("click", () => {
  $("response").textContent =
    "SHRETRONX initialized. Awaiting your command.";
});

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = () => {if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("SHRETRONX offline support ready"))
      .catch((error) => console.error("Service worker error:", error));
  });
}
    // Voice list becomes available when the browser loads it.
  };
}
