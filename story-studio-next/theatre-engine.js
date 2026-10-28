
(function () {
  "use strict";

  const TYPES = {
    paragraph: "Paragraph",
    narration: "Narration",
    dialogue: "Dialogue",
    reveal: "Reveal",
    transition: "Transition",
    choice: "Reader choice",
    game: "Game experience",
    image: "Image / GIF",
    video: "Video",
    audio: "Audio",
    reference: "Reference",
    chapterEnd: "Chapter end"
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render(project, chapter, assets, host) {
    host.replaceChildren();
    const shell = el("div", "reader-content");
    const title = el("h2", "", chapter.title || "Untitled chapter");
    shell.appendChild(title);

    (chapter.blocks || []).forEach(block => {
      const type = block.type || "paragraph";
      const asset = block.assetId && assets ? assets.get(block.assetId) : null;

      if (type === "image" || type === "video" || type === "audio") {
        if (!asset || !asset.url) {
          const missing = el("p", "muted", "Media unavailable in this preview. Re-import the asset or restore the saved file.");
          shell.appendChild(missing);
          return;
        }
        let media;
        if (type === "image") {
          media = el("img");
          media.src = asset.url;
          media.alt = block.caption || asset.name || "Story image";
        } else if (type === "video") {
          media = el("video");
          media.controls = true;
          media.preload = "metadata";
          media.src = asset.url;
        } else {
          media = el("audio");
          media.controls = true;
          media.preload = "metadata";
          media.src = asset.url;
        }
        shell.appendChild(media);
        if (block.caption) shell.appendChild(el("p", "muted", block.caption));
        return;
      }

      if (type === "paragraph" || type === "narration") {
        const p = el("p", type === "narration" ? "reader-narration" : "");
        p.textContent = block.text || (type === "narration" ? "Narration goes here…" : "");
        shell.appendChild(p);
        return;
      }

      if (type === "dialogue") {
        const card = el("div", "reader-dialogue");
        card.appendChild(el("div", "reader-speaker", block.speaker || "CHARACTER"));
        card.appendChild(el("p", "", block.text || "Dialogue goes here…"));
        if (block.reaction) card.appendChild(el("p", "muted", block.reaction));
        shell.appendChild(card);
        return;
      }

      if (type === "reveal") {
        const card = el("section", "reader-reveal");
        card.appendChild(el("h3", "", block.heading || "A revelation"));
        card.appendChild(el("p", "", block.text || "The reveal appears here."));
        shell.appendChild(card);
        return;
      }

      if (type === "transition") {
        shell.appendChild(el("div", "reader-transition",
          block.text || "A transition to the next moment…"));
        return;
      }

      if (type === "choice") {
        const card = el("section", "reader-choice");
        card.appendChild(el("p", "", block.text || "What happens next?"));
        const options = Array.isArray(block.options) ? block.options : [];
        options.forEach(option => {
          const button = el("button", "", option.label || "Choose");
          button.type = "button";
          button.addEventListener("click", () => {
            const message = el("p", "reader-choice-result",
              option.result || ("You selected: " + (option.label || "Choice")));
            const old = card.querySelector(".reader-choice-result");
            if (old) old.remove();
            card.appendChild(message);
          });
          card.appendChild(button);
        });
        shell.appendChild(card);
        return;
      }

      if (type === "game") {
        const card = el("section", "reader-game");
        card.appendChild(el("h3", "", block.heading || "Interactive experience"));
        card.appendChild(el("p", "", block.text || "Connect a game URL in the editor."));
        if (block.url && /^https?:\/\//i.test(block.url)) {
          const link = el("a", "", "Open game");
          link.href = block.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          card.appendChild(link);
        }
        shell.appendChild(card);
        return;
      }

      if (type === "reference") {
        shell.appendChild(el("p", "muted", "Private reference: " + (block.text || "No reference selected")));
        return;
      }

      if (type === "chapterEnd") {
        const card = el("div", "reader-chapter-end");
        card.appendChild(el("hr"));
        card.appendChild(el("p", "", block.text || "End of chapter"));
        shell.appendChild(card);
        return;
      }

      shell.appendChild(el("p", "", block.text || ""));
    });

    host.appendChild(shell);
  }

  window.CeeqwinnTheatre = { render, TYPES };
})();
