
(function (window, document) {
  "use strict";

  function addStyles() {
    if (document.getElementById("cq-narration-styles")) return;

    const style = document.createElement("style");
    style.id = "cq-narration-styles";
    style.textContent = `
      .cq-narration {
        margin: 1.5rem 0;
        overflow: hidden;
        color: #f6eee6;
        background: #21171e;
        border: 1px solid rgba(217,189,130,.4);
        border-radius: 12px;
      }
      .cq-narration__heading {
        padding: 12px 18px;
        color: #d9bd82;
        border-bottom: 1px solid rgba(217,189,130,.3);
        font-size: .72rem;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .cq-narration__scene {
        max-width: 760px;
        margin: auto;
        padding: clamp(18px, 4vw, 36px);
        font-size: 1rem;
        line-height: 1.85;
        overflow-wrap: anywhere;
      }
      .cq-narration__scene h1,
      .cq-narration__scene h2,
      .cq-narration__scene h3 {
        color: #d9bd82;
        line-height: 1.35;
      }
      .cq-narration__scene p {
        margin: 0 0 1rem;
      }
      .cq-narration__scene p:last-child {
        margin-bottom: 0;
      }
      @media (max-width: 520px) {
        .cq-narration__scene {
          padding: 18px 14px;
          font-size: .96rem;
        }
      }
      @media (prefers-reduced-motion: no-preference) {
        .cq-narration__scene {
          animation: cq-narration-enter .3s ease-out;
        }
        @keyframes cq-narration-enter {
          from { opacity: .7; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      }
    `;
    document.head.appendChild(style);
  }

  function markdownToHTML(markdown) {
    if (window.marked) {
      if (typeof window.marked === "function") {
        return window.marked(markdown);
      }
      if (typeof window.marked.parse === "function") {
        return window.marked.parse(markdown);
      }
    }

    return String(markdown)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .split(/\n\s*\n/)
      .map(function (part) {
        return "<p>" + part.replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function render(scene) {
    addStyles();

    const container = scene.container;
    container.replaceChildren();
    container.className += " cq-narration";

    const heading = document.createElement("div");
    heading.className = "cq-narration__heading";
    heading.textContent = "CEEQWINN · NARRATION";

    const body = document.createElement("div");
    body.className = "cq-narration__scene";
    body.innerHTML = markdownToHTML(scene.markdown);

    container.appendChild(heading);
    container.appendChild(body);

    return {
      destroy: function () {
        container.replaceChildren();
        container.classList.remove("cq-narration");
      }
    };
  }

  function registerWhenReady() {
    if (!window.CEEQWINNTheatres) {
      console.error("Load theatre-loader.js before narration-theatre.js.");
      return;
    }

    window.CEEQWINNTheatres.register("NARRATION", {
      render: render
    });
  }

  registerWhenReady();
})(window, document);
