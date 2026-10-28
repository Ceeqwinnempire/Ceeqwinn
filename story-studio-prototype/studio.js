
(function () {
  "use strict";

  const STORAGE_KEY = "ceeqwinn_story_studio_v3";
  const SETTINGS_KEY = "ceeqwinn_story_studio_settings_v1";
  const $ = (id) => document.getElementById(id);
  const state = {
    project: null,
    chapterId: "",
    selectedBlockId: "",
    activePanel: "writingPanel",
    settings: null,
    saveTimer: null
  };

  const defaultSettings = {
    showHints: true,
    darkMode: true,
    fontFamily: "Georgia, serif",
    fontSize: 18,
    accent: "#d6ad68",
    background: "#260d1b",
    panel: "#381b2c",
    transition: "fade",
    reduceMotion: false
  };

  const palette = [
    "#7c1537", "#a51e45", "#c62852", "#e34370", "#ef82a7",
    "#d00069", "#a92b81", "#6e255f", "#d6ad68", "#f1d9a4",
    "#f8f0f4", "#b9b4bb", "#747078", "#181318", "#263c68"
  ];

  const makeId = (prefix) => prefix + "-" + Date.now().toString(36) +
    "-" + Math.random().toString(36).slice(2, 7);

  function escapeText(value) {
    return String(value == null ? "" : value);
  }

  function starterProject() {
    return {
      schemaVersion: 3,
      id: "ceeqwinn-story-" + Date.now().toString(36),
      title: "The Emerald Inheritance",
      description: "A family drama of ambition, secrets, fashion and unexpected choices.",
      genre: "Fashion drama · Mystery",
      status: "draft",
      slug: "emerald-inheritance",
      release: { plan: "draft", date: "" },
      theme: { accent: "#d6ad68", background: "#260d1b", text: "#fbf2f6", panel: "#381b2c" },
      folders: ["Opening"],
      assets: [],
      chapters: [{
        id: makeId("chapter"),
        title: "The Grand Entrance",
        folder: "Opening",
        blocks: [
          { id: makeId("paragraph"), type: "paragraph", text: "The grand doors opened, revealing a hall illuminated by crystal chandeliers. Conversations softened as the guests turned toward the entrance." }
        ]
      }]
    };
  }

  function currentChapter() {
    return state.project.chapters.find((chapter) => chapter.id === state.chapterId)
      || state.project.chapters[0];
  }

  function currentBlock() {
    const chapter = currentChapter();
    return chapter && chapter.blocks.find((block) => block.id === state.selectedBlockId);
  }

  function notify(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    $("toastRegion").appendChild(toast);
    window.setTimeout(() => toast.remove(), 3600);
  }

  function setSaveStatus(message) {
    $("saveStatus").textContent = message;
  }

  function saveNow() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
      setSaveStatus("Saved in this browser");
    } catch (error) {
      setSaveStatus("Browser storage full");
      notify("The draft could not be fully saved. Export a backup and remove large files or videos from the project.");
    }
  }

  function scheduleSave() {
    setSaveStatus("Saving…");
    clearTimeout(state.saveTimer);
    state.saveTimer = window.setTimeout(saveNow, 250);
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      state.settings = Object.assign({}, defaultSettings, saved);
    } catch (error) {
      state.settings = Object.assign({}, defaultSettings);
    }
  }

  function loadProject() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.chapters)) {
        state.project = saved;
        state.project.schemaVersion = 3;
        state.project.assets = Array.isArray(saved.assets) ? saved.assets : [];
        state.project.chapters.forEach((chapter) => {
          chapter.blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
          if (!chapter.folder) chapter.folder = "Unsorted";
        });
      } else {
        state.project = starterProject();
      }
    } catch (error) {
      state.project = starterProject();
      notify("The saved draft could not be read. A fresh project was opened.");
    }
    if (!state.project.chapters.length) {
      state.project.chapters.push({ id: makeId("chapter"), title: "Chapter One", folder: "Unsorted", blocks: [] });
    }
    state.chapterId = state.project.chapters[0].id;
    applySettingsToPage();
  }

  function showPanel(panelId) {
    state.activePanel = panelId;
    document.querySelectorAll(".workspace-panel").forEach((panel) => {
      panel.hidden = panel.id !== panelId;
    });
    document.querySelectorAll(".nav-item").forEach((button) => {
      button.classList.toggle("active", button.dataset.panel === panelId);
    });
  }

  function renderAll() {
    renderChapterList();
    renderManuscript();
    renderInspector();
    renderOverview();
    renderAssetShelf();
    updatePublishUrl();
    $("currentChapterLabel").textContent = currentChapter().title || "Untitled chapter";
    $("manuscriptChapterTitle").value = currentChapter().title || "";
    $("previewStoryTitle").textContent = state.project.title || "Untitled story";
    updateCounts();
  }

  function renderChapterList() {
    const list = $("chapterList");
    list.replaceChildren();

    state.project.chapters.forEach((chapter) => {
      const row = document.createElement("div");
      row.className = "chapter-nav-item";
      const open = document.createElement("button");
      open.type = "button";
      open.className = "chapter-open" + (chapter.id === state.chapterId ? " active" : "");
      open.textContent = chapter.title || "Untitled chapter";
      open.title = chapter.title || "Untitled chapter";
      open.addEventListener("click", () => {
        state.chapterId = chapter.id;
        state.selectedBlockId = "";
        showPanel("writingPanel");
        renderAll();
      });
      row.appendChild(open);

      const move = document.createElement("button");
      move.type = "button";
      move.className = "chapter-move";
      move.textContent = "↕";
      move.title = "Move chapter up";
      move.addEventListener("click", () => {
        const index = state.project.chapters.findIndex((item) => item.id === chapter.id);
        if (index > 0) {
          [state.project.chapters[index - 1], state.project.chapters[index]] =
            [state.project.chapters[index], state.project.chapters[index - 1]];
          scheduleSave();
          renderAll();
        }
      });
      row.appendChild(move);
      list.appendChild(row);
    });
  }

  function createBlock(type) {
    const block = { id: makeId(type), type: type };
    const defaults = {
      paragraph: { text: "" },
      narration: { title: "Narration", text: "" },
      dialogue: { title: "Dialogue", character: "", text: "" },
      reveal: { title: "Visual reveal", text: "", imageUrl: "" },
      image: { title: "Illustration", text: "", imageUrl: "" },
      video: { title: "Short video", text: "", videoUrl: "" },
      audio: { title: "Audio", text: "", audioUrl: "" },
      choice: { title: "Reader choice", text: "", options: [{ label: "Option one", target: "" }, { label: "Option two", target: "" }] },
      game: { title: "Game", text: "", gameUrl: "" },
      chapterEnd: { title: "Continue the story", text: "", nextChapterId: "" },
      reference: { title: "Reference file", assetId: "" }
    };
    return Object.assign(block, defaults[type] || { title: "Story experience", text: "" });
  }

  function addBlock(type) {
    const chapter = currentChapter();
    if (!chapter) return;
    const block = createBlock(type);
    const selectedIndex = chapter.blocks.findIndex((item) => item.id === state.selectedBlockId);
    const insertAt = selectedIndex >= 0 ? selectedIndex + 1 : chapter.blocks.length;
    chapter.blocks.splice(insertAt, 0, block);
    state.selectedBlockId = block.id;
    showPanel("writingPanel");
    scheduleSave();
    renderAll();
    window.setTimeout(() => {
      const target = document.querySelector('[data-block-id="' + block.id + '"]');
      if (target) target.scrollIntoView({ behavior: state.settings.reduceMotion ? "auto" : "smooth", block: "center" });
      const textArea = target && target.querySelector(".block-text");
      if (textArea) textArea.focus();
    }, 40);
  }

  function moveBlock(blockId, direction) {
    const chapter = currentChapter();
    const index = chapter.blocks.findIndex((block) => block.id === blockId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= chapter.blocks.length) return;
    [chapter.blocks[index], chapter.blocks[target]] = [chapter.blocks[target], chapter.blocks[index]];
    scheduleSave();
    renderManuscript();
  }

  function removeBlock(blockId) {
    const chapter = currentChapter();
    const index = chapter.blocks.findIndex((block) => block.id === blockId);
    if (index < 0) return;
    if (!window.confirm("Delete this block? This cannot be undone unless you have a backup.")) return;
    chapter.blocks.splice(index, 1);
    if (state.selectedBlockId === blockId) state.selectedBlockId = "";
    scheduleSave();
    renderAll();
  }

  function blockLabel(block) {
    const names = {
      paragraph: "Writing paragraph", narration: "Narration", dialogue: "Dialogue",
      reveal: "Visual reveal", image: "Image / GIF", video: "Short video",
      audio: "Audio", choice: "Reader choice", game: "Game link",
      chapterEnd: "Chapter transition", reference: "Reference file"
    };
    return names[block.type] || "Story block";
  }

  function renderManuscript() {
    const container = $("manuscript");
    container.replaceChildren();
    const chapter = currentChapter();

    if (!chapter.blocks.length) {
      const empty = document.createElement("p");
      empty.className = "block-empty";
      empty.textContent = "A fresh page. Write a paragraph or add an experience below.";
      container.appendChild(empty);
    }

    chapter.blocks.forEach((block, index) => {
      const card = document.createElement("article");
      card.className = "story-block" + (block.id === state.selectedBlockId ? " selected" : "");
      card.dataset.blockId = block.id;
      card.addEventListener("click", () => {
        if (state.selectedBlockId !== block.id) {
          state.selectedBlockId = block.id;
          renderManuscript();
          renderInspector();
        }
      });

      const header = document.createElement("div");
      header.className = "block-header";
      const label = document.createElement("span");
      label.className = "block-type";
      label.textContent = (index + 1) + " · " + blockLabel(block);
      header.appendChild(label);

      const tools = document.createElement("div");
      tools.className = "block-tools";
      [
        ["↑", "Move up", () => moveBlock(block.id, -1)],
        ["↓", "Move down", () => moveBlock(block.id, 1)],
        ["＋", "Add after this block", () => { state.selectedBlockId = block.id; addBlock("paragraph"); }],
        ["×", "Delete block", () => removeBlock(block.id)]
      ].forEach(([text, title, action]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.title = title;
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          action();
        });
        tools.appendChild(button);
      });
      header.appendChild(tools);
      card.appendChild(header);

      if (block.type !== "paragraph" && block.type !== "reference") {
        const title = document.createElement("input");
        title.className = "block-title-input";
        title.placeholder = "Experience title";
        title.value = block.title || "";
        title.setAttribute("aria-label", "Block title");
        title.addEventListener("click", (event) => event.stopPropagation());
        title.addEventListener("input", () => {
          block.title = title.value;
          scheduleSave();
          $("previewStoryTitle").textContent = state.project.title || "Untitled story";
        });
        card.appendChild(title);
      }

      if (block.type !== "reference") {
        const textarea = document.createElement("textarea");
        textarea.className = "block-text";
        textarea.placeholder = block.type === "paragraph" ? "Start writing this paragraph…" : "Add the text for this experience…";
        textarea.value = block.text || "";
        textarea.setAttribute("aria-label", blockLabel(block) + " text");
        textarea.addEventListener("click", (event) => event.stopPropagation());
        textarea.addEventListener("input", () => {
          block.text = textarea.value;
          scheduleSave();
          updateCounts();
        });
        card.appendChild(textarea);
      } else {
        card.appendChild(createReferenceSummary(block));
      }

      if (block.type === "dialogue") {
        const character = document.createElement("input");
        character.className = "block-title-input";
        character.placeholder = "Character / speaker name";
        character.value = block.character || "";
        character.addEventListener("click", (event) => event.stopPropagation());
        character.addEventListener("input", () => { block.character = character.value; scheduleSave(); });
        card.appendChild(character);
      }

      const urlField = getMediaField(block);
      if (urlField) {
        const url = document.createElement("input");
        url.className = "block-title-input";
        url.placeholder = urlField.placeholder;
        url.value = block[urlField.key] || "";
        url.setAttribute("aria-label", urlField.placeholder);
        url.addEventListener("click", (event) => event.stopPropagation());
        url.addEventListener("input", () => { block[urlField.key] = url.value; scheduleSave(); });
        card.appendChild(url);
      }

      if (block.type === "choice") {
        const summary = document.createElement("p");
        summary.className = "block-meta";
        summary.textContent = (block.options || []).length + " choice options · edit labels in the selected block inspector";
        card.appendChild(summary);
      }
      if (block.type === "reference") card.appendChild(createReferenceSummary(block));

      container.appendChild(card);
    });
  }

  function getMediaField(block) {
    if (block.type === "image" || block.type === "reveal") return { key: "imageUrl", placeholder: "Image or GIF URL (optional if attached from Asset shelf)" };
    if (block.type === "video") return { key: "videoUrl", placeholder: "Direct video URL (MP4/WebM)" };
    if (block.type === "audio") return { key: "audioUrl", placeholder: "Direct audio URL" };
    if (block.type === "game") return { key: "gameUrl", placeholder: "Game URL" };
    return null;
  }

  function createReferenceSummary(block) {
    const p = document.createElement("p");
    p.className = "block-meta";
    const asset = state.project.assets.find((item) => item.id === block.assetId);
    p.textContent = asset ? "Attached reference: " + asset.name : "No reference attached. Choose one from the inspector or Asset shelf.";
    return p;
  }

  function addInspectorField(parent, labelText, value, onInput, options) {
    options = options || {};
    const label = document.createElement("label");
    label.className = "field-label";
    label.textContent = labelText;
    let field;
    if (options.select) {
      field = document.createElement("select");
      options.select.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        field.appendChild(option);
      });
      field.value = value || "";
    } else if (options.textarea) {
      field = document.createElement("textarea");
      field.rows = options.rows || 3;
      field.value = value || "";
    } else {
      field = document.createElement("input");
      field.value = value || "";
      field.placeholder = options.placeholder || "";
    }
    label.appendChild(field);
    field.addEventListener("input", () => onInput(field.value));
    parent.appendChild(label);
    return field;
  }

  function renderInspector() {
    const container = $("inspectorContent");
    container.replaceChildren();
    const block = currentBlock();

    if (!block) {
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = "Select a block in your chapter to edit its details. The extra controls stay here, out of your way.";
      container.appendChild(note);
      return;
    }

    const typeNote = document.createElement("p");
    typeNote.className = "inspector-note";
    typeNote.textContent = blockLabel(block);
    container.appendChild(typeNote);

    if (block.type !== "paragraph" && block.type !== "reference") {
      addInspectorField(container, "Experience title", block.title, (value) => {
        block.title = value; scheduleSave(); renderManuscript();
      });
    }
    if (block.type === "dialogue") {
      addInspectorField(container, "Speaker", block.character, (value) => {
        block.character = value; scheduleSave(); renderManuscript();
      });
    }

    const media = getMediaField(block);
    if (media) {
      addInspectorField(container, media.placeholder, block[media.key], (value) => {
        block[media.key] = value; scheduleSave(); renderManuscript();
      });
    }

    if (block.type === "choice") {
      const heading = document.createElement("h3");
      heading.textContent = "Choice options";
      container.appendChild(heading);
      block.options = Array.isArray(block.options) ? block.options : [];
      block.options.forEach((option, index) => {
        addInspectorField(container, "Option " + (index + 1), option.label, (value) => {
          option.label = value; scheduleSave();
        });
        addInspectorField(container, "Target chapter ID (optional)", option.target, (value) => {
          option.target = value; scheduleSave();
        });
      });
      const add = document.createElement("button");
      add.className = "button secondary full-width";
      add.type = "button";
      add.textContent = "＋ Add choice option";
      add.addEventListener("click", () => {
        block.options.push({ label: "New choice", target: "" });
        scheduleSave(); renderInspector(); renderManuscript();
      });
      container.appendChild(add);
      const note = document.createElement("p");
      note.className = "inspector-note";
      note.textContent = "Targets are saved as IDs for future branch integration. Full conditional branching is not enabled yet.";
      container.appendChild(note);
    }

    if (block.type === "chapterEnd") {
      const choices = [{ label: "No next chapter", value: "" }].concat(state.project.chapters.map((chapter) => ({ label: chapter.title, value: chapter.id })));
      addInspectorField(container, "Next chapter", block.nextChapterId, (value) => {
        block.nextChapterId = value; scheduleSave(); renderManuscript();
      }, { select: choices });
    }

    if (block.type === "reference") {
      const choices = [{ label: "Choose a reference file", value: "" }].concat(state.project.assets.map((asset) => ({ label: asset.name, value: asset.id })));
      addInspectorField(container, "Attached reference", block.assetId, (value) => {
        block.assetId = value; scheduleSave(); renderManuscript();
      }, { select: choices });
    }

    if (["image", "reveal", "video", "audio"].includes(block.type)) {
      const choices = [{ label: "Choose media from Asset shelf", value: "" }].concat(
        state.project.assets.filter((asset) => asset.kind === "image" || asset.kind === "video" || asset.kind === "audio")
          .map((asset) => ({ label: asset.name, value: asset.id }))
      );
      const mediaPicker = addInspectorField(container, "Attach saved media", block.assetId || "", (value) => {
        block.assetId = value;
        const asset = state.project.assets.find((item) => item.id === value);
        if (asset && asset.dataUrl) {
          if (asset.kind === "image") block.imageUrl = asset.dataUrl;
          if (asset.kind === "video") block.videoUrl = asset.dataUrl;
          if (asset.kind === "audio") block.audioUrl = asset.dataUrl;
        }
        scheduleSave(); renderManuscript();
      }, { select: choices });
      mediaPicker.value = block.assetId || "";
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button quiet full-width";
    deleteButton.style.marginTop = "18px";
    deleteButton.textContent = "Delete this block";
    deleteButton.addEventListener("click", () => removeBlock(block.id));
    container.appendChild(deleteButton);
  }

  function renderOverview() {
    $("storyTitle").value = state.project.title || "";
    $("storyDescription").value = state.project.description || "";
    $("storyGenre").value = state.project.genre || "";
    $("storyStatus").value = state.project.status || "draft";
    $("storySlug").value = state.project.slug || slugify(state.project.title);
    const list = $("overviewChapterList");
    list.replaceChildren();

    state.project.chapters.forEach((chapter, index) => {
      const row = document.createElement("div");
      row.className = "overview-chapter";
      const open = document.createElement("button");
      open.type = "button";
      open.textContent = (index + 1) + ". " + (chapter.title || "Untitled chapter") + " · " + chapter.blocks.length + " blocks";
      open.addEventListener("click", () => {
        state.chapterId = chapter.id;
        state.selectedBlockId = "";
        showPanel("writingPanel");
        renderAll();
      });
      row.appendChild(open);
      list.appendChild(row);
    });
  }

  function updateCounts() {
    const chapters = state.project.chapters;
    const blocks = chapters.reduce((sum, chapter) => sum + chapter.blocks.length, 0);
    const words = chapters.reduce((sum, chapter) => sum + chapter.blocks.reduce((total, block) => total + (String(block.text || "").trim().match(/\S+/g) || []).length, 0), 0);
    $("chapterCount").textContent = chapters.length;
    $("blockCount").textContent = blocks;
    $("wordCount").textContent = words;
    $("assetCount").textContent = state.project.assets.length;
    $("assetShelfCount").textContent = state.project.assets.length + " files";
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function kindForFile(file) {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
    if (/\.(doc|docx|odt|rtf)$/i.test(file.name)) return "document";
    if (/\.(xls|xlsx|ppt|pptx|zip)$/i.test(file.name)) return "file";
    if (/\.(txt|md|json)$/i.test(file.name)) return "text";
    return "file";
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read " + file.name));
      reader.readAsDataURL(file);
    });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    let added = 0;

    for (const file of files) {
      if (!file || file.size === 0) continue;
      if (file.size > 18 * 1024 * 1024) {
        notify(file.name + " is larger than 18 MB. Keep large files externally and add a link instead.");
        continue;
      }
      try {
        const dataUrl = await readAsDataUrl(file);
        state.project.assets.push({
          id: makeId("asset"),
          name: file.name,
          type: file.type || "application/octet-stream",
          kind: kindForFile(file),
          size: file.size,
          lastModified: file.lastModified || 0,
          relativePath: file.webkitRelativePath || file.name,
          dataUrl: dataUrl,
          addedAt: new Date().toISOString()
        });
        added++;
      } catch (error) {
        notify("Could not add " + file.name + ".");
      }
    }

    if (added) {
      scheduleSave();
      renderAssetShelf();
      renderOverview();
      updateCounts();
      notify(added + " file" + (added === 1 ? "" : "s") + " added to your local asset shelf.");
    }
  }

  function assetIcon(asset) {
    return ({ image: "▧", video: "▶", audio: "♫", pdf: "PDF", document: "DOC", text: "TXT", file: "FILE" })[asset.kind] || "FILE";
  }

  function renderAssetShelf() {
    const shelf = $("assetShelf");
    shelf.replaceChildren();

    if (!state.project.assets.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Your shelf is empty. Drop files above to start collecting your story materials.";
      shelf.appendChild(empty);
      return;
    }

    state.project.assets.forEach((asset) => {
      const card = document.createElement("article");
      card.className = "asset-card";
      const thumb = document.createElement("div");
      thumb.className = "asset-thumb";

      if (asset.kind === "image" && asset.dataUrl) {
        const image = document.createElement("img");
        image.src = asset.dataUrl;
        image.alt = asset.name;
        thumb.appendChild(image);
      } else if (asset.kind === "video" && asset.dataUrl) {
        const video = document.createElement("video");
        video.src = asset.dataUrl;
        video.muted = true;
        video.preload = "metadata";
        video.controls = true;
        thumb.appendChild(video);
      } else {
        thumb.textContent = assetIcon(asset);
      }
      card.appendChild(thumb);

      const name = document.createElement("span");
      name.className = "asset-name";
      name.textContent = asset.name;
      card.appendChild(name);

      const size = document.createElement("p");
      size.className = "asset-size";
      size.textContent = formatSize(asset.size || 0) + " · " + asset.kind;
      card.appendChild(size);

      const actions = document.createElement("div");
      actions.className = "asset-actions";

      if (asset.dataUrl) {
        const open = document.createElement("a");
        open.href = asset.dataUrl;
        open.target = "_blank";
        open.rel = "noopener";
        open.textContent = "Open";
        actions.appendChild(open);

        const download = document.createElement("a");
        download.href = asset.dataUrl;
        download.download = asset.name;
        download.textContent = "Save copy";
        actions.appendChild(download);
      }

      if (["image", "video", "audio"].includes(asset.kind)) {
        const insert = document.createElement("button");
        insert.type = "button";
        insert.textContent = "Use in story";
        insert.addEventListener("click", () => insertAssetIntoStory(asset));
        actions.appendChild(insert);
      } else {
        const attach = document.createElement("button");
        attach.type = "button";
        attach.textContent = "Attach reference";
        attach.addEventListener("click", () => {
          const block = createBlock("reference");
          block.assetId = asset.id;
          const chapter = currentChapter();
          const index = chapter.blocks.findIndex((item) => item.id === state.selectedBlockId);
          chapter.blocks.splice(index >= 0 ? index + 1 : chapter.blocks.length, 0, block);
          state.selectedBlockId = block.id;
          showPanel("writingPanel");
          scheduleSave();
          renderAll();
        });
        actions.appendChild(attach);
      }

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        if (!window.confirm("Remove " + asset.name + " from this project's asset shelf?")) return;
        state.project.assets = state.project.assets.filter((item) => item.id !== asset.id);
        state.project.chapters.forEach((chapter) => chapter.blocks.forEach((block) => {
          if (block.assetId === asset.id) block.assetId = "";
        }));
        scheduleSave();
        renderAll();
      });
      actions.appendChild(remove);
      card.appendChild(actions);
      shelf.appendChild(card);
    });
  }

  function insertAssetIntoStory(asset) {
    const type = asset.kind === "image" ? "image" : asset.kind === "video" ? "video" : "audio";
    const block = createBlock(type);
    block.title = asset.name;
    block.assetId = asset.id;
    if (asset.kind === "image") block.imageUrl = asset.dataUrl || "";
    if (asset.kind === "video") block.videoUrl = asset.dataUrl || "";
    if (asset.kind === "audio") block.audioUrl = asset.dataUrl || "";
    const chapter = currentChapter();
    const index = chapter.blocks.findIndex((item) => item.id === state.selectedBlockId);
    chapter.blocks.splice(index >= 0 ? index + 1 : chapter.blocks.length, 0, block);
    state.selectedBlockId = block.id;
    showPanel("writingPanel");
    scheduleSave();
    renderAll();
    notify("Added " + asset.name + " to the chapter.");
  }

  async function collectDroppedEntries(dataTransfer) {
    const output = [];
    const entries = Array.from(dataTransfer.items || []).map((item) => {
      return item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
    }).filter(Boolean);

    async function walk(entry, path) {
      if (entry.isFile) {
        const file = await new Promise((resolve) => entry.file(resolve, () => resolve(null)));
        if (file) {
          try {
            Object.defineProperty(file, "webkitRelativePath", { value: path + file.name });
          } catch (error) {}
          output.push(file);
        }
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const readBatch = () => new Promise((resolve) => reader.readEntries(resolve, () => resolve([])));
        let batch;
        do {
          batch = await readBatch();
          for (const child of batch) await walk(child, path + entry.name + "/");
        } while (batch.length);
      }
    }

    if (entries.length) {
      for (const entry of entries) await walk(entry, "");
      return output;
    }
    return Array.from(dataTransfer.files || []);
  }

  function slugify(value) {
    return String(value || "my-story").toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "my-story";
  }

  function updatePublishUrl() {
    const slug = slugify($("storySlug").value || state.project.slug || state.project.title);
    $("publicUrlPreview").textContent = window.location.origin + "/read.html?story=" + slug;
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportProject() {
    saveNow();
    downloadJson(slugify(state.project.title) + "-project-backup.json", state.project);
    notify("Project backup exported. Keep it somewhere safe.");
  }

  function exportReaderStory() {
    const project = JSON.parse(JSON.stringify(state.project));
    project.slug = slugify($("storySlug").value || project.slug || project.title);
    project.theme = Object.assign({}, project.theme, {
      accent: state.settings.accent,
      background: state.settings.background,
      panel: state.settings.panel
    });
    project.status = "ready";
    downloadJson(project.slug + ".json", project);
    notify("Reader JSON exported. Upload it to the website's stories folder to publish.");
  }

  async function importProject(file) {
    if (!file) return;
    try {
      const incoming = JSON.parse(await file.text());
      if (!incoming || !Array.isArray(incoming.chapters)) throw new Error("This is not a Studio project backup.");
      if (!window.confirm("Open this project backup? It will replace the draft currently open in the Studio.")) return;
      incoming.schemaVersion = 3;
      incoming.assets = Array.isArray(incoming.assets) ? incoming.assets : [];
      incoming.chapters.forEach((chapter) => {
        chapter.blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
        if (!chapter.folder) chapter.folder = "Unsorted";
      });
      state.project = incoming;
      if (!state.project.chapters.length) state.project.chapters.push({ id: makeId("chapter"), title: "Chapter One", folder: "Unsorted", blocks: [] });
      state.chapterId = state.project.chapters[0].id;
      state.selectedBlockId = "";
      scheduleSave();
      renderAll();
      notify("Project backup opened.");
    } catch (error) {
      notify("Could not open that JSON file. Choose a valid Studio project backup.");
    }
  }

  function applySettingsToPage() {
    const settings = state.settings;
    document.documentElement.style.setProperty("--accent", settings.accent);
    document.documentElement.style.setProperty("--bg", settings.background);
    document.documentElement.style.setProperty("--panel", settings.panel);
    document.documentElement.style.setProperty("--writing-font", settings.fontFamily);
    document.documentElement.style.setProperty("--writing-size", settings.fontSize + "px");
    document.body.classList.toggle("hide-hints", !settings.showHints);
    document.body.classList.toggle("light-workspace", !settings.darkMode);
    document.body.classList.toggle("reduce-motion", settings.reduceMotion);
    if (state.project) {
      state.project.theme = Object.assign({}, state.project.theme, {
        accent: settings.accent, background: settings.background, panel: settings.panel
      });
    }
  }

  function openSettings() {
    const s = state.settings;
    $("showHintsSetting").checked = s.showHints;
    $("darkModeSetting").checked = s.darkMode;
    $("fontFamilySetting").value = s.fontFamily;
    $("fontSizeSetting").value = s.fontSize;
    $("accentSetting").value = s.accent;
    $("backgroundSetting").value = s.background;
    $("panelSetting").value = s.panel;
    $("transitionSetting").value = s.transition;
    $("reduceMotionSetting").checked = s.reduceMotion;
    renderPalette();
    $("settingsDialog").showModal();
  }

  function renderPalette() {
    const container = $("paletteSwatches");
    container.replaceChildren();
    palette.forEach((colour) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "palette-swatch";
      button.style.background = colour;
      button.title = "Use " + colour;
      button.setAttribute("aria-label", "Use colour " + colour);
      button.addEventListener("click", () => {
        $("accentSetting").value = colour;
      });
      container.appendChild(button);
    });
  }

  function saveSettings() {
    state.settings = {
      showHints: $("showHintsSetting").checked,
      darkMode: $("darkModeSetting").checked,
      fontFamily: $("fontFamilySetting").value,
      fontSize: Number($("fontSizeSetting").value),
      accent: $("accentSetting").value,
      background: $("backgroundSetting").value,
      panel: $("panelSetting").value,
      transition: $("transitionSetting").value,
      reduceMotion: $("reduceMotionSetting").checked
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    applySettingsToPage();
    scheduleSave();
    $("settingsDialog").close();
    notify("Studio settings saved.");
  }

  function resetSettings() {
    state.settings = Object.assign({}, defaultSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    applySettingsToPage();
    openSettings();
  }

  function openPreview() {
    $("previewStoryTitle").textContent = state.project.title || "Untitled story";
    const frame = $("previewFrame");
    frame.classList.remove("phone-preview", "tablet-preview", "desktop-preview");
    frame.classList.add(($("previewSize").value || "phone") + "-preview");
    window.CeeqwinnTheatre.render($("theatrePreview"), state.project, currentChapter(), {
      mode: "preview",
      onNavigate: (id) => {
        const chapter = state.project.chapters.find((item) => item.id === id);
        if (!chapter) return;
        state.chapterId = id;
        renderAll();
        openPreview();
      },
      onChoice: () => {}
    });
    $("previewDialog").showModal();
  }

  function addChapter() {
    const title = window.prompt("Chapter title:", "New chapter");
    if (title === null) return;
    const chapter = { id: makeId("chapter"), title: title.trim() || "Untitled chapter", folder: "Unsorted", blocks: [] };
    state.project.chapters.push(chapter);
    state.chapterId = chapter.id;
    state.selectedBlockId = "";
    scheduleSave();
    showPanel("writingPanel");
    renderAll();
  }

  function renameChapter() {
    const chapter = currentChapter();
    const title = window.prompt("Chapter title:", chapter.title || "");
    if (title === null) return;
    chapter.title = title.trim() || "Untitled chapter";
    scheduleSave();
    renderAll();
  }

  function deleteChapter() {
    if (state.project.chapters.length <= 1) {
      notify("A story needs at least one chapter.");
      return;
    }
    if (!window.confirm("Delete this chapter and its blocks? Export a backup first if you may need it.")) return;
    const index = state.project.chapters.findIndex((chapter) => chapter.id === state.chapterId);
    state.project.chapters.splice(index, 1);
    state.chapterId = state.project.chapters[Math.max(0, index - 1)].id;
    state.selectedBlockId = "";
    scheduleSave();
    renderAll();
  }

  function bind() {
    document.querySelectorAll(".nav-item").forEach((button) => {
      button.addEventListener("click", () => showPanel(button.dataset.panel));
    });
    $("addChapterButton").addEventListener("click", addChapter);
    $("overviewAddChapterButton").addEventListener("click", addChapter);
    $("renameChapterButton").addEventListener("click", renameChapter);
    $("deleteChapterButton").addEventListener("click", deleteChapter);
    $("newWritingBatchButton").addEventListener("click", () => addBlock("paragraph"));
    $("addParagraphButton").addEventListener("click", () => addBlock("paragraph"));
    $("insertExperienceButton").addEventListener("click", () => $("experienceDialog").showModal());
    $("addImageButton").addEventListener("click", () => {
      showPanel("assetsPanel");
      $("assetFileInput").accept = "image/*";
      $("assetFileInput").click();
    });
    $("addVideoButton").addEventListener("click", () => {
      showPanel("assetsPanel");
      $("assetFileInput").accept = "video/*";
      $("assetFileInput").click();
    });
    $("addReferenceButton").addEventListener("click", () => {
      showPanel("assetsPanel");
      $("assetFileInput").accept = ".pdf,.doc,.docx,.txt,.md,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.json";
      $("assetFileInput").click();
    });
    document.querySelectorAll(".experience-option").forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.type;
        $("experienceDialog").close();
        addBlock(type);
      });
    });
    document.querySelectorAll(".dialog-close").forEach((button) => {
      button.addEventListener("click", () => button.closest("dialog").close());
    });
    $("settingsButton").addEventListener("click", openSettings);
    $("saveSettingsButton").addEventListener("click", saveSettings);
    $("resetSettingsButton").addEventListener("click", resetSettings);
    $("previewButton").addEventListener("click", openPreview);
    $("previewChapterButton").addEventListener("click", openPreview);
    $("closePreviewButton").addEventListener("click", () => $("previewDialog").close());
    $("previewSize").addEventListener("change", () => {
      $("previewFrame").classList.remove("phone-preview", "tablet-preview", "desktop-preview");
      $("previewFrame").classList.add($("previewSize").value + "-preview");
    });
    $("backToOverview").addEventListener("click", () => showPanel("overviewPanel"));
    $("overviewStartWritingButton").addEventListener("click", () => showPanel("writingPanel"));
    $("clearSelectionButton").addEventListener("click", () => {
      state.selectedBlockId = "";
      renderManuscript();
      renderInspector();
    });
    $("manuscriptChapterTitle").addEventListener("input", () => {
      currentChapter().title = $("manuscriptChapterTitle").value;
      $("currentChapterLabel").textContent = currentChapter().title || "Untitled chapter";
      scheduleSave();
      renderChapterList();
    });

    [["storyTitle", "title"], ["storyDescription", "description"], ["storyGenre", "genre"], ["storyStatus", "status"]].forEach(([id, key]) => {
      $(id).addEventListener("input", () => {
        state.project[key] = $(id).value;
        if (key === "title") {
          $("previewStoryTitle").textContent = $(id).value || "Untitled story";
          if (!$("storySlug").dataset.edited) $("storySlug").value = slugify($(id).value);
        }
        updatePublishUrl();
        scheduleSave();
      });
    });
    $("storySlug").addEventListener("input", () => {
      $("storySlug").dataset.edited = "true";
      state.project.slug = slugify($("storySlug").value);
      updatePublishUrl();
      scheduleSave();
    });
    $("exportButton").addEventListener("click", exportProject);
    $("publishingExportButton").addEventListener("click", exportProject);
    $("exportPublishButton").addEventListener("click", exportReaderStory);
    $("importButton").addEventListener("click", () => $("importFile").click());
    $("importFile").addEventListener("change", () => {
      importProject($("importFile").files[0]);
      $("importFile").value = "";
    });

    $("chooseAssetsButton").addEventListener("click", () => $("assetFileInput").click());
    $("dropChooseFilesButton").addEventListener("click", (event) => {
      event.stopPropagation();
      $("assetFileInput").click();
    });
    $("chooseFolderButton").addEventListener("click", (event) => {
      event.stopPropagation();
      $("assetFolderInput").click();
    });
    $("assetFileInput").addEventListener("change", () => {
      addFiles($("assetFileInput").files);
      $("assetFileInput").value = "";
    });
    $("assetFolderInput").addEventListener("change", () => {
      addFiles($("assetFolderInput").files);
      $("assetFolderInput").value = "";
    });

    const dropZone = $("assetDropZone");
    dropZone.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      $("assetFileInput").click();
    });
    ["dragenter", "dragover"].forEach((name) => dropZone.addEventListener(name, (event) => {
      event.preventDefault();
      dropZone.classList.add("drag-over");
    }));
    ["dragleave", "drop"].forEach((name) => dropZone.addEventListener(name, (event) => {
      event.preventDefault();
      dropZone.classList.remove("drag-over");
    }));
    dropZone.addEventListener("drop", async (event) => {
      const files = await collectDroppedEntries(event.dataTransfer);
      await addFiles(files);
    });
    $("assetShelf").addEventListener("dragover", (event) => event.preventDefault());

    $("collapseSidebarButton").addEventListener("click", () => {
      const sidebar = $("mainSidebar");
      const collapsed = sidebar.classList.toggle("collapsed");
      document.querySelector(".app-layout").style.gridTemplateColumns = collapsed ? "64px minmax(0,1fr)" : "";
      sidebar.querySelectorAll(".nav-item span, .sidebar-section, .sidebar-bottom").forEach((item) => item.hidden = collapsed);
    });
  }

  loadSettings();
  loadProject();
  bind();
  renderAll();
  showPanel("writingPanel");
})();
