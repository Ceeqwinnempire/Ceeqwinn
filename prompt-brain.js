/* ============================
   CEEQWINN PROMPT BRAIN — V1.3
   Mobile + Desktop Safe
   ============================ */

let sentenceStack = [];

const NEGATIVE_PROMPT =
  "bad anatomy, distortion, extra limbs, low quality, watermark, oversharpening";

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("sentenceInput");

  // Desktop Enter key
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) {
      e.preventDefault();
      addSentence(input.value.trim());
      input.value = "";
    }
  });
});

/* Phone-safe Generate button */
function handleGenerate() {
  const input = document.getElementById("sentenceInput");
  if (!input.value.trim()) return;
  addSentence(input.value.trim());
  input.value = "";
}

/* Add sentence */
function addSentence(sentence) {
  sentenceStack.push(sentence);
  updateSentenceBoard();
  compilePrompt();
}

/* Delete last */
function deleteLastSentence() {
  sentenceStack.pop();
  updateSentenceBoard();
  compilePrompt();
}

/* Reset */
function resetPrompt() {
  sentenceStack = [];
  updateSentenceBoard();
  document.getElementById("promptOutput").textContent = "";
}

/* Sentence board */
function updateSentenceBoard() {
  const board = document.getElementById("sentenceBoard");
  board.innerHTML = "";

  sentenceStack.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "sentenceItem";
    div.innerHTML = `
      <span>${s}</span>
      <button onclick="removeSentence(${i})">✕</button>
    `;
    board.appendChild(div);
  });
}

function removeSentence(index) {
  sentenceStack.splice(index, 1);
  updateSentenceBoard();
  compilePrompt();
}

/* Core brain */
function compilePrompt() {
  const output = document.getElementById("promptOutput");

  let subject = [];
  let action = [];
  let scene = [];
  let outfit = [];

  sentenceStack.forEach(sentence => {
    const s = sentence.toLowerCase();

    if (s.includes("girl")) subject.push("young woman");
    else if (s.includes("woman")) subject.push("woman");
    else if (s.includes("man")) subject.push("man");

    if (s.includes("dance")) action.push("dancing, dynamic motion");
    if (s.includes("walk")) action.push("walking gracefully");

    if (s.includes("rain")) {
      scene.push("rainy atmosphere");
      if (s.includes("diamond") || s.includes("sparkling")) {
        scene.push("sparkling raindrops, jewel-like highlights");
      }
    }

    if (s.includes("hat")) outfit.push("wearing a hat");
    if (s.includes("purple")) outfit.push("purple color accents");
    if (s.includes("soaked") || s.includes("wet")) {
      outfit.push("wet fabric, rain-soaked clothing");
    }
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

/* Copy (works only via button, phone-safe) */
function copyPrompt() {
  const visible = document.getElementById("promptOutput").textContent;
  if (!visible) return;

  const fullPrompt = `${visible}. ${NEGATIVE_PROMPT}`;
  navigator.clipboard.writeText(fullPrompt);
}
