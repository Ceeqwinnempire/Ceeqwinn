
(function () {
  "use strict";

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = String(text);
    return item;
  }

  function safeUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw, window.location.href);
      if (["http:", "https:"].includes(url.protocol)) return url.href;
      if (url.protocol === "data:" && /^data:image\//i.test(raw)) return raw;
    } catch (error) {}
    return "";
  }

  function appendImage(card, block) {
    const url = safeUrl(block.imageUrl);
    if (!url) {
      card.appendChild(node("p", "preview-note", "Add a valid image URL in the Edit panel."));
      return;
    }
    const image = node("img");
    image.src = url;
    image.alt = block.title || "Story illustration";
    image.loading = "lazy";
    image.addEventListener("error", function () {
      image.replaceWith(node("p", "preview-note", "This image could not be loaded. Check the image URL."));
    });
    card.appendChild(image);
  }

  function appendChoice(card, block, project, options) {
    const choices = node("div", "reader-choice");
    const list = Array.isArray(block.options) ? block.options : [];
    if (!list.length) {
      card.appendChild(node("p", "preview-note", "Add at least one choice in the Edit panel."));
      return;
    }

    list.forEach(function (option) {
      const button = node("button", "", option.label || "Continue");
      button.type = "button";
      button.addEventListener("click", function () {
        if (button.disabled) return;
        choices.querySelectorAll("button").forEach(function (other) {
          other.disabled = true;
        });
        button.textContent = "Selected: " + (option.label || "Continue");

        const target = project.chapters.find(function (chapter) {
          return chapter.id === option.target || chapter.title === option.target;
        });

        if (target && typeof options.onNavigate === "function") {
          const continueButton = node("button", "reader-chapter-link", "Continue to " + target.title + " →");
          continueButton.addEventListener("click", function () {
            options.onNavigate(target.id);
          });
          choices.appendChild(continueButton);
        } else {
          choices.appendChild(node("p", "preview-note",
            "Your choice: " + (option.label || "Continue") +
            (option.target ? ". Target: " + option.target : "") +
            ". This selection is shown in this reading session."));
        }

        if (typeof options.onChoice === "function") {
          options.onChoice(block, option);
        }
      });
      choices.appendChild(button);
    });

    card.appendChild(choices);
  }

  function appendExperience(container, block, project, options) {
    const card = node("section", "reader-experience");
    card.dataset.blockId = block.id || "";
    card.dataset.experienceType = block.type || "";

    const title = node("h3", "", block.title || defaultTitle(block.type));
    card.appendChild(title);

    if (block.type === "dialogue" && block.character) {
      card.appendChild(node("p", "preview-note", block.character));
    }

    if (block.text) card.appendChild(node("p", "reader-prose", block.text));

    if (block.type === "image" || block.type === "reveal") {
      appendImage(card, block);
    }

    if (block.type === "audio") {
      const url = safeUrl(block.audioUrl);
      if (url) {
        const audio = node("audio");
        audio.controls = true;
        audio.preload = "none";
        audio.src = url;
        card.appendChild(audio);
      } else {
        card.appendChild(node("p", "preview-note", "Add a direct audio file URL."));
      }
    }

    if (block.type === "game") {
      const url = safeUrl(block.gameUrl);
      if (url) {
        const link = node("a", "reader-game-link", "Open game ↗");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      } else {
        card.appendChild(node("p", "preview-note", "Add the URL of your existing game."));
      }
    }

    if (block.type === "choice") appendChoice(card, block, project, options);

    if (block.type === "chapterEnd") {
      const next = project.chapters.find(function (chapter) {
        return chapter.id === block.nextChapterId;
      });
      if (next) {
        const button = node("button", "reader-chapter-link", "Continue to " + next.title + " →");
        button.type = "button";
        button.addEventListener("click", function () {
          if (typeof options.onNavigate === "function") options.onNavigate(next.id);
          else card.appendChild(node("p", "preview-note", "Next chapter: " + next.title));
        });
        card.appendChild(button);
      } else {
        card.appendChild(node("p", "preview-note", "Choose the next chapter in the Edit panel."));
      }
    }

    container.appendChild(card);
  }

  function defaultTitle(type) {
    const names = {
      narration: "Narration",
      dialogue: "Dialogue",
      reveal: "A reveal",
      image: "Illustration",
      choice: "Your choice",
      game: "Play a game",
      audio: "Listen",
      chapterEnd: "Continue the story"
    };
    return names[type] || "Story experience";
  }

  function render(container, project, chapter, options) {
    if (!container) return;
    options = options || {};
    container.replaceChildren();

    if (!project || !chapter) {
      container.appendChild(node("p", "preview-note", "Choose a chapter to preview."));
      return;
    }

    container.appendChild(node("h2", "reader-chapter-title",
      chapter.title || project.title || "Untitled chapter"));

    const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
    if (!blocks.length) {
      container.appendChild(node("p", "reader-prose", "This chapter has no content yet."));
      return;
    }

    blocks.forEach(function (block) {
      if (block.type === "paragraph") {
        const text = String(block.text || "").trim();
        if (text) container.appendChild(node("p", "reader-prose", text));
      } else {
        appendExperience(container, block, project, options);
      }
    });
  }

  window.CeeqwinnTheatre = { render: render };
})();
