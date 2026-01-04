// ================================
function compilePrompt() {
const output = document.getElementById("promptOutput");
if (!output) return;
output.textContent = sentenceStack.join(", ");
}


// ================================
// 📦 COPY / PACKAGE PROMPT (STABLE)
// ================================
function packagePrompt() {
const outputEl = document.getElementById("promptOutput");
if (!outputEl || !outputEl.textContent) return;


const full = outputEl.textContent + ". " + NEGATIVE_PROMPT;


const textarea = document.createElement("textarea");
textarea.value = full;
textarea.setAttribute("readonly", "");
textarea.style.position = "absolute";
textarea.style.left = "-9999px";


document.body.appendChild(textarea);
textarea.select();


try {
document.execCommand("copy");
showPackageStatus();
} catch (err) {
console.warn(err);
}


document.body.removeChild(textarea);
}


// ================================
// ✨ PACKAGE FEEDBACK (V1 UX FIX)
// ================================
function showPackageStatus() {
let status = document.getElementById("packageStatus");


if (!status) {
status = document.createElement("div");
status.id = "packageStatus";
status.textContent = "Prompt packaged ✓";
document.body.appendChild(status);
}


status.classList.add("visible");


setTimeout(() => {
status.classList.remove("visible");
}, 1500);
}
