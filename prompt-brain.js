/* ============================
   CEEQWINN PROMPT BRAIN — V1
   Sentence Stacking Engine
   ============================ */

/* MEMORY (Ledger) */
const promptLedger = {
  subjects: [],
  actions: [],
  environments: [],
  objects: [],
  styles: [],
  moods: [],
  lighting: []
};

/* KEYWORDS (Recognition Map) */
const keywordMap = {
  subjects: [
    "man", "woman", "girl", "boy", "person", "people",
    "astronaut", "model", "villain", "worker"
  ],
  actions: [
    "standing", "sitting", "walking", "playing",
    "working", "posing", "running"
  ],
  environments: [
    "office", "space", "room", "studio",
    "street", "beach", "forest", "city"
  ],
  objects: [
    "laptop", "desk", "chair", "car",
    "phone", "table", "glass"
  ],
  styles: [
    "luxury", "minimalist", "cinematic",
    "editorial", "fashion", "elegant"
  ],
  moods: [
    "confident", "soft", "dark",
    "dreamy", "calm", "powerful"
  ],
  lighting: [
    "soft light", "daylight",
    "studio light", "cinematic lighting"
  ]
};

/* SENTENCE CLASSIFIER */
function classifySentence(sentence) {
  const text = sentence.toLowerCase();

  for (const category in keywordMap) {
    keywordMap[category].forEach(keyword => {
      if (text.includes(keyword)) {
        promptLedger[category].push(sentence);
      }
    });
  }
}

/* ENTRY POINT (When user presses Enter) */
function handleSentenceInput(sentence) {
  if (!sentence.trim()) return;
  classifySentence(sentence);
}

/* PROMPT COMPILER */
function compilePrompt() {
  const parts = [];

  Object.values(promptLedger).forEach(section => {
    if (section.length > 0) {
      parts.push(section.join(", "));
    }
  });

  const negativePrompt =
    "bad anatomy, distortion, extra limbs, low quality, watermark, oversharpening";

  return parts.join(", ") + ". " + negativePrompt;
}
// Stores all user sentences
let sentenceStack = [];

// Listen for Enter key
const input = document.getElementById("sentenceInput");

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && input.value.trim() !== "") {
    e.preventDefault();
    addSentence(input.value.trim());
    input.value = "";
  }
});

function addSentence(sentence) {
  sentenceStack.push(sentence);
  compilePrompt();
}

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
    if (s.includes("woman")) subject.push("woman");
    if (s.includes("man")) subject.push("man");

    // ACTION
    if (s.includes("dance")) action.push("dancing, dynamic motion");
    if (s.includes("stand")) action.push("standing confidently");
    if (s.includes("walk")) action.push("walking gracefully");

    // SCENE
    if (s.includes("rain")) scene.push("dancing in the rain, rain-soaked atmosphere");
    if (s.includes("office")) scene.push("modern office setting");
    if (s.includes("street")) scene.push("urban street environment");

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
    "clean composition"
  ].join(", ");

  output.textContent = finalPrompt;
}

}

function copyPrompt() {
  const text = document.getElementById("promptOutput").textContent;
  navigator.clipboard.writeText(text);
}
