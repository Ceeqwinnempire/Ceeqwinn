/* ============================
   CEEQWINN PROMPT BRAIN — V1.1
   Sentence → Prompt Engine
   ============================ */

let sentenceStack = [];

const NEGATIVE_PROMPT =
  "bad anatomy, distortion, extra limbs, low quality, watermark, oversharpening";

/* Wait for DOM */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("sentenceInput");

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) {
      e.preventDefault();
      addSentence(input.value.trim());
      input.value = "";
    }
  });
});

/* Add sentence */
function addSentence(sentence) {
  sentenceStack.push(sentence);
  compilePrompt();
}

/* Remove last sentence */
function deleteLastSentence() {
  sentenceStack.pop();
  compilePrompt();
}

/* Reset everything */
function resetPrompt() {
  sentenceStack = [];
  document.getElementById("promptOutput").textContent = "";
}

/* Core compiler */
function compilePrompt() {
  const output = document.getElementById("promptOutput");

  let subject = [];
  let action = [];
  let scene = [];
  let outfit = [];

  sentenceStack.forEach(sentence => {
    const s = sentence.toLowerCase();

    // SUBJECT
    if (s.includes("girl")) subject.push("young woman");
    else if (s.includes("woman")) subject.push("woman");
    else if (s.includes("man")) subject.push("man");

    // ACTION
    if (s.includes("dance")) action.push("dancing, dynamic motion");
    if (s.includes("stand")) action.push("standing confidently");
    if (s.includes("walk")) action.push("walking gracefully");

    // SCENE
    if (s.includes("rain"))
      scene.push("dancing in the rain, rain-soaked atmosphere");
    if (s.includes("office"))
      scene.push("modern office setting");
    if (s.includes("street"))
      scene.push("urban street environment");

    // OUTFIT
    if (s.includes("hat")) outfit.push("wearing a hat");
    if (s.includes("purple")) outfit.push("purple color accents");
    if (s.includes("frilly")) outfit.push("frilly texture detail");
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

  output.textContent = visiblePrompt;
}

/* Copy full prompt (adds negatives invisibly) */
function copyPrompt() {
  const visible = document.getElementById("promptOutput").textContent;
  const fullPrompt = `${visible}. ${NEGATIVE_PROMPT}`;
  navigator.clipboard.writeText(fullPrompt);
}

/* Add sentence */
function addSentence(sentence) {
  sentenceStack.push(sentence);
  compilePrompt();
}

/* Compile into clean prompt language */
function compilePrompt() {
  const output = document.getElementById("promptOutput");
  if (!output) return;

  let subject = [];
  let action = [];
  let scene = [];
  let outfit = [];

  sentenceStack.forEach(sentence => {
    const s = sentence.toLowerCase();

    // SUBJECT
    if (s.includes("girl")) subject.push("young woman");
    else if (s.includes("woman")) subject.push("woman");
    else if (s.includes("man")) subject.push("man");

    // ACTION
    if (s.includes("dance")) action.push("dancing, dynamic motion");
    if (s.includes("stand")) action.push("standing confidently");
    if (s.includes("walk")) action.push("walking gracefully");

    // SCENE
    if (s.includes("rain"))
      scene.push("dancing in the rain, rain-soaked atmosphere");
    if (s.includes("office"))
      scene.push("modern office setting");
    if (s.includes("street"))
      scene.push("urban street environment");

    // OUTFIT
    if (s.includes("hat")) outfit.push("wearing a hat");
    if (s.includes("purple")) outfit.push("purple color accents");
    if (s.includes("frilly")) outfit.push("frilly texture detail");
  });

  const finalPrompt = [
    ...new Set(subject),
    ...new Set(action),
    ...new Set(scene),
    ...new Set(outfit),
    "cinematic lighting",
    "high detail",
    "clean composition",
    "no distortion, no extra limbs, no watermark"
  ].join(", ");

  output.textContent = finalPrompt;
}

/* Copy prompt */
function copyPrompt() {
  const text = document.getElementById("promptOutput")?.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text);
}
