(function () {
  "use strict";

  function element(tag, className, text) {
    const node = document.createElement(tag);

    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;

    return node;
  }

  function validWebUrl(value) {
    const raw = String(value || "").trim();

    if (!raw) return "";

    try {
      const parsed = new URL(raw, window.location.href);

      return ["http:", "https:"].includes(parsed.protocol)
        ? parsed.href
        : "";
    } catch (error) {
      return "";
    }
  }

  function addExperience(container, block, project, chapter) {
    const card = element("section", "reader-experience");
    const title = element(
      "h3",
      "",
      block.title || "Story experience"
    );

    card.appendChild(title);

    if (block.type === "dialogue" && block.character) {
      const speaker = element("p", "preview-note", block.character);
      card.appendChild(speaker);
    }

    if (block.text) {
      card.appendChild(element("p", "", block.text));
    }

    if (block.type === "image" || block.type === "reveal") {
      const url = validWebUrl(block.imageUrl);

      if (url) {
        const image = document.createElement("img");
        image.src = url;
        image.alt = block.title || "Story illustration";
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        image.addEventListener("error", () => {
          image.replaceWith(element(
            "p",
            "preview-note",
            "This image could not be loaded. Check the image URL."
          ));
        });
        card.appendChild(image);
      }
    }

    if (block.type === "audio") {
      const url = validWebUrl(block.audioUrl);

      if (url) {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.preload = "none";
        audio.src = url;
        card.appendChild(audio);
      } else {
        card.appendChild(element(
          "p",
          "preview-note",
          "Add a direct audio file URL in the Edit panel."
        ));
      }
    }

    if (block.type === "game") {
      const url = validWebUrl(block.gameUrl);

      if (url) {
        const link = document.createElement("a");
        link.className = "reader-game-link";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open game ↗";
        card.appendChild(link);

        card.appendChild(element(
          "p",
          "preview-note",
          "The game opens in a separate tab. This prototype does not yet connect game progress to story choices."
        ));
      } else {
        card.appendChild(element(
          "p",
          "preview-note",
          "Add the URL of your existing game in the Edit panel."
        ));
      }
    }

    if (block.type === "choice") {
      const choices = element("div", "reader-choice");
      const options = Array.isArray(block.options) ? block.options : [];

      options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = option.label || "Continue";

        button.addEventListener("click", () => {
          choices.querySelectorAll("button").forEach((item) => {
            item.disabled = true;
          });

          button.textContent = "Selected: " + (option.label || "Continue");

          const result = element(
            "p",
            "preview-note",
            option.target
              ? "Saved target ID: " + option.target +
                ". Full branch navigation will be connected later."
              : "Choice selected. Add a target ID and connect the branch in a future integration."
          );

          choices.appendChild(result);
        });

        choices.appendChild(button);
      });

      card.appendChild(choices);
    }

    if (block.type === "chapterEnd") {
      const nextChapter = project.chapters.find(
        (item) => item.id === block.nextChapterId
      );

      card.appendChild(element(
        "p",
        "preview-note",
        nextChapter
          ? "Next chapter: " + nextChapter.title +
            ". Chapter-to-chapter playback will be connected later."
          : "Choose the next chapter in the Edit panel."
      ));
    }

    container.appendChild(card);
  }

  function render(container, project, chapter) {
    container.replaceChildren();

    if (!chapter) {
      container.appendChild(element(
        "p",
        "preview-note",
        "Choose a chapter to preview."
      ));
      return;
    }

    container.appendChild(element(
      "h2",
      "reader-chapter-title",
      chapter.title || project.title || "Untitled chapter"
    ));

    const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];

    if (!blocks.length) {
      container.appendChild(element(
        "p",
        "reader-prose",
        "This chapter has no content yet."
      ));
      return;
    }

    blocks.forEach((block) => {
      if (block.type === "paragraph") {
        const text = String(block.text || "").trim();

        if (text) {
          container.appendChild(element("p", "reader-prose", text));
        }
      } else {
        addExperience(container, block, project, chapter);
      }
    });

    container.appendChild(element(
      "p",
      "preview-note",
      "Studio preview only. Live Reader integration and complete branching are not connected yet."
    ));
  }

  window.CeeqwinnTheatre = {
    render: render
  };
})();
