let sentenceStack = [];

const NEGATIVE_PROMPT =
  "bad anatomy, distortion, extra limbs, low quality, watermark, oversharpening";

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

function compilePrompt() {
  let subject = [];
  let action = [];
  let scene = [];
  let outfit = [];

  sentenceStack.forEach(sentence => {
    const s = sentence.toLowerCase();

    if (s.includes("girl")) subject.push("young woman");
    if (s.includes("woman")) subject.push("woman");
    if (s.includes("man")) subject.push("man");

    if (s.includes("dance")) action.push("dancing, dynamic motion");
    if (s.includes("stand")) action.push("standing confidently");
    if (s.includes("walk")) action.push("walking gracefully");

    if (s.includes("rain")) scene.push("rainy atmosphere, cinematic rain");
    if (s.includes("office")) scene.push("modern office setting");
    if (s.includes("street")) scene.push("urban street environment");

    if (s.includes("hat")) outfit.push("wearing a hat");
    if (s.includes("purple")) outfit.push("purple accents");
    if (s.includes("frilly")) outfit.push("frilled fabric texture");
    if (s.includes("soaked") || s.includes("wet"))
      outfit.push("wet fabric, rain-soaked clothing");
    if (s.includes("diamond") || s.includes("sparkling"))
      scene.push("sparkling raindrops, jewel-like highlights");
  });

  const visiblePrompt = [
    ...new Set(subject),
    ...new Set(action),
    ...new Set(scene),
    ...new Set(outfit),
    "cinematic lighting",
    "high detail",
    "clean composition"
  ].join(", ");

  document.getElementById("promptOutput").textContent = visiblePrompt;
}

function copyPrompt() {
  const visible = document.getElementById("promptOutput").textContent;
  if (!visible) return;

  const full = visible + ". " + NEGATIVE_PROMPT;
  navigator.clipboard.writeText(full);
}
