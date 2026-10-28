
(function () {
  "use strict";

  const STORAGE_KEY = "ceeqwinn_story_studio_v3";
  const OLD_STORAGE_KEY = "ceeqwinn_story_studio_v2";
  const $ = (id) => document.getElementById(id);
  const uid = (prefix) => prefix + "-" + Date.now().toString(36) +
    "-" + Math.random().toString(36).slice(2, 7);

  const DEFAULT_THEME = {
    accent: "#d6b16c",
    background: "#241019",
    text: "#f7edf1",
    panel: "#351c2a"
  };

  let project;
  let currentChapterId = "";
  let selectedBlockId = "";
  let activePanel = "overviewPanel";
  let saveTimer = null;
  let dirty = false;

  function blankProject() {
    return {
      schemaVersion: 3,
      id: uid("story"),
      title: "Untitled Story",
      description: "",
      genre: "",
      status: "draft",
      release: { plan: "draft", date: "" },
      theme: { ...DEFAULT_THEME },
      folders: ["Unsorted"],
      assets: [],
      chapters: [{
        id: uid("chapter"),
        title: "Chapter One",
        folder: "Unsorted",
        blocks: [{
          id: uid("paragraph"),
          type: "paragraph",
          text: ""
        }]
      }]
    };
  }

  function normalizeProject(input) {
    const p = input && typeof input === "object" ? input : {};
    const normalized = {
      schemaVersion: 3,
      id: String(p.id || uid("story")),
      title: String(p.title || "Untitled Story"),
      description: String(p.description || ""),
      genre: String(p.genre || ""),
      status: ["draft", "editing", "ready", "published"].includes(p.status)
        ? p.status : "draft",
      release: {
        plan: ["draft", "preview", "public"].includes(p.release?.plan)
          ? p.release.plan : "draft",
        date: String(p.release?.date || "")
      },
      theme: { ...DEFAULT_THEME, ...(p.theme || {}) },
      folders: Array.isArray(p.folders) ? p.folders.map(String) : ["Unsorted"],
      assets: Array.isArray(p.assets) ? p.assets : [],
      chapters: Array.isArray(p.chapters) ? p.chapters.map((chapter) => ({
        id: String(chapter.id || uid("chapter")),
        title: String(chapter.title || "Untitled chapter"),
        folder: String(chapter.folder || "Unsorted"),
        blocks: Array.isArray(chapter.blocks) ? chapter.blocks.map((block) => ({
          ...block,
          id: String(block.id || uid("block")),
          type: String(block.type || "paragraph"),
          text: String(block.text || "")
        })) : []
      })) : []
    };

    if (!normalized.folders.length) normalized.folders = ["Unsorted"];
    if (!normalized.chapters.length) {
      normalized.chapters.push({
        id: uid("chapter"),
        title: "Chapter One",
        folder: normalized.folders[0],
        blocks: []
      });
    }

    normalized.chapters.forEach((chapter) => {
      if (!normalized.folders.includes(chapter.folder)) {
        normalized.folders.push(chapter.folder);
      }
    });

    return normalized;
  }

  function currentChapter() {
    return project.chapters.find((chapter) => chapter.id === currentChapterId)
      || project.chapters[0]
      || null;
  }

  function currentBlock() {
    const chapter = currentChapter();
    return chapter ? chapter.blocks.find((block) => block.id === selectedBlockId) : null;
  }

  function setStatus(message, isError) {
    const status = $("saveStatus");
    status.textContent = message;
    status.classList.toggle("error", Boolean(isError));
  }

  function markDirty() {
    dirty = true;
    setStatus("Unsaved changes");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveProject, 500);
  }

  function saveProject() {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      dirty = false;
      setStatus("Saved in this browser");
    } catch (error) {
      setStatus("Could not save — storage may be full", true);
    }
  }

  function loadProject() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeProject(JSON.parse(saved));

      const oldSaved = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldSaved) return normalizeProject(JSON.parse(oldSaved));
    } catch (error) {
      setStatus("Saved draft could not be read", true);
    }
    return blankProject();
  }

  function escapeText(value) {
    return String(value == null ? "" : value);
  }

  function wordsInProject() {
    let count = 0;
    project.chapters.forEach((chapter) => {
      chapter.blocks.forEach((block) => {
        count += (String(block.text || "").trim().match(/\S+/g) || []).length;
      });
    });
    return count;
  }

  function totalBlocks() {
    return project.chapters.reduce((sum, chapter) => sum + chapter.blocks.length, 0);
  }

  function applyTheme() {
    const theme = project.theme || DEFAULT_THEME;
    document.documentElement.style.setProperty("--gold", theme.accent || DEFAULT_THEME.accent);
    document.documentElement.style.setProperty("--gold-soft", theme.accent || DEFAULT_THEME.accent);
    document.documentElement.style.setProperty("--wine", theme.background || DEFAULT_THEME.background);
    document.documentElement.style.setProperty("--pearl", theme.text || DEFAULT_THEME.text);
    document.documentElement.style.setProperty("--wine-light", theme.panel || DEFAULT_THEME.panel);
    document.documentElement.style.setProperty("--surface", theme.panel || DEFAULT_THEME.panel);
    document.documentElement.style.setProperty("--wine-raised", theme.panel || DEFAULT_THEME.panel);
    ["themeAccent", "themeBackground", "themeText", "themePanel"].forEach((id, index) => {
      const keys = ["accent", "background", "text", "panel"];
      if ($(id)) $(id).value = theme[keys[index]] || DEFAULT_THEME[keys[index]];
    });
  }

  function switchPanel(panelId) {
    activePanel = panelId;
    document.querySelectorAll(".panel").forEach((panel) => {
      panel.hidden = panel.id !== panelId;
    });
    document.querySelectorAll(".nav-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.panel === panelId);
    });
    if (panelId === "writingPanel") renderManuscript();
    if (panelId === "assetsPanel") renderAssets();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function renderProjectFields() {
    $("storyTitle").value = project.title;
    $("storyDescription").value = project.description;
    $("storyGenre").value = project.genre;
    $("storyStatus").value = project.status;
    $("releasePlan").value = project.release.plan;
    $("releaseDate").value = project.release.date;
    $("chapterCount").textContent = project.chapters.length;
    $("wordCount").textContent = wordsInProject();
    $("blockCount").textContent = totalBlocks();
    $("previewStoryTitle").textContent = project.title || "Story preview";
    $("readerSlug").value = slugify(project.id || project.title);
    renderChapterList();
    renderChapterOverview();
    renderPreviewChapterOptions();
    renderPublishingUrl();
    applyTheme();
  }

  function slugify(value) {
    return String(value || "my-story")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || "my-story";
  }

  function renderChapterList() {
    const list = $("chapterList");
    list.replaceChildren();

    project.folders.forEach((folder) => {
      const group = document.createElement("div");
      const label = document.createElement("div");
      label.className = "eyebrow";
      label.style.padding = "10px 5px 4px";
      label.textContent = folder;
      group.appendChild(label);

      const chapters = project.chapters.filter((chapter) => chapter.folder === folder);
      chapters.forEach((chapter) => {
        const row = document.createElement("div");
        row.className = "chapter-entry";

        const open = document.createElement("button");
        open.type = "button";
        open.className = "chapter-open" + (chapter.id === currentChapterId ? " active" : "");
        open.textContent = chapter.title || "Untitled chapter";
        const small = document.createElement("small");
        small.textContent = chapter.blocks.length + " blocks";
        open.appendChild(small);
        open.addEventListener("click", () => openChapter(chapter.id));
        row.appendChild(open);

        const actions = document.createElement("div");
        actions.className = "chapter-mini-actions";

        const up = document.createElement("button");
        up.type = "button";
        up.textContent = "↑";
        up.title = "Move chapter up";
        up.addEventListener("click", () => moveChapter(chapter.id, -1));

        const down = document.createElement("button");
        down.type = "button";
        down.textContent = "↓";
        down.title = "Move chapter down";
        down.addEventListener("click", () => moveChapter(chapter.id, 1));

        actions.append(up, down);
        row.appendChild(actions);
        group.appendChild(row);
      });
      list.appendChild(group);
    });

    if (!project.chapters.some((chapter) => chapter.folder === project.folders[0])) {
      // Empty folders are retained so the author can organize chapters later.
    }
  }

  function renderChapterOverview() {
    const list = $("chapterOverviewList");
    list.replaceChildren();

    project.chapters.forEach((chapter, index) => {
      const item = document.createElement("div");
      item.className = "chapter-overview-item";

      const info = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = (index + 1) + ". " + chapter.title;
      const detail = document.createElement("p");
      detail.textContent = chapter.folder + " · " + chapter.blocks.length + " blocks";
      info.append(title, detail);

      const open = document.createElement("button");
      open.type = "button";
      open.className = "button button-soft";
      open.textContent = "Open chapter";
      open.addEventListener("click", () => {
        openChapter(chapter.id);
        switchPanel("writingPanel");
      });

      item.append(info, open);
      list.appendChild(item);
    });
  }

  function openChapter(id) {
    currentChapterId = id;
    selectedBlockId = "";
    const chapter = currentChapter();
    if (!chapter) return;
    $("currentChapterLabel").textContent = chapter.title;
    $("manuscriptChapterTitle").value = chapter.title;
    renderChapterList();
    renderManuscript();
    renderInspector();
    renderPreviewChapterOptions();
    markDirty();
  }

  function addChapter() {
    const title = prompt("Chapter title:", "New chapter");
    if (title === null) return;

    const folder = project.folders[0] || "Unsorted";
    const chapter = {
      id: uid("chapter"),
      title: title.trim() || "Untitled chapter",
      folder,
      blocks: []
    };
    project.chapters.push(chapter);
    openChapter(chapter.id);
    renderProjectFields();
    switchPanel("writingPanel");
    markDirty();
  }

  function moveChapter(id, direction) {
    const index = project.chapters.findIndex((chapter) => chapter.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= project.chapters.length) return;
    [project.chapters[index], project.chapters[next]] =
      [project.chapters[next], project.chapters[index]];
    renderProjectFields();
    markDirty();
  }

  function addFolder() {
    const name = prompt("Name this chapter folder:");
    if (name === null) return;
    const folder = name.trim();
    if (!folder) return;
    if (project.folders.some((item) => item.toLowerCase() === folder.toLowerCase())) {
      alert("A folder with that name already exists.");
      return;
    }
    project.folders.push(folder);
    const chapter = currentChapter();
    if (chapter && confirm("Move the current chapter into " + folder + "?")) {
      chapter.folder = folder;
    }
    renderProjectFields();
    markDirty();
  }

  function changeChapterFolder(chapter) {
    const options = project.folders.join("\n");
    const choice = prompt("Type an existing folder name:\n" + options, chapter.folder);
    if (choice === null) return;
    const folder = choice.trim();
    if (!project.folders.includes(folder)) {
      alert("That folder does not exist. Use the + Folder button to create it first.");
      return;
    }
    chapter.folder = folder;
    renderProjectFields();
    markDirty();
  }

  function addBlock(type, extra) {
    const chapter = currentChapter();
    if (!chapter) return;
    const defaults = {
      paragraph: { text: "" },
      narration: { title: "Narration", text: "" },
      dialogue: { title: "Dialogue", character: "", text: "" },
      reveal: { title: "A reveal", text: "", imageUrl: "" },
      image: { title: "Illustration", text: "", imageUrl: "" },
      choice: { title: "Choose what happens", text: "", options: [
        { label: "Option one", target: "" },
        { label: "Option two", target: "" }
      ] },
      game: { title: "Play a game", text: "", gameUrl: "" },
      audio: { title: "Listen", text: "", audioUrl: "" },
      chapterEnd: { title: "Continue the story", text: "", nextChapterId: "" }
    };
    const block = {
      id: uid(type),
      type: type,
      ...(defaults[type] || { text: "" }),
      ...(extra || {})
    };
    chapter.blocks.push(block);
    selectedBlockId = block.id;
    renderManuscript();
    renderInspector();
    renderProjectFields();
    markDirty();
  }

  function moveBlock(id, direction) {
    const chapter = currentChapter();
    if (!chapter) return;
    const index = chapter.blocks.findIndex((block) => block.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= chapter.blocks.length) return;
    [chapter.blocks[index], chapter.blocks[next]] =
      [chapter.blocks[next], chapter.blocks[index]];
    selectedBlockId = id;
    renderManuscript();
    renderInspector();
    markDirty();
  }

  function deleteBlock(id) {
    const chapter = currentChapter();
    if (!chapter || !confirm("Delete this block? This cannot be undone unless you have a backup.")) return;
    chapter.blocks = chapter.blocks.filter((block) => block.id !== id);
    if (selectedBlockId === id) selectedBlockId = "";
    renderManuscript();
    renderInspector();
    renderProjectFields();
    markDirty();
  }

  function renderManuscript() {
    const chapter = currentChapter();
    const root = $("manuscript");
    root.replaceChildren();

    if (!chapter) {
      root.appendChild(emptyMessage("Create or select a chapter to start writing."));
      return;
    }

    $("currentChapterLabel").textContent = chapter.title;
    $("manuscriptChapterTitle").value = chapter.title;

    if (!chapter.blocks.length) {
      root.appendChild(emptyMessage("This chapter is a fresh slate. Add a writing batch or experience."));
    }

    chapter.blocks.forEach((block, index) => {
      const card = document.createElement("article");
      card.className = "manuscript-block" + (block.id === selectedBlockId ? " selected" : "");

      const top = document.createElement("div");
      top.className = "block-top";
      const type = document.createElement("span");
      type.className = "block-type";
      type.textContent = block.type;
      const actions = document.createElement("div");
      actions.className = "block-actions";

      [
        ["↑", "Move up", () => moveBlock(block.id, -1), index === 0],
        ["↓", "Move down", () => moveBlock(block.id, 1), index === chapter.blocks.length - 1],
        ["Edit", "Edit block", () => { selectedBlockId = block.id; renderManuscript(); renderInspector(); }, false],
        ["×", "Delete block", () => deleteBlock(block.id), false]
      ].forEach(([text, title, action, disabled]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.title = title;
        button.disabled = disabled;
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          action();
        });
        actions.appendChild(button);
      });

      top.append(type, actions);
      card.appendChild(top);

      const summary = document.createElement("p");
      summary.className = "block-snippet";
      summary.textContent = block.type === "dialogue" && block.character
        ? block.character + ": " + (block.text || "Empty dialogue")
        : block.title
          ? block.title + (block.text ? "\n" + block.text : "")
          : block.text || (block.type === "image" ? "Image block — edit to add an image." : "Empty block");
      card.appendChild(summary);

      if ((block.type === "image" || block.type === "reveal") && block.imageUrl) {
        const image = document.createElement("img");
        image.className = "block-image";
        image.src = block.imageUrl;
        image.alt = block.title || "Story image";
        image.loading = "lazy";
        image.addEventListener("error", () => image.remove());
        card.appendChild(image);
      }

      card.addEventListener("click", () => {
        selectedBlockId = block.id;
        renderManuscript();
        renderInspector();
      });
      root.appendChild(card);
    });
  }

  function emptyMessage(message) {
    const p = document.createElement("p");
    p.className = "empty-state";
    p.textContent = message;
    return p;
  }

  function field(labelText, value, onChange, options) {
    const opts = options || {};
    const label = document.createElement("label");
    label.appendChild(document.createTextNode(labelText));
    let input;

    if (opts.select) {
      input = document.createElement("select");
      opts.select.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        input.appendChild(option);
      });
      input.value = value || "";
    } else if (opts.textarea) {
      input = document.createElement("textarea");
      input.rows = opts.rows || 5;
      input.value = value || "";
    } else {
      input = document.createElement("input");
      input.type = opts.type || "text";
      input.value = value || "";
      if (opts.maxlength) input.maxLength = opts.maxlength;
    }

    input.addEventListener("input", () => onChange(input.value));
    label.appendChild(input);
    return label;
  }

  function renderInspector() {
    const root = $("blockInspector");
    root.replaceChildren();
    const chapter = currentChapter();
    const block = currentBlock();

    if (!chapter) {
      root.appendChild(emptyMessage("Choose a chapter first."));
      return;
    }

    if (!block) {
      const eyebrow = document.createElement("span");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "EDIT PANEL";
      const heading = document.createElement("h2");
      heading.textContent = "Nothing selected";
      const text = document.createElement("p");
      text.textContent = "Select a block to edit it. You can also move the chapter into a folder.";
      const folder = field("Chapter folder", chapter.folder, (value) => {
        if (project.folders.includes(value)) {
          chapter.folder = value;
          renderProjectFields();
          markDirty();
        }
      }, { select: project.folders.map((value) => ({ value, label: value })) });
      const move = document.createElement("button");
      move.className = "button button-wide button-soft";
      move.textContent = "Change folder";
      move.addEventListener("click", () => changeChapterFolder(chapter));
      root.append(eyebrow, heading, text, folder, move);
      return;
    }

    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "EDIT " + block.type.toUpperCase();
    const heading = document.createElement("h2");
    heading.textContent = block.title || (block.type === "paragraph" ? "Writing batch" : "Experience settings");
    root.append(eyebrow, heading);

    const update = (key, value) => {
      block[key] = value;
      if (key === "title") {
        heading.textContent = value || "Untitled block";
        renderManuscript();
      } else if (key === "text" || key === "character") {
        renderManuscript();
      }
      renderProjectFields();
      markDirty();
    };

    if (block.type !== "paragraph") {
      root.appendChild(field("Display title", block.title, (value) => update("title", value), { maxlength: 180 }));
    }

    if (block.type === "dialogue") {
      root.appendChild(field("Speaking character", block.character, (value) => update("character", value), { maxlength: 100 }));
    }

    if (["paragraph", "narration", "dialogue", "reveal", "image", "choice", "game", "audio", "chapterEnd"].includes(block.type)) {
      root.appendChild(field(block.type === "paragraph" ? "Writing" : "Text / description",
        block.text, (value) => update("text", value), { textarea: true, rows: 7 }));
    }

    if (block.type === "image" || block.type === "reveal") {
      root.appendChild(field("Image URL or saved image data", block.imageUrl,
        (value) => update("imageUrl", value), { type: "url" }));

      const shelf = document.createElement("label");
      shelf.appendChild(document.createTextNode("Choose from asset shelf"));
      const select = document.createElement("select");
      const none = document.createElement("option");
      none.value = "";
      none.textContent = "Choose an asset…";
      select.appendChild(none);
      project.assets.forEach((asset) => {
        const option = document.createElement("option");
        option.value = asset.url;
        option.textContent = asset.name;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        if (select.value) update("imageUrl", select.value);
      });
      shelf.appendChild(select);
      root.appendChild(shelf);
    }

    if (block.type === "audio") {
      root.appendChild(field("Direct audio file URL", block.audioUrl,
        (value) => update("audioUrl", value), { type: "url" }));
    }

    if (block.type === "game") {
      root.appendChild(field("Game URL", block.gameUrl,
        (value) => update("gameUrl", value), { type: "url" }));
    }

    if (block.type === "choice") {
      const note = document.createElement("p");
      note.className = "help-text";
      note.textContent = "Enter one choice per line as: Choice label | target chapter ID. A matching chapter ID opens that chapter in the public Reader. A blank target records the reader's selection.";
      root.appendChild(note);
      const choiceText = (block.options || []).map((option) =>
        (option.label || "") + " | " + (option.target || "")
      ).join("\n");
      root.appendChild(field("Choices", choiceText, (value) => {
        block.options = value.split("\n").map((line) => {
          const parts = line.split("|");
          return { label: (parts[0] || "").trim(), target: (parts[1] || "").trim() };
        }).filter((option) => option.label);
        markDirty();
      }, { textarea: true, rows: 6 }));
    }

    if (block.type === "chapterEnd") {
      root.appendChild(field("Next chapter", block.nextChapterId || "",
        (value) => update("nextChapterId", value), {
          select: [
            { value: "", label: "Choose a chapter…" },
            ...project.chapters.filter((item) => item.id !== chapter.id)
              .map((item) => ({ value: item.id, label: item.title }))
          ]
        }));
    }

    const actions = document.createElement("div");
    actions.className = "inspector-actions";

    const duplicate = document.createElement("button");
    duplicate.className = "button button-soft";
    duplicate.textContent = "Duplicate";
    duplicate.addEventListener("click", () => {
      const copy = JSON.parse(JSON.stringify(block));
      copy.id = uid(block.type);
      const index = chapter.blocks.findIndex((item) => item.id === block.id);
      chapter.blocks.splice(index + 1, 0, copy);
      selectedBlockId = copy.id;
      renderManuscript();
      renderInspector();
      markDirty();
    });

    const remove = document.createElement("button");
    remove.className = "button button-soft";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteBlock(block.id));

    actions.append(duplicate, remove);
    root.appendChild(actions);
  }

  function renderAssets() {
    const grid = $("assetGrid");
    grid.replaceChildren();
    $("assetCount").textContent = project.assets.length + " ASSETS";

    if (!project.assets.length) {
      grid.appendChild(emptyMessage("Your asset shelf is empty. Add an image URL or choose an image from your device."));
      return;
    }

    project.assets.forEach((asset) => {
      const card = document.createElement("article");
      card.className = "asset-card";
      const image = document.createElement("img");
      image.src = asset.url;
      image.alt = asset.name || "Story asset";
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.alt = "Image could not be loaded";
      });

      const content = document.createElement("div");
      content.className = "asset-card-content";
      const name = document.createElement("strong");
      name.textContent = asset.name || "Untitled asset";
      const info = document.createElement("p");
      info.textContent = asset.url.startsWith("data:") ? "Stored in this browser project" : asset.url;
      const insert = document.createElement("button");
      insert.className = "button button-soft";
      insert.textContent = "Insert into current chapter";
      insert.addEventListener("click", () => addBlock("image", {
        title: asset.name || "Illustration",
        imageUrl: asset.url
      }));
      const remove = document.createElement("button");
      remove.className = "button button-soft";
      remove.textContent = "Remove asset";
      remove.addEventListener("click", () => {
        if (!confirm("Remove this asset from the shelf? Blocks already using its image are not changed.")) return;
        project.assets = project.assets.filter((item) => item.id !== asset.id);
        renderAssets();
        markDirty();
      });

      content.append(name, info, insert, remove);
      card.append(image, content);
      grid.appendChild(card);
    });
  }

  function addAsset(name, url) {
    const safe = String(url || "").trim();
    if (!safe || !/^(https?:\/\/|data:image\/)/i.test(safe)) {
      alert("Enter an http/https image URL or choose an image file.");
      return;
    }
    project.assets.push({ id: uid("asset"), name: name.trim() || "Story image", url: safe });
    $("assetName").value = "";
    $("assetUrl").value = "";
    renderAssets();
    markDirty();
  }

  function renderPreviewChapterOptions() {
    const select = $("previewChapterSelect");
    if (!select) return;
    const oldValue = select.value;
    select.replaceChildren();
    project.chapters.forEach((chapter) => {
      const option = document.createElement("option");
      option.value = chapter.id;
      option.textContent = chapter.title || "Untitled chapter";
      select.appendChild(option);
    });
    select.value = project.chapters.some((chapter) => chapter.id === oldValue)
      ? oldValue : currentChapterId;
  }

  function openPreview(chapterId) {
    const chapter = project.chapters.find((item) => item.id === chapterId) || currentChapter();
    if (!chapter) return;
    $("previewStoryTitle").textContent = project.title || "Story preview";
    renderPreviewChapterOptions();
    $("previewChapterSelect").value = chapter.id;
    const preview = $("theatrePreview");
    window.CeeqwinnTheatre.render(preview, project, chapter, { mode: "studio" });
    if (!$("previewDialog").open) $("previewDialog").showModal();
  }

  function renderPublishingUrl() {
    const slug = slugify($("readerSlug")?.value || project.id || project.title);
    $("suggestedFilename").textContent = slug + ".json";
    $("readerUrlPreview").textContent =
      window.location.origin + "/read.html?story=" + encodeURIComponent(slug);
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
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportProject() {
    const slug = slugify($("readerSlug").value || project.title);
    project.exportedAt = new Date().toISOString();
    downloadJson(slug + ".json", project);
    setStatus("Exported JSON backup");
  }

  function importProjectFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = normalizeProject(JSON.parse(String(reader.result)));
        if (!confirm("Replace the current browser project with this imported project? Export a backup first if you need the current version.")) return;
        project = imported;
        currentChapterId = project.chapters[0]?.id || "";
        selectedBlockId = "";
        renderProjectFields();
        openChapter(currentChapterId);
        switchPanel("overviewPanel");
        saveProject();
      } catch (error) {
        alert("This file could not be opened as a valid Studio project JSON.");
      }
      $("importFile").value = "";
    };
    reader.readAsText(file);
  }

  function bindEvents() {
    document.querySelectorAll(".nav-button").forEach((button) => {
      button.addEventListener("click", () => switchPanel(button.dataset.panel));
    });

    $("storyTitle").addEventListener("input", () => {
      project.title = $("storyTitle").value;
      $("previewStoryTitle").textContent = project.title || "Story preview";
      renderProjectFields();
      markDirty();
    });
    $("storyDescription").addEventListener("input", () => {
      project.description = $("storyDescription").value;
      markDirty();
    });
    $("storyGenre").addEventListener("input", () => {
      project.genre = $("storyGenre").value;
      markDirty();
    });
    $("storyStatus").addEventListener("change", () => {
      project.status = $("storyStatus").value;
      markDirty();
    });
    $("manuscriptChapterTitle").addEventListener("input", () => {
      const chapter = currentChapter();
      if (!chapter) return;
      chapter.title = $("manuscriptChapterTitle").value;
      $("currentChapterLabel").textContent = chapter.title || "Untitled chapter";
      renderChapterList();
      renderChapterOverview();
      renderPreviewChapterOptions();
      markDirty();
    });

    $("addChapterButton").addEventListener("click", addChapter);
    $("overviewAddChapter").addEventListener("click", addChapter);
    $("newStoryButton").addEventListener("click", () => {
      if (!confirm("Start a new story? Export your current story first if you want to keep it.")) return;
      project = blankProject();
      currentChapterId = project.chapters[0].id;
      selectedBlockId = "";
      renderProjectFields();
      openChapter(currentChapterId);
      switchPanel("overviewPanel");
      saveProject();
    });

    $("startWritingButton").addEventListener("click", () => {
      if (!currentChapterId) currentChapterId = project.chapters[0]?.id || "";
      openChapter(currentChapterId);
      switchPanel("writingPanel");
    });
    $("backToOverview").addEventListener("click", () => switchPanel("overviewPanel"));
    $("overviewAssets").addEventListener("click", () => switchPanel("assetsPanel"));
    $("overviewPreview").addEventListener("click", () => openPreview(currentChapterId));
    $("addParagraphButton").addEventListener("click", () => addBlock("paragraph"));
    $("bottomAddParagraph").addEventListener("click", () => addBlock("paragraph"));
    $("addImageButton").addEventListener("click", () => addBlock("image"));
    $("addFolderButton").addEventListener("click", addFolder);

    $("insertExperienceButton").addEventListener("click", () => $("experienceDialog").showModal());
    document.querySelectorAll(".experience-option").forEach((button) => {
      button.addEventListener("click", () => {
        $("experienceDialog").close();
        addBlock(button.dataset.type);
      });
    });

    $("saveButton").addEventListener("click", saveProject);
    $("exportButton").addEventListener("click", exportProject);
    $("importButton").addEventListener("click", () => $("importFile").click());
    $("importFile").addEventListener("change", () => importProjectFile($("importFile").files[0]));
    $("previewButton").addEventListener("click", () => openPreview(currentChapterId));
    $("previewChapterButton")?.addEventListener("click", () => openPreview(currentChapterId));
    $("closePreviewButton").addEventListener("click", () => $("previewDialog").close());
    $("previewChapterSelect").addEventListener("change", () => openPreview($("previewChapterSelect").value));
    $("previewSize").addEventListener("change", () => {
      const preview = $("theatrePreview");
      preview.classList.remove("phone-preview", "tablet-preview", "desktop-preview");
      preview.classList.add($("previewSize").value + "-preview");
    });

    $("addAssetButton").addEventListener("click", () => addAsset($("assetName").value, $("assetUrl").value));
    $("uploadAssetButton").addEventListener("click", () => $("assetFile").click());
    $("assetFile").addEventListener("change", () => {
      const file = $("assetFile").files[0];
      $("assetFile").value = "";
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("Please choose an image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("That image is over 2 MB. Please resize it first so the project can save reliably in this browser.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => addAsset(file.name, String(reader.result));
      reader.readAsDataURL(file);
    });

    $("releasePlan").addEventListener("change", () => {
      project.release.plan = $("releasePlan").value;
      markDirty();
    });
    $("releaseDate").addEventListener("change", () => {
      project.release.date = $("releaseDate").value;
      markDirty();
    });
    $("saveReleaseButton").addEventListener("click", () => {
      project.release.plan = $("releasePlan").value;
      project.release.date = $("releaseDate").value;
      saveProject();
    });
    $("readerSlug").addEventListener("input", renderPublishingUrl);
    $("copyReaderUrlButton").addEventListener("click", async () => {
      const url = $("readerUrlPreview").textContent;
      try {
        await navigator.clipboard.writeText(url);
        setStatus("Reader URL copied");
      } catch (error) {
        alert("Copy this URL manually:\n" + url);
      }
    });

    const themeBindings = [
      ["themeAccent", "accent"],
      ["themeBackground", "background"],
      ["themeText", "text"],
      ["themePanel", "panel"]
    ];
    themeBindings.forEach(([id, key]) => {
      $(id).addEventListener("input", () => {
        project.theme[key] = $(id).value;
        applyTheme();
        markDirty();
      });
    });
    $("resetThemeButton").addEventListener("click", () => {
      project.theme = { ...DEFAULT_THEME };
      applyTheme();
      markDirty();
    });

    window.addEventListener("beforeunload", (event) => {
      if (dirty) {
        saveProject();
        event.preventDefault();
        event.returnValue = "";
      }
    });
  }

  function start() {
    project = loadProject();
    currentChapterId = project.chapters[0]?.id || "";
    bindEvents();
    renderProjectFields();
    openChapter(currentChapterId);
    renderAssets();
    switchPanel("overviewPanel");
    setStatus("Ready");
  }

  start();
})();
