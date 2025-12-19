// Ceeqwinn Image Studio — Prompt Engine (v1)
// Lightweight, mobile-safe, no dependencies

function buildPrompt() {
  const baseStyle = document.getElementById("baseStyle").value;
  const archetype = document.getElementById("archetype").value;
  const mood = document.getElementById("mood").value;
  const lighting = document.getElementById("lighting").value;
  const camera = document.getElementById("camera").value;
  const detail = document.getElementById("detail").value;

  const prompt = [
    baseStyle,
    archetype,
    mood,
    lighting,
    camera,
    detail
  ].filter(Boolean).join(", ");

  document.getElementById("promptOutput").textContent = prompt;
}

function copyPrompt() {
  const text = document.getElementById("promptOutput").textContent;
  if (!text) return;

  const temp = document.createElement("textarea");
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);

  alert("Prompt copied ✨");
}
