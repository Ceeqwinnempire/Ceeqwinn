// ================================
// 🔒 V1 CORE — DO NOT MODIFY
// ================================

let sentenceStack = [];

const NEGATIVE_PROMPT = `
deformed body, extra limbs, extra fingers, distorted face, missing limbs,
fused hands, double head, blurry skin, long neck, broken joints,
warped anatomy, watermark, text, logo, grain, frame, distortion,
cartoonish face, 3D plastic skin, dull lighting, messy background,
low quality, cropped, bad anatomy, duplicate limbs, blurred details,
out of frame, oversharpening
`.replace(/\s+/g, " ").trim();

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

  const full = visible + ". Negative prompt: " + NEGATIVE_PROMPT;
  navigator.clipboard.writeText(full);
}

// ================================
// 🧠 V2 SEMANTIC GROUNDWORK (SAFE ZONE)
// ================================

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/twrilling/g, "twirling")
    .replace(/frilld/g, "frilled")
    .replace(/aht/g, "hat")
    .replace(/glden/g, "golden")
    .replace(/lottey/g, "lottery")
    .replace(/calmning/g, "calming")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPhrase(sentence, triggers) {
  for (const trigger of triggers) {
    if (sentence.includes(trigger)) {
      return sentence.split(trigger)[1]?.trim();
    }
  }
  return null;
}

function parseScene(sentences) {
  const scene = {
    subject: null,
    actions: [],
    wearables: [],
    carried: [],
    environment: {
      atmosphere: [],
      setting: []
    },
    mood: [],
    aura: []
  };

  sentences.forEach(raw => {
    const s = normalizeText(raw);

    // SUBJECT
    if (!scene.subject && (s.includes("girl") || s.includes("woman"))) {
      scene.subject = "young woman";
    }

    // ACTIONS
    if (s.includes("walking")) scene.actions.push("walking gracefully");
    if (s.includes("standing")) scene.actions.push("standing confidently");
    if (s.includes("twirling")) scene.actions.push("twirling fluidly");
    if (s.includes("smiling")) scene.actions.push("gentle smile");

    // WEARABLES
    const worn = extractPhrase(s, ["wearing", "dressed in", "clothed in"]);
    if (worn) scene.wearables.push(worn);

    // CARRIED OBJECTS
    const held = extractPhrase(s, ["holding", "carrying"]);
    if (held) scene.carried.push(held);

    // ENVIRONMENT
    if (s.includes("rain")) scene.environment.atmosphere.push("cinematic rain");
    if (s.includes("desert")) scene.environment.setting.push("vast desert landscape");
    if (s.includes("rock")) scene.environment.setting.push("standing on a rock");

    // MOOD
    if (s.includes("calm")) scene.mood.push("calm, serene mood");
    if (s.includes("fantastic")) scene.mood.push("fantastical, dreamlike tone");
    if (s.includes("lottery") || s.includes("won")) scene.mood.push("victorious joy");

    // AURA
    if (s.includes("power")) scene.aura.push("strong aura of power");
  });

  return scene;
}

function buildPromptFromScene(scene) {
  const parts = [];

  if (scene.subject) parts.push(scene.subject);
  if (scene.actions.length) parts.push(scene.actions.join(", "));
  if (scene.environment.setting.length) parts.push(scene.environment.setting.join(", "));
  if (scene.environment.atmosphere.length) parts.push(scene.environment.atmosphere.join(", "));
  if (scene.wearables.length) parts.push("wearing " + scene.wearables.join(" and "));
  if (scene.carried.length) parts.push("carrying " + scene.carried.join(" and "));
  if (scene.mood.length) parts.push(scene.mood.join(", "));
  if (scene.aura.length) parts.push(scene.aura.join(", "));

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
