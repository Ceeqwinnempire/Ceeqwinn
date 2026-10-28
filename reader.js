
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  let project = null;
  let activeChapterId = "";
  let choiceHistory = {};

  function slugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("story") || "";
    return /^[a-z0-9][a-z0-9-]{0,99}$/i.test(raw) ? raw : "";
  }

  function showError(message) {
    $("readerLoading").hidden = true;
    $("readerApp").hidden = true;
    $("readerError").hidden = false;
    $("readerErrorText").textContent = message;
  }

  function activeChapter() {
    return project.chapters.find((chapter) => chapter.id === activeChapterId)
      || project.chapters[0]
      || null;
  }

  function applyStoryTheme() {
    const theme = project.theme || {};
    const root = document.documentElement;
    root.style.setProperty("--reader-accent", validColour(theme.accent, "#d6b16c"));
    root.style.setProperty("--reader-bg", validColour(theme.background, "#241019"));
    root.style.setProperty("--reader-text", validColour(theme.text, "#f7edf1"));
    root.style.setProperty("--reader-panel", validColour(theme.panel, "#351c2a"));
  }

  function validColour(value, fallback) {
    const candidate = String(value || "");
    return /^#[0-9a-f]{6}$/i.test(candidate) ? candidate : fallback;
  }

  function renderHeader() {
    document.title = (project.title || "CEEQWINN Stories") + " — CEEQWINN";
    $("readerTitle").textContent = project.title || "Untitled story";
    $("readerDescription").textContent = project.description || "";
    $("readerGenre").textContent = project.genre || "CEEQWINN ORIGINAL STORY";
  }

  function renderChapterButtons() {
    const list = $("readerChapterList");
    const picker = $("readerChapterPicker");
    list.replaceChildren();
    picker.replaceChildren();

    project.chapters.forEach((chapter, index) => {
      [
        { parent: list, className: "reader-chapter-item" },
        { parent: picker, className: "reader-picker-item" }
      ].forEach((entry) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = (index + 1) + ". " + (chapter.title || "Untitled chapter");
        button.className = chapter.id === activeChapterId ? "active" : "";
        button.addEventListener("click", () => openChapter(chapter.id, true));
        entry.parent.appendChild(button);
      });
    });
  }

  function renderCurrentChapter() {
    const chapter = activeChapter();
    if (!chapter) {
      showError("This story does not contain any chapters.");
      return;
    }

    window.CeeqwinnTheatre.render($("readerContent"), project, chapter, {
      mode: "reader",
      onNavigate: (chapterId) => openChapter(chapterId, true),
      onChoice: (block, option) => {
        const key = project.id + ":" + chapter.id + ":" + block.id;
        choiceHistory[key] = {
          label: option.label || "",
          target: option.target || "",
          savedAt: new Date().toISOString()
        };
        try {
          localStorage.setItem("ceeqwinn_reader_choices_v1", JSON.stringify(choiceHistory));
        } catch (error) {}
      }
    });

    const index = project.chapters.findIndex((item) => item.id === chapter.id);
    $("chapterPosition").textContent =
      "Chapter " + (index + 1) + " of " + project.chapters.length;
    $("previousChapterButton").disabled = index <= 0;
    $("nextChapterButton").disabled = index >= project.chapters.length - 1;
    renderChapterButtons();
    updateReadingProgress();
  }

  function openChapter(id, scrollToTop) {
    if (!project.chapters.some((chapter) => chapter.id === id)) return;
    activeChapterId = id;
    renderCurrentChapter();
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function updateReadingProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const amount = max > 0 ? (window.scrollY / max) * 100 : 0;
    $("readingProgress").style.width = Math.max(0, Math.min(100, amount)) + "%";
  }

  function bindReaderControls() {
    $("previousChapterButton").addEventListener("click", () => {
      const index = project.chapters.findIndex((chapter) => chapter.id === activeChapterId);
      if (index > 0) openChapter(project.chapters[index - 1].id, true);
    });

    $("nextChapterButton").addEventListener("click", () => {
      const index = project.chapters.findIndex((chapter) => chapter.id === activeChapterId);
      if (index < project.chapters.length - 1) {
        openChapter(project.chapters[index + 1].id, true);
      }
    });

    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
  }

  async function start() {
    const slug = slugFromUrl();
    if (!slug) {
      showError("The story URL needs a valid slug, for example ?story=emerald-inheritance-demo.");
      return;
    }

    try {
      const response = await fetch("stories/" + encodeURIComponent(slug) + ".json", {
        cache: "no-cache"
      });
      if (!response.ok) throw new Error("The story file was not found.");
      const loaded = await response.json();

      if (!loaded || !Array.isArray(loaded.chapters) || !loaded.chapters.length) {
        throw new Error("The story file has no usable chapters.");
      }

      project = loaded;
      activeChapterId = project.chapters[0].id;

      try {
        choiceHistory = JSON.parse(localStorage.getItem("ceeqwinn_reader_choices_v1") || "{}");
      } catch (error) {
        choiceHistory = {};
      }

      applyStoryTheme();
      renderHeader();
      bindReaderControls();
      $("readerLoading").hidden = true;
      $("readerError").hidden = true;
      $("readerApp").hidden = false;
      renderCurrentChapter();
    } catch (error) {
      showError(
        "We could not load stories/" + slug + ".json. Upload the exported story JSON to the site's stories folder, then wait for Netlify to deploy it."
      );
    }
  }

  start();
})();
