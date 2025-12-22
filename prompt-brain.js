/* ============================
   CEEQWINN PROMPT BRAIN — V1.2
   Sentence → Prompt Engine
   ============================ */

let sentenceStack = [];

const NEGATIVE_PROMPT =
  "bad anatomy, distortion, extra limbs, low quality, watermark, oversharpening";

/* Detail recognition map */
const detailMap = {
  states: ["wet", "soaked", "drenched"],
  effects: ["sparkling", "glowing", "shimmering", "diamond"],
  textures: ["fabric", "silk", "cloth"]
};

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

/* Delete last sentence */
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

    /* SUBJECT */
    if (s.includes("girl")) subject.push("young woman");
    else if (s.includes("woman")) subject.push("woman");
    else if (s.includes("man")) subject.push("man");

    /* ACTION */
    if (s.includes("dance")) action.push("dancing, dynamic motion");
    if (s.includes("stand")) action.push("standing confidently");
    if (s.includes("walk")) action.push("walking gracefully");

    /* SCENE */
    if (s.includes("rain")) {
      scene.push("rainy atmosphere");
      scene.push("rain-soaked environment");

      detailMap.effects.forEach(effect => {
        if (s.includes(effect)) {
          scene.push("sparkling raindrops, jewel-like highlights");
        }
      });
    }

    if (s.includes("office")) scene.push("modern office setting");
    if (s.includes("street")) scene.push("urban street environment");

    /* OUTFIT */
    if (s.includes("hat")) outfit.push("wearing a hat");
    if (s.includes("purple")) outfit.push("purple color accents");
    if (s.includes("frilly")) outfit.push("frilly texture detail");

    /* FABRIC STATE */
    detailMap.states.forEach(state => {
      if (s.includes(state)) {
        outfit.push("wet fabric, rain-soaked clothing");
      }
    });

    /* TEXTURE */
    detailMap.textures.forEach(texture => {
      if (s.includes(texture)) {
        outfit.push(`${texture} texture detail`);
      }
    });
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

/* Copy full prompt (negatives hidden) */
function copyPrompt() {
  const visible = document.getElementById("promptOutput").textContent;
  const fullPrompt = `${visible}. ${NEGATIVE_PROMPT}`;
  navigator.clipboard.writeText(fullPrompt);
}
