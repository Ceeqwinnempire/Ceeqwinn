// ================================
// 🔒 V1 CORE — DO NOT MODIFY
// ================================

let sentenceStack = [];

const NEGATIVE_PROMPT = "bad anatomy, distortion, extra limbs, low quality, watermark, oversharpening";

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("sentenceInput");

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSentence(input.value);
      input.value = "";
    }
  });
});

function addSentenceFromButton() {
  const input = document.getElementById("sentenceInput");
  addSentence(input.value);
  input.value = "";
}

function addSentence(sentence) {
  if (!sentence.trim()) return;
  sentenceStack.push(sentence.trim());
  compilePrompt();
  renderSentenceLog();
}

function deleteLastSentence() {
  sentenceStack.pop();
  compilePrompt();
  renderSentenceLog();
}

function resetPrompt() {
  sentenceStack = [];
  document.getElementById("promptOutput").textContent = "";
  document.getElementById("sentenceLog").textContent = "";
}

function renderSentenceLog() {
  const log = document.getElementById("sentenceLog");
  log.innerHTML = sentenceStack.map((s, i) => `${i + 1}. ${s}`).join("<br>");
}

function copyPrompt() {
  const visible = document.getElementById("promptOutput").textContent;
  if (!visible) return;

  const full = visible + ". " + NEGATIVE_PROMPT;
  navigator.clipboard.writeText(full);
}

// ================================
// 🧠 V2 SEMANTIC GROUNDWORK (SAFE ZONE)
// ================================

function parseScene(sentences) {
  const scene = {
    subject: null,
    actions: [],
    wearables: [],
    carried: [],
    environment: {
      atmosphere: [],
      surfaces: []
    }
  };

  sentences.forEach(sentence => {
    const s = sentence.toLowerCase();

    // SUBJECT
    if (!scene.subject && (s.includes("girl") || s.includes("woman"))) {
      scene.subject = "young woman";
    }

    // ACTIONS
    if (s.includes("walking")) scene.actions.push("walking gracefully");
    if (s.includes("standing")) scene.actions.push("standing confidently");

    // WEARABLES
    if (s.includes("hat")) scene.wearables.push("purple frilled hat");
    if (s.includes("boots")) scene.wearables.push("diamond-studded boots");

    // CARRIED OBJECTS
    if (s.includes("umbrella")) scene.carried.push("umbrella");

    // ENVIRONMENT
    if (s.includes("rain")) scene.environment.atmosphere.push("cinematic rain");
    if (s.includes("rock")) scene.environment.surfaces.push("rock");
  });

  return scene;
}

function buildPromptFromScene(scene) {
  const parts = [];

  if (scene.subject) parts.push(scene.subject);
  if (scene.actions.length) parts.push(scene.actions.join(", "));
  if (scene.environment.atmosphere.length) parts.push(scene.environment.atmosphere.join(", "));
  if (scene.environment.surfaces.length) parts.push("standing on " + scene.environment.surfaces.join(", "));
  if (scene.wearables.length) parts.push("wearing " + scene.wearables.join(" and "));
  if (scene.carried.length) parts.push("carrying " + scene.carried.join(" and "));

  parts.push("cinematic lighting", "high detail", "clean composition");

  return parts.join(", ");
}

// ================================
// 🎼 V2 BRIDGE (SAFE REPLACEMENT)
// ================================

function compilePrompt() {
  const scene = parseScene(sentenceStack);
  const visiblePrompt = buildPromptFromScene(scene);

  document.getElementById("promptOutput").textContent = visiblePrompt;
}
