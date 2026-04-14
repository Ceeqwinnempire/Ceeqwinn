/* ========================= */
/* ⚙️ STORY LOGIC (JS FILE) */
/* ========================= */

const reader = document.getElementById("reader");
const fill = document.getElementById("crystalFill");

let readTime = 0;
let lastScroll = Date.now();

/* 💎 SCROLL TRACKING */
reader.addEventListener("scroll", () => {
  const now = Date.now();

  readTime += now - lastScroll;
  lastScroll = now;

  const scrollTop = reader.scrollTop;
  const height = reader.scrollHeight - reader.clientHeight;
  const percent = (scrollTop / height) * 100;

  fill.style.height = percent + "%";

  localStorage.setItem("scrollPos", scrollTop);
});

/* 🔁 RESTORE SCROLL */
window.onload = () => {
  const saved = localStorage.getItem("scrollPos");
  if (saved) reader.scrollTop = saved;
};

/* 🌙 MODE TOGGLE */
function toggleMode() {
  document.body.classList.toggle("night");
}
