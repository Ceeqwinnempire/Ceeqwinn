(function () {
  "use strict";

  const STORAGE_KEY = "ceeqwinn_story_studio_v2";
  const $ = (id) => document.getElementById(id);

  const experienceNames = {
    narration: "Cinematic narration",
    dialogue: "Character dialogue",
    reveal: "Visual reveal",
    choice: "Reader choice",
    game: "Game launch",
    audio: "Audio moment",
    image: "Story image",
    chapterEnd: "Chapter transition"
  };

  const experienceDefaults = {
    narration: {
      title: "A moment unfolds",
      text: "Write the narration for this moment."
    },
    dialogue: {
      title: "Character dialogue",
      character: "Character name",
      text: "Write what the character says."
    },
    reveal: {
      title: "A revelation",
      text: "Describe what the reader discovers.",
      imageUrl: ""
    },
    choice: {
      title: "What will happen next?",
      text: "Choose how the story continues.",
      options: [
        { label: "Choice A", target: "" },
        { label: "Choice B", target: "" }
      ]
    },
    game: {
      title: "Play a game",
      text: "Add a short introduction to this game.",
      gameUrl: ""
    },
    audio: {
      title: "Sound and atmosphere",
      text: "Add a description for this audio.",
      audioUrl: ""
    },
    image: {
      title: "Story illustration",
      text: "Describe this image.",
      imageUrl: ""
    },
    chapterEnd: {
      title: "Continue the story",
      text: "The next chapter awaits.",
      nextChapterId: ""
    }
  };

  let project;
  let activeChapterId = "";
  let selectedBlockId = "";
  let saveTimer = null;
  let lastFocusedParagraphId = "";
  let previewState = null;

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) +
      "_" + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeUrl(value) {
    const raw = String(value || "").trim();

    if (!raw) return "";

    try {
      const parsed = new URL(raw, window.location.href);

      if (["http:", "https:"].includes(parsed.protocol)) {
        return parsed.href;
      }

      return "";
    } catch (error) {
      return "";
    }
  }

  function makeParagraph(text) {
    return {
      id: uid("block"),
      type: "paragraph",
      text: text || ""
    };
  }

  function makeChapter(title) {
    return {
      id: uid("chapter"),
      title: title || "Untitled chapter",
      blocks: [makeParagraph("")]
    };
  }

  function makeExperience(type) {
    const defaults = experienceDefaults[type];

    if (!defaults) return null;

    return {
      id: uid("experience"),
      type: type,
      ...JSON.parse(JSON.stringify(defaults))
    };
  }

  function getActiveChapter() {
    return project.chapters.find(
      (chapter) => chapter.id === activeChapterId
    ) || null;
  }

  function getSelectedBlock() {
    const chapter = getActiveChapter();

    if (!chapter) return null;

    return chapter.blocks.find(
      (block) => block.id === selectedBlockId
    ) || null;
  }

  function getBlockLabel(block) {
    if (block.type === "paragraph") {
      const text = String(block.text || "").trim();
      return text ? text.slice(0, 48) : "Empty paragraph";
    }

    return block.title || experienceNames[block.type] || "Experience";
  }

  function createStarterProject() {
    const chapter = {
      id: uid("chapter"),
      title: "Chapter One",
      blocks: [
        makeParagraph(
          "The doors opened onto a hall filled with crystal light."
        ),
        {
          id: uid("experience"),
          type: "narration",
          title: "The grand entrance",
          text: "Every conversation paused as the guests turned to look."
        },
        makeParagraph(
          "Lexis stepped forward, determined not to let anyone see her surprise."
        ),
        {
          id: uid("experience"),
          type: "dialogue",
          title: "An unexpected greeting",
          character: "Sirena",
          text: "You finally decided to show up."
        }
      ]
    };

    return {
      schemaVersion: 2,
      id: uid("story"),
      title: "The Emerald Inheritance",
      description: "A family story filled with ambition, secrets and unexpected choices.",
      genre: "Fashion drama · Mystery",
      status: "draft",
      release: {
        plan: "draft",
        date: ""
      },
      chapters: [chapter]
    };
  }

  function normaliseProject(input) {
    if (!input || typeof input !== "object") {
      throw new Error("That file does not contain a valid project.");
    }

    const chaptersInput = Array.isArray(input.chapters)
      ? input.chapters
      : [];

    const chapters = chaptersInput.map((chapter) => {
      const blocksInput = Array.isArray(chapter.blocks)
        ? chapter.blocks
        : Array.isArray(chapter.scenes)
          ? chapter.scenes
          : [];

      const blocks = blocksInput.map((block) => {
        if (block.type === "paragraph") {
          return {
            id: block.id || uid("block"),
            type: "paragraph",
            text: String(block.text || "")
          };
        }

        if (experienceDefaults[block.type]) {
          return {
            ...makeExperience(block.type),
            ...block,
            id: block.id || uid("experience")
          };
        }

        return null;
      }).filter(Boolean);

      return {
        id: chapter.id || uid("chapter"),
        title: String(chapter.title || "Untitled chapter"),
        blocks: blocks.length ? blocks : [makeParagraph("")]
      };
    });

    const result = {
      schemaVersion: 2,
      id: input.id || uid("story"),
      title: String(input.title || "Untitled story"),
      description: String(input.description || ""),
      genre: String(input.genre || ""),
      status: ["draft", "review", "published"].includes(input.status)
        ? input.status
        : "draft",
      release: {
        plan: input.release && input.release.plan
          ? input.release.plan
          : "draft",
        date: input.release && input.release.date
          ? input.release.date
          : ""
      },
      chapters: chapters.length ? chapters : [makeChapter("Chapter One")]
    };

    return result;
  }

  function setStatus(message) {
    $("saveStatus").textContent = message;
  }

  function saveNow() {
    try {
      project.title = $("storyTitle").value;
      project.description = $("storyDescription").value;
      project.genre = $("storyGenre").value;
      project.status = $("storyStatus").value;
      project.release.plan = $("releasePlan").value;
      project.release.date = $("releaseDate").value;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      setStatus("Saved on this device");
      return true;
    } catch (error) {
      setStatus("Save failed — export a backup");
      return false;
    }
  }

  function scheduleSave() {
    setStatus("Unsaved changes…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 350);
  }

  function loadProject(input) {
    project = normaliseProject(input);
    activeChapterId = project.chapters[0].id;
    selectedBlockId = project.chapters[0].blocks[0].id;

    fillStoryFields();
    renderChapters();
    renderManuscript();
    renderInspector();
    renderReleaseFields();
    saveNow();
  }

  function fillStoryFields() {
    $("storyTitle").value = project.title;
    $("storyDescription").value = project.description;
    $("storyGenre").value = project.genre;
    $("storyStatus").value = project.status;
  }

  function renderReleaseFields() {
    $("releasePlan").value = project.release.plan || "draft";
    $("releaseDate").value = project.release.date || "";
  }

  function renderChapters() {
    const list = $("chapterList");
    list.innerHTML = "";

    project.chapters.forEach((chapter, index) => {
      const button = document.createElement("button");
      button.className = "chapter-link" +
        (chapter.id === activeChapterId ? " active" : "");
      button.type = "button";

      button.innerHTML =
        '<span class="chapter-number">' +
        String(index + 1).padStart(2, "0") +
        '</span><span>' + escapeHtml(chapter.title) + '</span>';

      button.addEventListener("click", () => {
        saveCurrentParagraph();
        activeChapterId = chapter.id;
        selectedBlockId = chapter.blocks[0]
          ? chapter.blocks[0].id
          : "";

        renderChapters();
        renderManuscript();
        renderInspector();
        $("currentChapterLabel").textContent = chapter.title;
        scheduleSave();
      });

      list.appendChild(button);
    });
  }

  function renderManuscript() {
    const chapter = getActiveChapter();
    const container = $("manuscript");

    if (!chapter) {
      container.innerHTML = "<p>No chapter selected.</p>";
      return;
    }

    $("currentChapterLabel").textContent = chapter.title;
    $("manuscriptChapterTitle").textContent = chapter.title;
    container.innerHTML = "";

    chapter.blocks.forEach((block, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "story-block" +
        (block.id === selectedBlockId ? " selected" : "");
      wrapper.dataset.blockId = block.id;

      if (block.type === "paragraph") {
        const textarea = document.createElement("textarea");
        textarea.className = "paragraph-editor";
        textarea.value = block.text || "";
        textarea.placeholder = "Write your story here…";
        textarea.setAttribute("aria-label", "Story paragraph");

        textarea.addEventListener("focus", () => {
          lastFocusedParagraphId = block.id;
          selectedBlockId = block.id;
          updateSelectedStyles();
          renderInspector();
        });

        textarea.addEventListener("input", () => {
          block.text = textarea.value;
          scheduleSave();
        });

        textarea.addEventListener("change", () => {
          block.text = textarea.value;
          scheduleSave();
        });

        wrapper.appendChild(textarea);
      } else {
        const card = document.createElement("div");
        card.className = "experience-card" +
          (block.id === selectedBlockId ? " selected" : "");

        const label = experienceNames[block.type] || "Experience";
        const summary = block.type === "game"
          ? (block.gameUrl || "Add the game's URL in Edit.")
          : block.type === "audio"
            ? (block.audioUrl || block.text || "Add audio details in Edit.")
            : block.type === "choice"
              ? (block.options || []).map((item) => item.label).join(" / ")
              : (block.text || "Select to configure this experience.");

        card.innerHTML =
          '<div class="experience-card-top">' +
            '<span class="experience-type">' + escapeHtml(label) + '</span>' +
            '<span class="experience-badge">EDITABLE</span>' +
          '</div>' +
          '<h3 class="experience-name">' +
            escapeHtml(block.title || label) +
          '</h3>' +
          '<p class="experience-summary">' +
            escapeHtml(summary) +
          '</p>';

        card.addEventListener("click", () => {
          selectedBlockId = block.id;
          renderManuscript();
          renderInspector();
        });

        wrapper.appendChild(card);
      }

      const tools = document.createElement("div");
      tools.className = "block-tools";

      tools.innerHTML =
        '<button type="button" data-action="select">Edit</button>' +
        '<button type="button" data-action="insert">＋ After this</button>' +
        '<button type="button" data-action="up" ' +
          (index === 0 ? "disabled" : "") + '>↑ Move</button>' +
        '<button type="button" data-action="down" ' +
          (index === chapter.blocks.length - 1 ? "disabled" : "") +
          '>↓ Move</button>' +
        '<button type="button" data-action="delete">Remove</button>';

      tools.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button || button.disabled) return;

        event.stopPropagation();
        selectedBlockId = block.id;

        const action = button.dataset.action;

        if (action === "select") {
          renderManuscript();
          renderInspector();
        } else if (action === "insert") {
          openExperienceDialog(block.id);
        } else if (action === "up") {
          moveBlock(block.id, -1);
        } else if (action === "down") {
          moveBlock(block.id, 1);
        } else if (action === "delete") {
          deleteBlock(block.id);
        }
      });

      wrapper.appendChild(tools);
      container.appendChild(wrapper);
    });

    updateSelectedStyles();
  }

  function updateSelectedStyles() {
    document.querySelectorAll(".story-block").forEach((element) => {
      element.classList.toggle(
        "selected",
        element.dataset.blockId === selectedBlockId
      );
    });
  }

  function saveCurrentParagraph() {
    const chapter = getActiveChapter();
    if (!chapter) return;

    const textarea = document.querySelector(
      '.story-block[data-block-id="' + selectedBlockId + '"] textarea'
    );

    if (textarea) {
      const block = chapter.blocks.find(
        (item) => item.id === selectedBlockId
      );

      if (block) block.text = textarea.value;
    }
  }

  function addParagraph(afterId) {
    const chapter = getActiveChapter();
    if (!chapter) return;

    saveCurrentParagraph();

    const paragraph = makeParagraph("");
    let index = chapter.blocks.findIndex((block) => block.id === afterId);

    if (index < 0) {
      chapter.blocks.push(paragraph);
    } else {
      chapter.blocks.splice(index + 1, 0, paragraph);
    }

    selectedBlockId = paragraph.id;
    renderManuscript();
    renderInspector();
    scheduleSave();

    const textarea = document.querySelector(
      '.story-block[data-block-id="' + paragraph.id + '"] textarea'
    );

    if (textarea) textarea.focus();
  }

  function moveBlock(blockId, direction) {
    const chapter = getActiveChapter();
    if (!chapter) return;

    const index = chapter.blocks.findIndex((block) => block.id === blockId);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= chapter.blocks.length) {
      return;
    }

    const item = chapter.blocks.splice(index, 1)[0];
    chapter.blocks.splice(nextIndex, 0, item);

    selectedBlockId = blockId;
    renderManuscript();
    renderInspector();
    scheduleSave();
  }

  function deleteBlock(blockId) {
    const chapter = getActiveChapter();
    if (!chapter) return;

    const block = chapter.blocks.find((item) => item.id === blockId);
    if (!block) return;

    if (!window.confirm("Remove this block from the chapter?")) return;

    chapter.blocks = chapter.blocks.filter((item) => item.id !== blockId);

    if (!chapter.blocks.length) {
      chapter.blocks.push(makeParagraph(""));
    }

    selectedBlockId = chapter.blocks[0].id;
    renderManuscript();
    renderInspector();
    scheduleSave();
  }

  function addChapter() {
    saveCurrentParagraph();

    const chapter = makeChapter("Chapter " + (project.chapters.length + 1));
    project.chapters.push(chapter);
    activeChapterId = chapter.id;
    selectedBlockId = chapter.blocks[0].id;

    renderChapters();
    renderManuscript();
    renderInspector();
    showPanel("writing");
    scheduleSave();
  }

  function openExperienceDialog(afterId) {
    if (afterId) selectedBlockId = afterId;

    const dialog = $("experienceDialog");

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      window.alert("Your browser does not support this dialog. Please use an updated browser.");
    }
  }

  function insertExperience(type) {
    const chapter = getActiveChapter();
    const experience = makeExperience(type);
    if (!chapter || !experience) return;

    saveCurrentParagraph();

    const index = chapter.blocks.findIndex(
      (block) => block.id === selectedBlockId
    );

    chapter.blocks.splice(index < 0 ? chapter.blocks.length : index + 1, 0, experience);
    selectedBlockId = experience.id;

    $("experienceDialog").close();
    renderManuscript();
    renderInspector();
    scheduleSave();
  }

  function field(label, key, value, options) {
    const settings = options || {};
    const tag = settings.multiline ? "textarea" : "input";
    const type = settings.inputType || "text";

    return (
      '<label for="field-' + key + '">' + escapeHtml(label) + '</label>' +
      (tag === "textarea"
        ? '<textarea id="field-' + key + '" data-field="' + key + '">' +
          escapeHtml(value) + '</textarea>'
        : '<input id="field-' + key + '" data-field="' + key + '" type="' +
          type + '" value="' + escapeHtml(value) + '">')
    );
  }

  function renderInspector() {
    const block = getSelectedBlock();
    const panel = $("blockInspector");

    if (!block) {
      panel.innerHTML =
        '<div class="empty-inspector">' +
          '<span class="empty-icon">✧</span>' +
          '<h3>Select something to edit</h3>' +
          '<p>Choose a paragraph or experience in your manuscript.</p>' +
        '</div>';
      return;
    }

    if (block.type === "paragraph") {
      panel.innerHTML =
        '<div class="eyebrow">MANUSCRIPT BLOCK</div>' +
        '<h3>Story paragraph</h3>' +
        '<p class="muted">Edit the text directly in the manuscript. Your changes are saved locally.</p>' +
        '<div class="inspector-actions">' +
          '<button class="button button-quiet" id="inspectorAddAfter">＋ Insert after</button>' +
          '<button class="button button-quiet" id="inspectorDelete">Remove block</button>' +
        '</div>';

      $("inspectorAddAfter").addEventListener("click", () => {
        openExperienceDialog(block.id);
      });

      $("inspectorDelete").addEventListener("click", () => {
        deleteBlock(block.id);
      });

      return;
    }

    const label = experienceNames[block.type] || "Story experience";

    let html =
      '<div class="eyebrow">INLINE EXPERIENCE</div>' +
      '<h3>' + escapeHtml(label) + '</h3>' +
      '<p class="muted">This element belongs to the story at its current position.</p>' +
      field("Display title", "title", block.title || "") +
      field("Description / narration", "text", block.text || "", {
        multiline: true
      });

    if (block.type === "dialogue") {
      html += field("Character name", "character", block.character || "");
    }

    if (block.type === "reveal" || block.type === "image") {
      html += field("Image URL", "imageUrl", block.imageUrl || "", {
        inputType: "url"
      });
      html += '<p class="field-help">Use a direct, publicly accessible image URL. Preview images load from that address.</p>';
    }

    if (block.type === "audio") {
      html += field("Audio URL", "audioUrl", block.audioUrl || "", {
        inputType: "url"
      });
      html += '<p class="field-help">Use a direct audio file URL. This prototype does not upload audio files.</p>';
    }

    if (block.type === "game") {
      html += field("Game URL", "gameUrl", block.gameUrl || "", {
        inputType: "url"
      });
      html += '<p class="field-help">Paste the URL of your existing game. The preview provides a link; it does not embed or control the game engine.</p>';
    }

    if (block.type === "choice") {
      const options = Array.isArray(block.options) ? block.options : [];

      html += '<div class="field-label">Reader choices</div>';

      options.forEach((option, index) => {
        html +=
          '<label for="choice-' + index + '">Choice ' + (index + 1) + '</label>' +
          '<input id="choice-' + index + '" data-choice-label="' + index +
          '" value="' + escapeHtml(option.label || "") + '">' +
          '<label for="target-' + index + '">Target block ID (optional)</label>' +
          '<input id="target-' + index + '" data-choice-target="' + index +
          '" value="' + escapeHtml(option.target || "") + '">';
      });

      html +=
        '<button type="button" class="button button-quiet" id="addChoiceButton">＋ Add choice</button>' +
        '<p class="field-help">Targets are stored as IDs for now. Full branching navigation will be connected to the Reader in a later integration.</p>';
    }

    if (block.type === "chapterEnd") {
      html +=
        '<label for="nextChapterId">Next chapter</label>' +
        '<select id="nextChapterId" data-field="nextChapterId">' +
          '<option value="">Choose a chapter</option>' +
          project.chapters.map((chapter) =>
            '<option value="' + escapeHtml(chapter.id) + '"' +
            (block.nextChapterId === chapter.id ? " selected" : "") + '>' +
            escapeHtml(chapter.title) + '</option>'
          ).join("") +
        '</select>';
    }

    html +=
      '<div class="inspector-actions">' +
        '<button type="button" class="button button-gold" id="saveExperienceButton">Save changes</button>' +
        '<button type="button" class="button button-quiet" id="removeExperienceButton">Remove</button>' +
      '</div>';

    panel.innerHTML = html;

    const addChoiceButton = $("addChoiceButton");

    if (addChoiceButton) {
      addChoiceButton.addEventListener("click", () => {
        readExperienceFields(block);
        block.options = block.options || [];
        block.options.push({
          label: "New choice",
          target: ""
        });
        renderInspector();
        scheduleSave();
      });
    }

    $("saveExperienceButton").addEventListener("click", () => {
      readExperienceFields(block);
      renderManuscript();
      renderInspector();
      scheduleSave();
    });

    $("removeExperienceButton").addEventListener("click", () => {
      deleteBlock(block.id);
    });
  }

  function readExperienceFields(block) {
    document.querySelectorAll("#blockInspector [data-field]").forEach((element) => {
      block[element.dataset.field] = element.value;
    });

    document.querySelectorAll("#blockInspector [data-choice-label]").forEach((element) => {
      const index = Number(element.dataset.choiceLabel);
      block.options = block.options || [];

      if (block.options[index]) {
        block.options[index].label = element.value;
      }
    });

    document.querySelectorAll("#blockInspector [data-choice-target]").forEach((element) => {
      const index = Number(element.dataset.choiceTarget);
      block.options = block.options || [];

      if (block.options[index]) {
        block.options[index].target = element.value;
      }
    });
  }

  function showPanel(name) {
    $("overviewPanel").hidden = name !== "overview";
    $("writingPanel").hidden = name !== "writing";
    $("releasePanel").hidden = name !== "release";

    $("overviewNav").classList.toggle("active", name === "overview");
    $("chaptersNav").classList.toggle("active", name === "writing");
    $("releaseNav").classList.toggle("active", name === "release");

    if (name === "writing") {
      renderChapters();
      renderManuscript();
      renderInspector();
    }
  }

  function makeExport() {
    saveCurrentParagraph();
    saveNow();

    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const baseName = (project.title || "ceeqwinn-story")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "ceeqwinn-story";

    link.href = url;
    link.download = baseName + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importFile(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const input = JSON.parse(reader.result);

        if (!window.confirm(
          "Import this project and replace the current workspace? Export a backup first if you need one."
        )) return;

        loadProject(input);
        showPanel("overview");
        window.alert("Project imported into this browser.");
      } catch (error) {
        window.alert("Import failed. Please choose a valid project JSON file.");
      }

      $("importFile").value = "";
    };

    reader.readAsText(file);
  }

  function openPreview() {
    saveCurrentParagraph();
    saveNow();

    const chapter = getActiveChapter();
    if (!chapter) return;

    previewState = {
      chapter: chapter,
      project: project
    };

    $("previewStoryTitle").textContent = project.title || "Your story";

    if (window.CeeqwinnTheatre) {
      window.CeeqwinnTheatre.render(
        $("theatrePreview"),
        project,
        chapter
      );
    } else {
      $("theatrePreview").textContent = "Theatre preview engine is unavailable.";
    }

    $("previewDialog").showModal();
  }

  function bindEvents() {
    ["storyTitle", "storyDescription", "storyGenre", "storyStatus"].forEach((id) => {
      $(id).addEventListener("input", () => {
        project.title = $("storyTitle").value;
        project.description = $("storyDescription").value;
        project.genre = $("storyGenre").value;
        project.status = $("storyStatus").value;
        scheduleSave();
      });

      $(id).addEventListener("change", scheduleSave);
    });

    $("releasePlan").addEventListener("change", () => {
      project.release.plan = $("releasePlan").value;
      scheduleSave();
    });

    $("releaseDate").addEventListener("change", () => {
      project.release.date = $("releaseDate").value;
      scheduleSave();
    });

    $("saveButton").addEventListener("click", saveNow);
    $("exportButton").addEventListener("click", makeExport);
    $("previewButton").addEventListener("click", openPreview);
    $("previewChapterButton").addEventListener("click", openPreview);
    $("closePreviewButton").addEventListener("click", () => {
      $("previewDialog").close();
    });

    $("overviewNav").addEventListener("click", () => showPanel("overview"));
    $("chaptersNav").addEventListener("click", () => showPanel("writing"));
    $("releaseNav").addEventListener("click", () => showPanel("release"));
    $("startWritingButton").addEventListener("click", () => showPanel("writing"));
    $("backToOverview").addEventListener("click", () => showPanel("overview"));

    $("addChapterButton").addEventListener("click", addChapter);

    $("addParagraphButton").addEventListener("click", () => {
      addParagraph(selectedBlockId);
    });

    $("bottomAddParagraph").addEventListener("click", () => {
      const chapter = getActiveChapter();
      addParagraph(chapter && chapter.blocks.length
        ? chapter.blocks[chapter.blocks.length - 1].id
        : "");
    });

    $("insertExperienceButton").addEventListener("click", () => {
      openExperienceDialog(selectedBlockId);
    });

    document.querySelectorAll(".experience-option").forEach((button) => {
      button.addEventListener("click", () => {
        insertExperience(button.dataset.type);
      });
    });

    $("editTab").addEventListener("click", () => {
      $("blockInspector").hidden = false;
      $("previewInspector").hidden = true;
      $("editTab").classList.add("active");
      $("previewTab").classList.remove("active");
    });

    $("previewTab").addEventListener("click", () => {
      $("blockInspector").hidden = true;
      $("previewInspector").hidden = false;
      $("previewTab").classList.add("active");
      $("editTab").classList.remove("active");
    });

    $("saveReleaseButton").addEventListener("click", () => {
      project.release.plan = $("releasePlan").value;
      project.release.date = $("releaseDate").value;
      saveNow();
      window.alert("Release plan saved in your local project. Nothing has been published.");
    });

    $("importFile").addEventListener("change", (event) => {
      importFile(event.target.files[0]);
    });

    const importButton = document.createElement("button");
    importButton.type = "button";
    importButton.className = "button button-quiet";
    importButton.textContent = "Import";
    importButton.addEventListener("click", () => $("importFile").click());
    $("exportButton").insertAdjacentElement("afterend", importButton);

    window.addEventListener("beforeunload", () => {
      saveCurrentParagraph();
      saveNow();
    });
  }

  function start() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        project = normaliseProject(JSON.parse(saved));
      } else {
        project = createStarterProject();
      }
    } catch (error) {
      project = createStarterProject();
    }

    activeChapterId = project.chapters[0].id;
    selectedBlockId = project.chapters[0].blocks[0].id;

    fillStoryFields();
    renderReleaseFields();
    renderChapters();
    renderManuscript();
    renderInspector();
    bindEvents();
    saveNow();
    showPanel("overview");
  }

  start();
})();
