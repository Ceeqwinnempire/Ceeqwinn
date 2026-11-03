
(function () {
  "use strict";

  /* =========================================================
     CEEQWINN STORY & THEATRE STUDIO
     Complete Studio controller
     Vanilla JavaScript
     ========================================================= */

  const STORAGE_KEY = "ceeqwinn_story_studio_v3";
  const SETTINGS_KEY = "ceeqwinn_story_studio_settings_v1";
  const MOODS_KEY = "ceeqwinn_story_studio_moods_v1";

  const HISTORY_LIMIT = 40;

  // Conservative browser-storage limit.
  // Large media files should be hosted externally and linked.
  const MAX_PROJECT_STORAGE_CHARS = 3400000;
  const MAX_SINGLE_FILE_BYTES = 18 * 1024 * 1024;
  const MAX_PROJECT_CHAPTERS = 2000;
  const MAX_BLOCKS_PER_CHAPTER = 5000;
  const MAX_PROJECT_ASSETS = 500;

  const $ = (id) => document.getElementById(id);

  const state = {
    project: null,
    chapterId: "",
    selectedBlockId: "",
    activePanel: "overviewPanel",
    settings: null,
    saveTimer: null,

    history: [],
    historyIndex: -1,
    restoringHistory: false,
    historyCapturePending: false,
    historyGroup: "",

    inspectorExpanded: false,
    inspectorClosed: false,
    sidebarCollapsed: false,

    moods: [],
    editingMoodId: ""
  };

  const defaultSettings = {
    showHints: true,
    darkMode: true,
    fontFamily: "Georgia, serif",
    fontSize: 18,
    accent: "#d6ad68",
    background: "#260d1b",
    panel: "#381b2c",
    text: "#fbf2f6",
    transition: "fade",
    reduceMotion: false
  };

  const palette = [
    "#7c1537", "#a51e45", "#c62852", "#e34370", "#ef82a7",
    "#d00069", "#a92b81", "#6e255f", "#d6ad68", "#f1d9a4",
    "#f8f0f4", "#b9b4bb", "#747078", "#181318", "#263c68"
  ];

  const MOOD_COLOURS = ["accent", "background", "panel", "text"];

  const BLOCK_TYPES = [
    "paragraph",
    "narration",
    "dialogue",
    "reveal",
    "image",
    "video",
    "audio",
    "choice",
    "game",
    "chapterEnd",
    "reference"
  ];

  const makeId = (prefix) =>
    prefix + "-" + Date.now().toString(36) + "-" +
    Math.random().toString(36).slice(2, 7);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function notify(message) {
    const region = $("toastRegion");
    if (!region) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    region.appendChild(toast);

    window.setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3600);
  }

  function setSaveStatus(message) {
    const element = $("saveStatus");
    if (element) element.textContent = message;
  }

  function safeSet(id, value) {
    const element = $(id);
    if (element) element.textContent = String(value);
  }

  function bindClick(id, callback) {
    const element = $(id);
    if (element) element.addEventListener("click", callback);
  }

  function slugify(value) {
    return String(value || "my-story")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "my-story";
  }

  function isHexColour(value) {
    return typeof value === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function readLocalStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
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
      release: {
        plan: "draft",
        date: ""
      },
      theme: {
        accent: "#d6ad68",
        background: "#260d1b",
        text: "#fbf2f6",
        panel: "#381b2c"
      },
      folders: ["Opening"],
      assetFolders: ["Unsorted"],
      assets: [],
      chapters: [{
        id: makeId("chapter"),
        title: "The Grand Entrance",
        folder: "Opening",
        blocks: [{
          id: makeId("paragraph"),
          type: "paragraph",
          text: "The grand doors opened, revealing a hall illuminated by crystal chandeliers. Conversations softened as the guests turned toward the entrance."
        }]
      }]
    };
  }

  /* =========================================================
     PROJECT NORMALIZATION AND VALIDATION
     ========================================================= */

  function normalizeProject(project) {
    if (!project || typeof project !== "object" || Array.isArray(project)) {
      throw new Error("Invalid project object.");
    }

    project.schemaVersion = 3;

    project.id = String(project.id || makeId("story"));
    project.title = String(project.title || "Untitled story");
    project.description = String(project.description || "");
    project.genre = String(project.genre || "");
    project.status = String(project.status || "draft");
    project.slug = slugify(project.slug || project.title);

    project.assets = Array.isArray(project.assets) ? project.assets : [];
    project.chapters = Array.isArray(project.chapters) ? project.chapters : [];
    project.folders = Array.isArray(project.folders) ? project.folders : ["Opening"];

    project.assetFolders = Array.isArray(project.assetFolders)
      ? project.assetFolders
      : ["Unsorted"];

    project.release = project.release && typeof project.release === "object"
      ? project.release
      : { plan: "draft", date: "" };

    project.theme = Object.assign({
      accent: "#d6ad68",
      background: "#260d1b",
      text: "#fbf2f6",
      panel: "#381b2c"
    }, project.theme || {});

    project.folders = [...new Set(
      project.folders
        .map((folder) => String(folder || "").trim())
        .filter(Boolean)
    )];

    if (!project.folders.length) project.folders = ["Unsorted"];

    project.assetFolders = [...new Set(
      project.assetFolders
        .map((folder) => String(folder || "").trim())
        .filter(Boolean)
    )];

    if (!project.assetFolders.includes("Unsorted")) {
      project.assetFolders.unshift("Unsorted");
    }

    project.chapters.forEach((chapter) => {
      chapter.id = String(chapter.id || makeId("chapter"));
      chapter.title = String(chapter.title || "Untitled chapter");
      chapter.folder = String(chapter.folder || "Unsorted");
      chapter.blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];

      if (!project.folders.includes(chapter.folder)) {
        project.folders.push(chapter.folder);
      }

      chapter.blocks.forEach((block) => {
        block.id = String(block.id || makeId(block.type || "block"));
        block.type = String(block.type || "paragraph");

        if (typeof block.text !== "string") {
          block.text = block.text == null ? "" : String(block.text);
        }

        if (block.type === "choice") {
          block.options = Array.isArray(block.options) ? block.options : [];
          block.options = block.options.map((option) => ({
            label: String(option && option.label || ""),
            target: String(option && option.target || "")
          }));
        }
      });
    });

    project.assets.forEach((asset) => {
      asset.id = String(asset.id || makeId("asset"));
      asset.name = String(asset.name || "Untitled file");
      asset.kind = String(asset.kind || "file");
      asset.folder = String(asset.folder || "Unsorted");
      asset.dataUrl = typeof asset.dataUrl === "string" ? asset.dataUrl : "";

      if (!project.assetFolders.includes(asset.folder)) {
        project.assetFolders.push(asset.folder);
      }
    });

    if (!project.chapters.length) {
      project.chapters.push({
        id: makeId("chapter"),
        title: "Chapter One",
        folder: project.folders[0] || "Unsorted",
        blocks: []
      });
    }

    return project;
  }

  function validateIncomingProject(project) {
    if (!project || typeof project !== "object" || Array.isArray(project)) {
      throw new Error("The file does not contain a project object.");
    }

    if (!Array.isArray(project.chapters)) {
      throw new Error("The project has no valid chapter list.");
    }

    if (!project.chapters.length) {
      throw new Error("The project must contain at least one chapter.");
    }

    if (project.chapters.length > MAX_PROJECT_CHAPTERS) {
      throw new Error("The project contains too many chapters.");
    }

    if (project.assets !== undefined && !Array.isArray(project.assets)) {
      throw new Error("The asset list is invalid.");
    }

    if ((project.assets || []).length > MAX_PROJECT_ASSETS) {
      throw new Error("The project contains too many assets.");
    }

    project.chapters.forEach((chapter, chapterIndex) => {
      if (!chapter || typeof chapter !== "object" || Array.isArray(chapter)) {
        throw new Error("Chapter " + (chapterIndex + 1) + " is invalid.");
      }

      if (chapter.blocks !== undefined && !Array.isArray(chapter.blocks)) {
        throw new Error("A chapter contains an invalid block list.");
      }

      const blocks = chapter.blocks || [];

      if (blocks.length > MAX_BLOCKS_PER_CHAPTER) {
        throw new Error("A chapter contains too many blocks.");
      }

      blocks.forEach((block) => {
        if (!block || typeof block !== "object" || Array.isArray(block)) {
          throw new Error("A story block is invalid.");
        }

        if (block.options !== undefined && !Array.isArray(block.options)) {
          throw new Error("A choice block contains invalid options.");
        }
      });
    });

    (project.assets || []).forEach((asset) => {
      if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
        throw new Error("An asset entry is invalid.");
      }

      if (asset.dataUrl !== undefined && typeof asset.dataUrl !== "string") {
        throw new Error("An asset contains invalid file data.");
      }
    });

    const normalized = normalizeProject(clone(project));
    const serialized = JSON.stringify(normalized);

    if (serialized.length > MAX_PROJECT_STORAGE_CHARS) {
      throw new Error(
        "This project is too large for reliable browser storage. Remove large embedded files or use external media links."
      );
    }

    return normalized;
  }

  function currentChapter() {
    if (!state.project) return null;

    return state.project.chapters.find(
      (chapter) => chapter.id === state.chapterId
    ) || state.project.chapters[0] || null;
  }

  function currentBlock() {
    const chapter = currentChapter();
    if (!chapter) return null;

    return chapter.blocks.find(
      (block) => block.id === state.selectedBlockId
    ) || null;
  }

  /* =========================================================
     UNDO / REDO
     ========================================================= */

  function snapshot() {
    return {
      project: clone(state.project),
      chapterId: state.chapterId,
      selectedBlockId: state.selectedBlockId
    };
  }

  function updateHistoryButtons() {
    const canUndo = state.historyIndex > 0;
    const canRedo = state.historyIndex < state.history.length - 1;

    ["undoButton", "writingUndoButton"].forEach((id) => {
      const button = $(id);
      if (button) button.disabled = !canUndo;
    });

    ["redoButton", "writingRedoButton"].forEach((id) => {
      const button = $(id);
      if (button) button.disabled = !canRedo;
    });
  }

function captureHistory(group)

  function recordHistory(group) {
    if (state.restoringHistory || !state.project) return;

    state.historyGroup = group || "";

    if (state.historyCapturePending) return;

    state.historyCapturePending = true;

    // Capture after the current synchronous action finishes.
    // This supports the existing functions that call recordHistory
    // immediately before making their change.
    Promise.resolve().then(() => {
      state.historyCapturePending = false;
      captureHistory(group || "");
    });
  }

  function flushPendingHistory() {
    if (!state.historyCapturePending) return;

    state.historyCapturePending = false;
    captureHistory(state.historyGroup);
  }

  function finishHistoryGroup() {
    flushPendingHistory();
    state.historyGroup = "";
  }

  function restoreSnapshot(item) {
    if (!item || !item.project) return;

    state.restoringHistory = true;

    try {
      state.project = normalizeProject(clone(item.project));
      state.chapterId = item.chapterId;
      state.selectedBlockId = item.selectedBlockId;

      if (!state.project.chapters.some(
        (chapter) => chapter.id === state.chapterId
      )) {
        state.chapterId = state.project.chapters[0].id;
      }

      const chapter = currentChapter();

      if (
        !chapter ||
        !chapter.blocks.some((block) => block.id === state.selectedBlockId)
      ) {
        state.selectedBlockId = "";
      }
    } finally {
      state.restoringHistory = false;
    }

    state.historyGroup = "";

    scheduleSave();
    renderAll();
    updateHistoryButtons();
  }

  function undo() {
    flushPendingHistory();

    if (state.historyIndex <= 0) return;

    state.historyIndex--;
    restoreSnapshot(state.history[state.historyIndex]);
    notify("Last change undone.");
  }

  function redo() {
    flushPendingHistory();

    if (state.historyIndex >= state.history.length - 1) return;

    state.historyIndex++;
    restoreSnapshot(state.history[state.historyIndex]);
    notify("Change restored.");
  }

  /* =========================================================
     SAVING AND STARTUP
     ========================================================= */

  function saveNow() {
    if (!state.project) return false;

    try {
      const serialized = JSON.stringify(state.project);

      if (serialized.length > MAX_PROJECT_STORAGE_CHARS) {
        setSaveStatus("Draft too large for browser storage");
        notify(
          "The draft is larger than the safe browser-storage limit. Export a backup and move large media files to external hosting."
        );
        return false;
      }

      localStorage.setItem(STORAGE_KEY, serialized);
      setSaveStatus("Saved in this browser");
      return true;
    } catch (error) {
      setSaveStatus("Browser storage full");
      notify(
        "The draft could not be saved. Export a project backup before making more changes, then reduce large embedded files."
      );
      return false;
    }
  }

  function scheduleSave() {
    setSaveStatus("Saving…");

    if (state.saveTimer) {
      window.clearTimeout(state.saveTimer);
    }

    state.saveTimer = window.setTimeout(() => {
      state.saveTimer = null;
      saveNow();
    }, 350);
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(readLocalStorage(SETTINGS_KEY, "{}"));
      state.settings = Object.assign({}, defaultSettings, saved);
    } catch (error) {
      state.settings = Object.assign({}, defaultSettings);
    }

    MOOD_COLOURS.forEach((key) => {
      if (!isHexColour(state.settings[key])) {
        state.settings[key] = defaultSettings[key];
      }
    });

    const size = Number(state.settings.fontSize);

    state.settings.fontSize = Number.isFinite(size)
      ? Math.max(12, Math.min(32, size))
      : defaultSettings.fontSize;

    if (typeof state.settings.showHints !== "boolean") {
      state.settings.showHints = defaultSettings.showHints;
    }

    if (typeof state.settings.darkMode !== "boolean") {
      state.settings.darkMode = defaultSettings.darkMode;
    }

    if (typeof state.settings.reduceMotion !== "boolean") {
      state.settings.reduceMotion = defaultSettings.reduceMotion;
    }
  }

  function loadProject() {
    try {
      const saved = JSON.parse(readLocalStorage(STORAGE_KEY, "null"));

      state.project = saved && Array.isArray(saved.chapters)
        ? normalizeProject(saved)
        : starterProject();
    } catch (error) {
      state.project = starterProject();

      notify(
        "The saved draft could not be read. A fresh project was opened. If you have a backup, import it before continuing."
      );
    }

    state.chapterId = state.project.chapters[0].id;
    state.selectedBlockId = "";

    applySettingsToPage();

    state.history = [];
    state.historyIndex = -1;
    state.historyGroup = "";
    state.historyCapturePending = false;

    captureHistory("");
  }

  /* =========================================================
     PANEL NAVIGATION AND GENERAL RENDERING
     ========================================================= */

  function showPanel(panelId) {
    const target = $(panelId);
    if (!target) return;

    state.activePanel = panelId;

    document.querySelectorAll(".workspace-panel").forEach((panel) => {
      panel.hidden = panel.id !== panelId;
    });

    document.querySelectorAll(".nav-item").forEach((button) => {
      button.classList.toggle("active", button.dataset.panel === panelId);
    });

    if (panelId === "writingPanel") renderChapterList();
  }

  function renderAll() {
    if (!state.project) return;

    renderChapterList();
    renderChapterFolderControls();
    renderManuscript();
    renderInspector();
    renderOverview();
    renderAssetShelf();
    renderWritingAssetShelf();
    renderAssetFolderControls();

    updatePublishUrl();
    updateCounts();

    const chapter = currentChapter();

    safeSet(
      "currentChapterLabel",
      chapter ? chapter.title || "Untitled chapter" : "No chapter"
    );

    if ($("manuscriptChapterTitle")) {
      $("manuscriptChapterTitle").value = chapter ? chapter.title || "" : "";
    }

    safeSet("previewStoryTitle", state.project.title || "Untitled story");

    updateHistoryButtons();
    updateInspectorState();
  }

  /* =========================================================
     CHAPTER FOLDERS
     ========================================================= */

  function uniqueFolderName(name, existing) {
    const base = String(name || "").trim().slice(0, 60);
    if (!base) return "";

    let candidate = base;
    let number = 2;

    while (existing.includes(candidate)) {
      candidate = base + " " + number;
      number++;
    }

    return candidate;
  }

  function renderChapterFolderControls() {
    const select = $("chapterFolderSelect");
    const chapter = currentChapter();

    if (!select) return;

    select.replaceChildren();

    state.project.folders.forEach((folder) => {
      const option = document.createElement("option");
      option.value = folder;
      option.textContent = folder;
      select.appendChild(option);
    });

    if (chapter) {
      if (!state.project.folders.includes(chapter.folder)) {
        state.project.folders.push(chapter.folder);
      }

      select.value = chapter.folder;
    }

    select.disabled = !chapter;
  }

  function assignChapterFolder(folder) {
    const chapter = currentChapter();
    if (!chapter || !folder) return;

    if (!state.project.folders.includes(folder)) return;
    if (chapter.folder === folder) return;

    recordHistory();

    chapter.folder = folder;

    scheduleSave();
    renderChapterList();
    renderOverview();
    renderChapterFolderControls();

    notify('Chapter moved to "' + folder + '".');
  }

  function openChapterFolderDialog() {
    renderChapterFolderList();

    const dialog = $("chapterFolderDialog");
    if (dialog) dialog.showModal();
  }

  function renderChapterFolderList() {
    const list = $("chapterFolderList");
    if (!list) return;

    list.replaceChildren();

    state.project.folders.forEach((folder) => {
      const row = document.createElement("div");
      row.className = "folder-management-row";

      const name = document.createElement("span");
      name.textContent = folder;
      row.appendChild(name);

      const count = state.project.chapters.filter(
        (chapter) => chapter.folder === folder
      ).length;

      const detail = document.createElement("small");
      detail.textContent = count + " chapter" + (count === 1 ? "" : "s");
      row.appendChild(detail);

      const rename = document.createElement("button");
      rename.type = "button";
      rename.textContent = "Rename";
      rename.addEventListener("click", () => renameChapterFolder(folder));
      row.appendChild(rename);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Delete";
      remove.disabled = state.project.folders.length <= 1;
      remove.addEventListener("click", () => deleteChapterFolder(folder));
      row.appendChild(remove);

      list.appendChild(row);
    });
  }

  function addChapterFolder() {
    const input = $("newChapterFolderName");
    const rawName = input ? input.value.trim() : "";

    if (!rawName) {
      notify("Enter a name for the new chapter folder.");
      if (input) input.focus();
      return;
    }

    if (state.project.folders.some(
      (folder) => folder.toLowerCase() === rawName.toLowerCase()
    )) {
      notify("A chapter folder with that name already exists.");
      return;
    }

    recordHistory();

    const name = uniqueFolderName(rawName, state.project.folders);
    state.project.folders.push(name);

    if (input) input.value = "";

    scheduleSave();
    renderChapterFolderControls();
    renderChapterFolderList();

    notify('Chapter folder "' + name + '" created.');
  }

  function renameChapterFolder(oldName) {
    const next = window.prompt("New folder name:", oldName);
    if (next === null) return;

    const name = next.trim().slice(0, 60);

    if (!name) {
      notify("A folder name cannot be empty.");
      return;
    }

    if (state.project.folders.some(
      (folder) => folder !== oldName &&
        folder.toLowerCase() === name.toLowerCase()
    )) {
      notify("A folder with that name already exists.");
      return;
    }

    recordHistory();

    state.project.folders = state.project.folders.map(
      (folder) => folder === oldName ? name : folder
    );

    state.project.chapters.forEach((chapter) => {
      if (chapter.folder === oldName) chapter.folder = name;
    });

    scheduleSave();
    renderAll();
    renderChapterFolderList();

    notify("Chapter folder renamed.");
  }

  function deleteChapterFolder(folder) {
    if (state.project.folders.length <= 1) {
      notify("Keep at least one chapter folder.");
      return;
    }

    if (!window.confirm(
      'Delete the "' + folder + '" folder? Its chapters will be moved to another folder.'
    )) return;

    recordHistory();

    const fallback = state.project.folders.find(
      (item) => item !== folder
    ) || "Unsorted";

    state.project.chapters.forEach((chapter) => {
      if (chapter.folder === folder) chapter.folder = fallback;
    });

    state.project.folders = state.project.folders.filter(
      (item) => item !== folder
    );

    scheduleSave();
    renderAll();
    renderChapterFolderList();

    notify("Folder deleted. Its chapters were kept.");
  }

  /* =========================================================
     CHAPTERS
     ========================================================= */

  function renderChapterList() {
    const list = $("chapterList");
    if (!list) return;

    list.replaceChildren();

    state.project.chapters.forEach((chapter) => {
      const row = document.createElement("div");
      row.className = "chapter-nav-item";

      const open = document.createElement("button");
      open.type = "button";
      open.className =
        "chapter-open" +
        (chapter.id === state.chapterId ? " active" : "");

      open.textContent = chapter.title || "Untitled chapter";
      open.title = (chapter.folder || "Unsorted") + " · " +
        (chapter.title || "Untitled chapter");

      open.addEventListener("click", () => {
        finishHistoryGroup();

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
        const index = state.project.chapters.findIndex(
          (item) => item.id === chapter.id
        );

        if (index <= 0) return;

        recordHistory();

        [
          state.project.chapters[index - 1],
          state.project.chapters[index]
        ] = [
          state.project.chapters[index],
          state.project.chapters[index - 1]
        ];

        scheduleSave();
        renderAll();
      });

      row.appendChild(move);
      list.appendChild(row);
    });
  }

  function addChapter() {
    const title = window.prompt("Chapter title:", "New chapter");
    if (title === null) return;

    finishHistoryGroup();
    recordHistory();

    const chapter = {
      id: makeId("chapter"),
      title: title.trim() || "Untitled chapter",
      folder: currentChapter()?.folder || state.project.folders[0] || "Unsorted",
      blocks: []
    };

    state.project.chapters.push(chapter);
    state.chapterId = chapter.id;
    state.selectedBlockId = "";

    scheduleSave();
    showPanel("writingPanel");
    renderAll();
  }

  function renameChapter() {
    const chapter = currentChapter();
    if (!chapter) return;

    const title = window.prompt("Chapter title:", chapter.title || "");
    if (title === null) return;

    finishHistoryGroup();
    recordHistory();

    chapter.title = title.trim() || "Untitled chapter";

    scheduleSave();
    renderAll();
  }

  function deleteChapter() {
    if (state.project.chapters.length <= 1) {
      notify("A story needs at least one chapter.");
      return;
    }

    if (!window.confirm(
      "Delete this chapter and its blocks? You can use Undo to restore it."
    )) return;

    finishHistoryGroup();
    recordHistory();

    const index = state.project.chapters.findIndex(
      (chapter) => chapter.id === state.chapterId
    );

    if (index < 0) return;

    state.project.chapters.splice(index, 1);

    state.chapterId =
      state.project.chapters[Math.max(0, index - 1)].id;

    state.selectedBlockId = "";

    scheduleSave();
    renderAll();
  }

  /* =========================================================
     WRITING BLOCKS
     ========================================================= */

  function createBlock(type) {
    if (!BLOCK_TYPES.includes(type)) {
      type = "paragraph";
    }

    const block = {
      id: makeId(type),
      type: type
    };

    const defaults = {
      paragraph: {
        text: ""
      },

      narration: {
        title: "Narration",
        text: ""
      },

      dialogue: {
        title: "Dialogue",
        character: "",
        text: ""
      },

      reveal: {
        title: "Visual reveal",
        text: "",
        imageUrl: ""
      },

      image: {
        title: "Illustration",
        text: "",
        imageUrl: ""
      },

      video: {
        title: "Short video",
        text: "",
        videoUrl: ""
      },

      audio: {
        title: "Audio",
        text: "",
        audioUrl: ""
      },

      choice: {
        title: "Reader choice",
        text: "",
        options: [
          { label: "Option one", target: "" },
          { label: "Option two", target: "" }
        ]
      },

      game: {
        title: "Game",
        text: "",
        gameUrl: ""
      },

      chapterEnd: {
        title: "Continue the story",
        text: "",
        nextChapterId: ""
      },

      reference: {
        title: "Reference file",
        assetId: ""
      }
    };

    return Object.assign(
      block,
      defaults[type] || { title: "Story experience", text: "" }
    );
  }

  function addBlock(type) {
    const chapter = currentChapter();
    if (!chapter) return;

    finishHistoryGroup();
    recordHistory();

    const block = createBlock(type);

    const selectedIndex = chapter.blocks.findIndex(
      (item) => item.id === state.selectedBlockId
    );

    const insertAt = selectedIndex >= 0
      ? selectedIndex + 1
      : chapter.blocks.length;

    chapter.blocks.splice(insertAt, 0, block);
    state.selectedBlockId = block.id;

    openInspector();
    showPanel("writingPanel");
    scheduleSave();
    renderAll();

    window.setTimeout(() => {
      const target = document.querySelector(
        '[data-block-id="' + block.id + '"]'
      );

      if (!target) return;

      target.scrollIntoView({
        behavior: state.settings.reduceMotion ? "auto" : "smooth",
        block: "center"
      });

      const textArea = target.querySelector(".block-text");
      if (textArea) textArea.focus();
    }, 40);
  }

  function moveBlock(blockId, direction) {
    const chapter = currentChapter();
    if (!chapter) return;

    const index = chapter.blocks.findIndex(
      (block) => block.id === blockId
    );

    const target = index + direction;

    if (index < 0 || target < 0 || target >= chapter.blocks.length) return;

    finishHistoryGroup();
    recordHistory();

    [
      chapter.blocks[index],
      chapter.blocks[target]
    ] = [
      chapter.blocks[target],
      chapter.blocks[index]
    ];

    scheduleSave();
    renderAll();
  }

  function moveBlockTo(blockId, targetId) {
    const chapter = currentChapter();
    if (!chapter || blockId === targetId) return;

    const from = chapter.blocks.findIndex(
      (block) => block.id === blockId
    );

    const to = chapter.blocks.findIndex(
      (block) => block.id === targetId
    );

    if (from < 0 || to < 0) return;

    finishHistoryGroup();
    recordHistory();

    const moved = chapter.blocks.splice(from, 1)[0];

    const adjustedTarget = chapter.blocks.findIndex(
      (block) => block.id === targetId
    );

    chapter.blocks.splice(adjustedTarget, 0, moved);

    state.selectedBlockId = blockId;

    scheduleSave();
    renderAll();
  }

  function removeBlock(blockId) {
    const chapter = currentChapter();
    if (!chapter) return;

    const index = chapter.blocks.findIndex(
      (block) => block.id === blockId
    );

    if (index < 0) return;

    if (!window.confirm("Delete this block? You can use Undo to restore it.")) {
      return;
    }

    finishHistoryGroup();
    recordHistory();

    chapter.blocks.splice(index, 1);

    if (state.selectedBlockId === blockId) {
      state.selectedBlockId = "";
    }

    scheduleSave();
    renderAll();
  }

  function blockLabel(block) {
    const names = {
      paragraph: "Writing paragraph",
      narration: "Narration",
      dialogue: "Dialogue",
      reveal: "Visual reveal",
      image: "Image / GIF",
      video: "Short video",
      audio: "Audio",
      choice: "Reader choice",
      game: "Game link",
      chapterEnd: "Chapter transition",
      reference: "Reference file"
    };

    return names[block.type] || "Story block";
  }

  function createReferenceSummary(block) {
    const p = document.createElement("p");
    p.className = "block-meta";

    const asset = state.project.assets.find(
      (item) => item.id === block.assetId
    );

    p.textContent = asset
      ? "Attached reference: " + asset.name
      : "No reference attached. Choose one from the inspector or Asset shelf.";

    return p;
  }

  function getMediaField(block) {
    if (block.type === "image" || block.type === "reveal") {
      return {
        key: "imageUrl",
        placeholder: "Image or GIF URL (optional if attached from Asset shelf)"
      };
    }

    if (block.type === "video") {
      return {
        key: "videoUrl",
        placeholder: "Direct video URL (MP4/WebM)"
      };
    }

    if (block.type === "audio") {
      return {
        key: "audioUrl",
        placeholder: "Direct audio URL"
      };
    }

    if (block.type === "game") {
      return {
        key: "gameUrl",
        placeholder: "Game URL"
      };
    }

    return null;
  }

  function makeBlockInput(block, className, placeholder, value, onInput) {
    const field = document.createElement("input");

    field.className = className;
    field.placeholder = placeholder;
    field.value = value || "";

    field.addEventListener("click", (event) => event.stopPropagation());

    field.addEventListener("input", () => {
      onInput(field.value);
      recordHistory("typing");
      scheduleSave();
    });

    field.addEventListener("change", finishHistoryGroup);
    field.addEventListener("blur", finishHistoryGroup);

    return field;
  }

  function renderManuscript() {
    const container = $("manuscript");
    if (!container) return;

    container.replaceChildren();

    const chapter = currentChapter();
    if (!chapter) return;

    if (!chapter.blocks.length) {
      const empty = document.createElement("p");
      empty.className = "block-empty";
      empty.textContent =
        "A fresh page. Write a paragraph or add an experience below.";
      container.appendChild(empty);
    }

    chapter.blocks.forEach((block, index) => {
      const card = document.createElement("article");

      card.className =
        "story-block" +
        (block.id === state.selectedBlockId ? " selected" : "");

      card.dataset.blockId = block.id;
      card.draggable = true;

      card.addEventListener("click", () => {
        if (
          state.selectedBlockId === block.id &&
          !state.inspectorClosed
        ) return;

        finishHistoryGroup();

        state.selectedBlockId = block.id;

        openInspector();
        renderManuscript();
        renderInspector();
        updateInspectorState();
      });

      card.addEventListener("dragstart", (event) => {
        if (event.target.closest("input, textarea, button, select")) {
          event.preventDefault();
          return;
        }

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/ceeqwinn-block", block.id);
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");

        document.querySelectorAll(".story-block").forEach((item) => {
          item.classList.remove("drag-over");
        });
      });

      card.addEventListener("dragover", (event) => {
        if (!Array.from(event.dataTransfer.types || []).includes(
          "text/ceeqwinn-block"
        )) return;

        event.preventDefault();
        card.classList.add("drag-over");
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("drag-over");
      });

      card.addEventListener("drop", (event) => {
        const draggedId = event.dataTransfer.getData("text/ceeqwinn-block");
        if (!draggedId) return;

        event.preventDefault();
        event.stopPropagation();

        card.classList.remove("drag-over");
        moveBlockTo(draggedId, block.id);
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
        ["＋", "Add after this block", () => {
          state.selectedBlockId = block.id;
          addBlock("paragraph");
        }],
        ["×", "Delete block", () => removeBlock(block.id)]
      ].forEach(([symbol, title, action]) => {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = symbol;
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
        const title = makeBlockInput(
          block,
          "block-title-input",
          "Experience title",
          block.title,
          (value) => {
            block.title = value;
          }
        );

        title.setAttribute("aria-label", "Block title");
        card.appendChild(title);
      }

      if (block.type !== "reference") {
        const textarea = document.createElement("textarea");

        textarea.className = "block-text";
        textarea.placeholder = block.type === "paragraph"
          ? "Continue writing here…"
          : "Add the text for this experience…";

        textarea.value = block.text || "";
        textarea.setAttribute("aria-label", blockLabel(block) + " text");

        textarea.addEventListener("click", (event) => {
          event.stopPropagation();
        });

        textarea.addEventListener("input", () => {
          block.text = textarea.value;

          recordHistory("typing");
          scheduleSave();
          updateCounts();
        });

        textarea.addEventListener("change", finishHistoryGroup);
        textarea.addEventListener("blur", finishHistoryGroup);

        card.appendChild(textarea);
      } else {
        card.appendChild(createReferenceSummary(block));
      }

      if (block.type === "dialogue") {
        const character = makeBlockInput(
          block,
          "block-title-input",
          "Character / speaker name",
          block.character,
          (value) => {
            block.character = value;
          }
        );

        card.appendChild(character);
      }

      const media = getMediaField(block);

      if (media) {
        const url = makeBlockInput(
          block,
          "block-title-input",
          media.placeholder,
          block[media.key],
          (value) => {
            block[media.key] = value;
          }
        );

        url.setAttribute("aria-label", media.placeholder);
        card.appendChild(url);
      }

      if (block.type === "choice") {
        const summary = document.createElement("p");
        summary.className = "block-meta";

        summary.textContent =
          (block.options || []).length +
          " choice options · edit labels in Quick Edit";

        card.appendChild(summary);
      }

      container.appendChild(card);
    });
  }

  /* =========================================================
     QUICK EDIT INSPECTOR
     ========================================================= */

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

    field.addEventListener("input", () => {
      onInput(field.value);
      recordHistory("typing");
      scheduleSave();
    });

    field.addEventListener("change", finishHistoryGroup);
    field.addEventListener("blur", finishHistoryGroup);

    parent.appendChild(label);
    return field;
  }

  function renderInspector() {
    const container = $("inspectorContent");
    if (!container) return;

    container.replaceChildren();

    const block = currentBlock();

    if (!block) {
      const note = document.createElement("p");
      note.className = "muted";

      note.textContent =
        "Select a block in your chapter to edit its details. Quick Edit stays here while you write.";

      container.appendChild(note);
      return;
    }

    const typeNote = document.createElement("p");
    typeNote.className = "inspector-note";
    typeNote.textContent = blockLabel(block);
    container.appendChild(typeNote);

    if (block.type !== "paragraph" && block.type !== "reference") {
      addInspectorField(
        container,
        "Experience title",
        block.title,
        (value) => {
          block.title = value;
          renderManuscript();
        }
      );
    }

    if (block.type === "dialogue") {
      addInspectorField(
        container,
        "Speaker",
        block.character,
        (value) => {
          block.character = value;
          renderManuscript();
        }
      );
    }

    const media = getMediaField(block);

    if (media) {
      addInspectorField(
        container,
        media.placeholder,
        block[media.key],
        (value) => {
          block[media.key] = value;
          renderManuscript();
        }
      );
    }

    if (block.type === "choice") {
      const heading = document.createElement("h3");
      heading.textContent = "Choice options";
      container.appendChild(heading);

      block.options = Array.isArray(block.options) ? block.options : [];

      block.options.forEach((option, index) => {
        addInspectorField(
          container,
          "Option " + (index + 1),
          option.label,
          (value) => {
            option.label = value;
          }
        );

        addInspectorField(
          container,
          "Target chapter ID (optional)",
          option.target,
          (value) => {
            option.target = value;
          }
        );
      });

      const add = document.createElement("button");

      add.className = "button secondary full-width";
      add.type = "button";
      add.textContent = "＋ Add choice option";

      add.addEventListener("click", () => {
        finishHistoryGroup();
        recordHistory();

        block.options.push({
          label: "New choice",
          target: ""
        });

        scheduleSave();
        renderInspector();
        renderManuscript();
      });

      container.appendChild(add);

      const note = document.createElement("p");
      note.className = "inspector-note";

      note.textContent =
        "Targets are saved as chapter IDs. Full conditional branching still needs its own Reader integration.";

      container.appendChild(note);
    }

    if (block.type === "chapterEnd") {
      const choices = [
        { label: "No next chapter", value: "" }
      ].concat(
        state.project.chapters.map((chapter) => ({
          label: chapter.title,
          value: chapter.id
        }))
      );

      addInspectorField(
        container,
        "Next chapter",
        block.nextChapterId,
        (value) => {
          block.nextChapterId = value;
          renderManuscript();
        },
        { select: choices }
      );
    }

    if (block.type === "reference") {
      const choices = [
        { label: "Choose a reference file", value: "" }
      ].concat(
        state.project.assets.map((asset) => ({
          label: asset.name,
          value: asset.id
        }))
      );

      const picker = addInspectorField(
        container,
        "Attached reference",
        block.assetId,
        (value) => {
          block.assetId = value;
          renderManuscript();
        },
        { select: choices }
      );

      picker.value = block.assetId || "";
    }

    if (["image", "reveal", "video", "audio"].includes(block.type)) {
      const choices = [
        { label: "Choose media from Asset shelf", value: "" }
      ].concat(
        state.project.assets
          .filter((asset) => ["image", "video", "audio"].includes(asset.kind))
          .map((asset) => ({
            label: asset.name,
            value: asset.id
          }))
      );

      const picker = addInspectorField(
        container,
        "Attach saved media",
        block.assetId || "",
        (value) => {
          block.assetId = value;

          const asset = state.project.assets.find(
            (item) => item.id === value
          );

          if (asset && asset.dataUrl) {
            if (asset.kind === "image") block.imageUrl = asset.dataUrl;
            if (asset.kind === "video") block.videoUrl = asset.dataUrl;
            if (asset.kind === "audio") block.audioUrl = asset.dataUrl;
          }

          renderManuscript();
        },
        { select: choices }
      );

      picker.value = block.assetId || "";
    }

    const trayButton = document.createElement("button");

    trayButton.type = "button";
    trayButton.className = "button secondary full-width";
    trayButton.textContent = "Open asset shelf";
    trayButton.addEventListener("click", openWritingAssetTray);

    container.appendChild(trayButton);

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "button quiet full-width";
    deleteButton.style.marginTop = "18px";
    deleteButton.textContent = "Delete this block";
    deleteButton.addEventListener("click", () => removeBlock(block.id));

    container.appendChild(deleteButton);
  }

  function updateInspectorState() {
    const inspector = $("blockInspector");
    if (!inspector) return;

    inspector.classList.toggle(
      "inspector-expanded",
      state.inspectorExpanded
    );

    inspector.classList.toggle(
      "inspector-closed",
      state.inspectorClosed
    );

    inspector.hidden = state.inspectorClosed;

    const expandButton = $("expandInspectorButton");

    if (expandButton) {
      expandButton.textContent = state.inspectorExpanded
        ? "Restore size"
        : "Expand Quick Edit";

      expandButton.setAttribute(
        "aria-expanded",
        String(state.inspectorExpanded)
      );
    }
  }

  function closeInspector() {
    finishHistoryGroup();

    state.selectedBlockId = "";
    state.inspectorExpanded = false;
    state.inspectorClosed = true;

    renderManuscript();
    renderInspector();
    updateInspectorState();
  }

  function openInspector() {
    state.inspectorClosed = false;
    updateInspectorState();
  }

  function toggleInspectorExpanded() {
    state.inspectorExpanded = !state.inspectorExpanded;

    openInspector();
    updateInspectorState();
  }

  /* =========================================================
     OVERVIEW AND COUNTS
     ========================================================= */

  function renderOverview() {
    const fields = [
      ["storyTitle", state.project.title || ""],
      ["storyDescription", state.project.description || ""],
      ["storyGenre", state.project.genre || ""],
      ["storyStatus", state.project.status || "draft"],
      ["storySlug", state.project.slug || slugify(state.project.title)]
    ];

    fields.forEach(([id, value]) => {
      const field = $(id);

      if (field && document.activeElement !== field) {
        field.value = value;
      }
    });

    const list = $("overviewChapterList");
    if (!list) return;

    list.replaceChildren();

    state.project.chapters.forEach((chapter, index) => {
      const row = document.createElement("div");
      row.className = "overview-chapter";

      const open = document.createElement("button");
      open.type = "button";

      open.textContent =
        (index + 1) + ". " +
        (chapter.title || "Untitled chapter") +
        " · " + chapter.blocks.length + " blocks" +
        " · " + (chapter.folder || "Unsorted");

      open.addEventListener("click", () => {
        finishHistoryGroup();

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

    const blocks = chapters.reduce(
      (sum, chapter) => sum + chapter.blocks.length,
      0
    );

    const words = chapters.reduce((total, chapter) => {
      return total + chapter.blocks.reduce((sum, block) => {
        return sum + (
          String(block.text || "").trim().match(/\S+/g) || []
        ).length;
      }, 0);
    }, 0);

    safeSet("chapterCount", chapters.length);
    safeSet("blockCount", blocks);
    safeSet("wordCount", words);
    safeSet("assetCount", state.project.assets.length);
    safeSet("assetShelfCount", state.project.assets.length + " files");
  }

  /* =========================================================
     ASSET FILES
     ========================================================= */

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function kindForFile(file) {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";

    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      return "pdf";
    }

    if (/\.(doc|docx|odt|rtf)$/i.test(file.name)) return "document";
    if (/\.(xls|xlsx|ppt|pptx|zip)$/i.test(file.name)) return "file";
    if (/\.(txt|md|json)$/i.test(file.name)) return "text";

    return "file";
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(
        new Error("Could not read " + file.name)
      );

      reader.readAsDataURL(file);
    });
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(
        new Error("Could not read " + file.name)
      );

      reader.readAsText(file);
    });
  }

  function selectedAssetFolder() {
    const filter = $("assetFolderFilter");
    const value = filter ? filter.value : "";

    if (
      value &&
      value !== "__all__" &&
      state.project.assetFolders.includes(value)
    ) {
      return value;
    }

    return "Unsorted";
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    let added = 0;
    const destinationFolder = selectedAssetFolder();

    for (const file of files) {
      if (!file || file.size === 0) continue;

      if (file.size > MAX_SINGLE_FILE_BYTES) {
        notify(
          file.name +
          " is larger than 18 MB. Keep large files externally and add a link instead."
        );
        continue;
      }

      if (state.project.assets.length >= MAX_PROJECT_ASSETS) {
        notify("The project has reached its asset limit.");
        break;
      }

      try {
        const dataUrl = await readAsDataUrl(file);

        const asset = {
          id: makeId("asset"),
          name: file.name,
          type: file.type || "application/octet-stream",
          kind: kindForFile(file),
          size: file.size,
          lastModified: file.lastModified || 0,
          relativePath: file.webkitRelativePath || file.name,
          folder: destinationFolder,
          dataUrl: dataUrl,
          addedAt: new Date().toISOString()
        };

        // Check the complete project size before accepting the file.
        const projected = clone(state.project);
        projected.assets.push(asset);

        if (JSON.stringify(projected).length > MAX_PROJECT_STORAGE_CHARS) {
          notify(
            file.name +
            " was not added because it would exceed the safe browser-storage limit. Use an externally hosted media link instead."
          );
          continue;
        }

        finishHistoryGroup();

        state.project.assets.push(asset);
        recordHistory();

        added++;
      } catch (error) {
        notify("Could not add " + file.name + ".");
      }
    }

    if (added) {
      scheduleSave();

      renderAssetShelf();
      renderWritingAssetShelf();
      renderOverview();
      updateCounts();

      notify(
        added + " file" + (added === 1 ? "" : "s") +
        ' added to "' + destinationFolder + '".'
      );
    }
  }

  function assetIcon(asset) {
    return ({
      image: "▧",
      video: "▶",
      audio: "♫",
      pdf: "PDF",
      document: "DOC",
      text: "TXT",
      file: "FILE"
    })[asset.kind] || "FILE";
  }

  function renderAssetFolderControls() {
    const filter = $("assetFolderFilter");
    if (!filter) return;

    const previous = filter.value;
    filter.replaceChildren();

    const all = document.createElement("option");
    all.value = "__all__";
    all.textContent = "All folders";
    filter.appendChild(all);

    state.project.assetFolders.forEach((folder) => {
      const option = document.createElement("option");
      option.value = folder;
      option.textContent = folder;
      filter.appendChild(option);
    });

    if (
      previous === "__all__" ||
      state.project.assetFolders.includes(previous)
    ) {
      filter.value = previous;
    } else {
      filter.value = "__all__";
    }
  }

  function createAssetCard(asset, compact) {
    const card = document.createElement("article");

    card.className = "asset-card";
    card.draggable = true;
    card.dataset.assetId = asset.id;

    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/ceeqwinn-asset", asset.id);
    });

    const thumb = document.createElement("div");
    thumb.className = "asset-thumb";

    if (asset.kind === "image" && asset.dataUrl) {
      const image = document.createElement("img");

      image.src = asset.dataUrl;
      image.alt = asset.name;
      image.loading = "lazy";

      thumb.appendChild(image);
    } else if (asset.kind === "video" && asset.dataUrl) {
      const video = document.createElement("video");

      video.src = asset.dataUrl;
      video.muted = true;
      video.preload = "metadata";
      video.controls = !compact;

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

    if (!compact) {
      const folderLabel = document.createElement("label");
      folderLabel.className = "asset-folder-label";
      folderLabel.textContent = "Folder";

      const folderSelect = document.createElement("select");

      folderSelect.setAttribute(
        "aria-label",
        "Move " + asset.name + " to folder"
      );

      state.project.assetFolders.forEach((folder) => {
        const option = document.createElement("option");
        option.value = folder;
        option.textContent = folder;
        folderSelect.appendChild(option);
      });

      folderSelect.value = asset.folder || "Unsorted";

      folderSelect.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      folderSelect.addEventListener("change", () => {
        if (asset.folder === folderSelect.value) return;

        finishHistoryGroup();
        recordHistory();

        asset.folder = folderSelect.value;

        scheduleSave();
        renderAssetShelf();
        renderWritingAssetShelf();

        notify('"' + asset.name + '" moved to "' + asset.folder + '".');
      });

      folderLabel.appendChild(folderSelect);
      card.appendChild(folderLabel);
    }

    const actions = document.createElement("div");
    actions.className = "asset-actions";

    if (asset.dataUrl && !compact) {
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
      insert.textContent = compact ? "Insert" : "Use in story";
      insert.addEventListener("click", () => insertAssetIntoStory(asset));

      actions.appendChild(insert);
    } else {
      const attach = document.createElement("button");

      attach.type = "button";
      attach.textContent = "Attach reference";
      attach.addEventListener("click", () => attachReference(asset));

      actions.appendChild(attach);
    }

    if (!compact) {
      const remove = document.createElement("button");

      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => removeAsset(asset));

      actions.appendChild(remove);
    }

    card.appendChild(actions);
    return card;
  }

  function getFilteredAssets() {
    const filter = $("assetFolderFilter");
    const folder = filter ? filter.value : "__all__";

    if (!folder || folder === "__all__") {
      return state.project.assets;
    }

    return state.project.assets.filter(
      (asset) => (asset.folder || "Unsorted") === folder
    );
  }

  function renderAssetShelf() {
    const shelf = $("assetShelf");
    if (!shelf) return;

    shelf.replaceChildren();

    const assets = getFilteredAssets();

    if (!assets.length) {
      const empty = document.createElement("p");
      empty.className = "muted";

      empty.textContent = state.project.assets.length
        ? "There are no files in this folder yet."
        : "Your shelf is empty. Drop files above to start collecting your story materials.";

      shelf.appendChild(empty);
      return;
    }

    assets.forEach((asset) => {
      shelf.appendChild(createAssetCard(asset, false));
    });
  }

  function renderWritingAssetShelf() {
    const shelf = $("writingAssetShelf");
    if (!shelf) return;

    shelf.replaceChildren();

    if (!state.project.assets.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Your asset shelf is empty.";

      shelf.appendChild(empty);
      return;
    }

    state.project.assets.forEach((asset) => {
      shelf.appendChild(createAssetCard(asset, true));
    });
  }

  function addAssetFolder() {
    const input = $("newAssetFolderName");
    const rawName = input ? input.value.trim() : "";

    if (!rawName) {
      notify("Enter a name for the new asset folder.");
      if (input) input.focus();
      return;
    }

    if (state.project.assetFolders.some(
      (folder) => folder.toLowerCase() === rawName.toLowerCase()
    )) {
      notify("An asset folder with that name already exists.");
      return;
    }

    finishHistoryGroup();
    recordHistory();

    const name = uniqueFolderName(rawName, state.project.assetFolders);
    state.project.assetFolders.push(name);

    if (input) input.value = "";

    scheduleSave();
    renderAssetFolderControls();
    renderAssetShelf();

    const filter = $("assetFolderFilter");

    if (filter) {
      filter.value = name;
      renderAssetShelf();
    }

    const dialog = $("assetFolderDialog");
    if (dialog) dialog.close();

    notify('Asset folder "' + name + '" created.');
  }

  function removeAsset(asset) {
    if (!window.confirm(
      "Remove " + asset.name + " from this project's asset shelf?"
    )) return;

    finishHistoryGroup();
    recordHistory();

    state.project.assets = state.project.assets.filter(
      (item) => item.id !== asset.id
    );

    state.project.chapters.forEach((chapter) => {
      chapter.blocks.forEach((block) => {
        if (block.assetId === asset.id) block.assetId = "";
      });
    });

    scheduleSave();
    renderAll();

    notify("Asset removed. Use Undo if you removed it by mistake.");
  }

  function deleteAssetFolder(folder) {
    if (folder === "Unsorted") {
      notify('The "Unsorted" folder is kept as the default folder.');
      return;
    }

    if (!window.confirm(
      'Delete the "' + folder + '" folder? Its files will be moved to Unsorted.'
    )) return;

    finishHistoryGroup();
    recordHistory();

    state.project.assets.forEach((asset) => {
      if (asset.folder === folder) asset.folder = "Unsorted";
    });

    state.project.assetFolders = state.project.assetFolders.filter(
      (item) => item !== folder
    );

    scheduleSave();
    renderAssetFolderControls();
    renderAssetShelf();
    renderWritingAssetShelf();

    notify("Asset folder deleted. Its files were kept.");
  }

  function openWritingAssetTray() {
    const tray = $("writingAssetTray");

    if (!tray) {
      showPanel("assetsPanel");
      return;
    }

    tray.hidden = false;
    tray.classList.add("asset-tray-open");

    renderWritingAssetShelf();
  }

  function closeWritingAssetTray() {
    const tray = $("writingAssetTray");
    if (!tray) return;

    tray.hidden = true;
    tray.classList.remove("asset-tray-open");
  }

  function attachReference(asset) {
    const chapter = currentChapter();
    if (!chapter) return;

    finishHistoryGroup();
    recordHistory();

    const block = createBlock("reference");
    block.assetId = asset.id;

    const index = chapter.blocks.findIndex(
      (item) => item.id === state.selectedBlockId
    );

    chapter.blocks.splice(
      index >= 0 ? index + 1 : chapter.blocks.length,
      0,
      block
    );

    state.selectedBlockId = block.id;

    openInspector();
    showPanel("writingPanel");

    scheduleSave();
    renderAll();
    closeWritingAssetTray();
  }

  function insertAssetIntoStory(asset) {
    const type = asset.kind === "image"
      ? "image"
      : asset.kind === "video"
        ? "video"
        : "audio";

    const chapter = currentChapter();
    if (!chapter) return;

    finishHistoryGroup();
    recordHistory();

    const block = createBlock(type);

    block.title = asset.name;
    block.assetId = asset.id;

    if (asset.kind === "image") block.imageUrl = asset.dataUrl || "";
    if (asset.kind === "video") block.videoUrl = asset.dataUrl || "";
    if (asset.kind === "audio") block.audioUrl = asset.dataUrl || "";

    const index = chapter.blocks.findIndex(
      (item) => item.id === state.selectedBlockId
    );

    chapter.blocks.splice(
      index >= 0 ? index + 1 : chapter.blocks.length,
      0,
      block
    );

    state.selectedBlockId = block.id;

    openInspector();
    showPanel("writingPanel");

    scheduleSave();
    renderAll();
    closeWritingAssetTray();

    notify("Added " + asset.name + " to the chapter.");
  }

  async function collectDroppedEntries(dataTransfer) {
    const output = [];

    const entries = Array.from(dataTransfer.items || [])
      .map((item) => item.webkitGetAsEntry ? item.webkitGetAsEntry() : null)
      .filter(Boolean);

    async function walk(entry, path) {
      if (entry.isFile) {
        const file = await new Promise((resolve) => {
          entry.file(resolve, () => resolve(null));
        });

        if (file) {
          try {
            Object.defineProperty(file, "webkitRelativePath", {
              value: path + file.name
            });
          } catch (error) {}

          output.push(file);
        }
      } else if (entry.isDirectory) {
        const reader = entry.createReader();

        const readBatch = () => new Promise((resolve) => {
          reader.readEntries(resolve, () => resolve([]));
        });

        let batch;

        do {
          batch = await readBatch();

          for (const child of batch) {
            await walk(child, path + entry.name + "/");
          }
        } while (batch.length);
      }
    }

    if (entries.length) {
      for (const entry of entries) {
        await walk(entry, "");
      }

      return output;
    }

    return Array.from(dataTransfer.files || []);
  }

  /* =========================================================
     PUBLISHING AND PROJECT IMPORT / EXPORT
     ========================================================= */

  function updatePublishUrl() {
    const slugField = $("storySlug");
    const preview = $("publicUrlPreview");

    if (!preview) return;

    const slug = slugify(
      (slugField && slugField.value) ||
      state.project.slug ||
      state.project.title
    );

    preview.textContent =
      window.location.origin + "/read.html?story=" + slug;
  }

  function downloadJson(filename, data) {
    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

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
    finishHistoryGroup();
    saveNow();

    downloadJson(
      slugify(state.project.title) + "-project-backup.json",
      state.project
    );

    notify("Project backup exported. Keep it somewhere safe.");
  }

  function exportReaderStory() {
    finishHistoryGroup();

    const project = clone(state.project);

    project.slug = slugify(
      ($("storySlug") && $("storySlug").value) ||
      project.slug ||
      project.title
    );

    project.theme = Object.assign({}, project.theme, {
      accent: state.settings.accent,
      background: state.settings.background,
      panel: state.settings.panel,
      text: state.settings.text
    });

    // Do not silently mark the story ready.
    // The user's actual project status is preserved.
    project.status = state.project.status || "draft";

    downloadJson(project.slug + ".json", project);

    notify(
      "Reader JSON exported. Upload it to the website's stories folder when you are ready to publish."
    );
  }

  async function importProject(file) {
    if (!file) return;

    try {
      const rawText = await readFileAsText(file);
      const incoming = JSON.parse(rawText);
      const validated = validateIncomingProject(incoming);

      if (!window.confirm(
        "Open this project backup? It will replace the draft currently open in the Studio."
      )) return;

      finishHistoryGroup();
      recordHistory();

      state.project = validated;
      state.chapterId = state.project.chapters[0].id;
      state.selectedBlockId = "";

      scheduleSave();
      renderAll();

      recordHistory();

      notify("Project backup opened.");
    } catch (error) {
      notify(
        "Could not open that JSON file. Check that it is a valid Studio project backup and is not too large."
      );
    }
  }

  /* =========================================================
     SETTINGS
     ========================================================= */

  function applySettingsToPage() {
    const settings = state.settings;
    if (!settings) return;

    document.documentElement.style.setProperty("--accent", settings.accent);
    document.documentElement.style.setProperty("--bg", settings.background);
    document.documentElement.style.setProperty("--panel", settings.panel);
    document.documentElement.style.setProperty("--text", settings.text);

    document.documentElement.style.setProperty(
      "--writing-font",
      settings.fontFamily
    );

    document.documentElement.style.setProperty(
      "--writing-size",
      settings.fontSize + "px"
    );

    document.body.classList.toggle(
      "hide-hints",
      !settings.showHints
    );

    document.body.classList.toggle(
      "light-workspace",
      !settings.darkMode
    );

    document.body.classList.toggle(
      "reduce-motion",
      settings.reduceMotion
    );

    safeSet("fontSizeValue", settings.fontSize + "px");

    if (state.project) {
      state.project.theme = Object.assign({}, state.project.theme, {
        accent: settings.accent,
        background: settings.background,
        panel: settings.panel,
        text: settings.text
      });
    }
  }

  function openSettings() {
    const s = state.settings;

    const values = {
      showHintsSetting: s.showHints,
      darkModeSetting: s.darkMode,
      fontFamilySetting: s.fontFamily,
      fontSizeSetting: s.fontSize,
      accentSetting: s.accent,
      backgroundSetting: s.background,
      panelSetting: s.panel,
      textSetting: s.text,
      transitionSetting: s.transition,
      reduceMotionSetting: s.reduceMotion
    };

    Object.keys(values).forEach((id) => {
      const element = $(id);
      if (!element) return;

      if (element.type === "checkbox") {
        element.checked = values[id];
      } else {
        element.value = values[id];
      }
    });

    safeSet("fontSizeValue", s.fontSize + "px");

    renderPalette();
    renderMoodLibrary();

    if ($("settingsDialog")) {
      $("settingsDialog").showModal();
    }
  }

  function renderPalette() {
    const container = $("paletteSwatches");
    if (!container) return;

    container.replaceChildren();

    palette.forEach((colour) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "palette-swatch";
      button.style.background = colour;
      button.title = "Use " + colour;
      button.setAttribute("aria-label", "Use colour " + colour);

      button.addEventListener("click", () => {
        if ($("accentSetting")) {
          $("accentSetting").value = colour;
        }
      });

      container.appendChild(button);
    });
  }

  function saveSettings() {
    const showHints = $("showHintsSetting");
    const darkMode = $("darkModeSetting");
    const fontFamily = $("fontFamilySetting");
    const fontSize = $("fontSizeSetting");
    const transition = $("transitionSetting");
    const reduceMotion = $("reduceMotionSetting");

    if (
      !showHints ||
      !darkMode ||
      !fontFamily ||
      !fontSize ||
      !transition ||
      !reduceMotion
    ) {
      notify("Some settings controls are missing from the page.");
      return;
    }

    const readColour = (id, fallback) => {
      const field = $(id);

      return field && isHexColour(field.value)
        ? field.value.toLowerCase()
        : fallback;
    };

    const requestedSize = Number(fontSize.value);

    state.settings = {
      showHints: showHints.checked,
      darkMode: darkMode.checked,
      fontFamily: fontFamily.value,
      fontSize: Number.isFinite(requestedSize)
        ? Math.max(12, Math.min(32, requestedSize))
        : defaultSettings.fontSize,
      accent: readColour("accentSetting", defaultSettings.accent),
      background: readColour("backgroundSetting", defaultSettings.background),
      panel: readColour("panelSetting", defaultSettings.panel),
      text: readColour("textSetting", defaultSettings.text),
      transition: transition.value,
      reduceMotion: reduceMotion.checked
    };

    if (!writeLocalStorage(
      SETTINGS_KEY,
      JSON.stringify(state.settings)
    )) {
      notify("Settings could not be saved in this browser.");
      return;
    }

    applySettingsToPage();
    scheduleSave();

    if ($("settingsDialog")) {
      $("settingsDialog").close();
    }

    notify("Studio settings saved.");
  }

  function resetSettings() {
    state.settings = Object.assign({}, defaultSettings);

    if (!writeLocalStorage(
      SETTINGS_KEY,
      JSON.stringify(state.settings)
    )) {
      notify("Default settings could not be saved.");
      return;
    }

    applySettingsToPage();
    openSettings();
  }

  /* =========================================================
     SAVED MOOD LIBRARY
     ========================================================= */

  function normalizeMood(mood) {
    if (!mood || typeof mood !== "object") return null;

    const colours = mood.colours || mood.theme || {};
    const normalizedColours = {};

    for (const key of MOOD_COLOURS) {
      if (!isHexColour(colours[key])) return null;

      normalizedColours[key] = colours[key].toLowerCase();
    }

    const name = String(mood.name || "").trim().slice(0, 80);
    if (!name) return null;

    return {
      schemaVersion: 1,
      id: String(mood.id || makeId("mood")),
      name: name,
      colours: normalizedColours,
      createdAt: mood.createdAt || new Date().toISOString(),
      updatedAt: mood.updatedAt || new Date().toISOString()
    };
  }

  function loadMoods() {
    try {
      const saved = JSON.parse(readLocalStorage(MOODS_KEY, "[]"));

      state.moods = Array.isArray(saved)
        ? saved.map(normalizeMood).filter(Boolean)
        : [];
    } catch (error) {
      state.moods = [];
    }
  }

  function saveMoodsToStorage() {
    if (!writeLocalStorage(MOODS_KEY, JSON.stringify(state.moods))) {
      notify("The Mood Library could not be saved in this browser.");
      return false;
    }

    return true;
  }

  function getCurrentColours() {
    const colours = {};

    MOOD_COLOURS.forEach((key) => {
      const field = $(key + "Setting");
      const value = field ? field.value : state.settings[key];

      colours[key] = isHexColour(value)
        ? value.toLowerCase()
        : defaultSettings[key];
    });

    return colours;
  }

  function setMoodEditor(name, editing) {
    const nameField = $("moodNameInput");
    const saveButton = $("saveMoodButton");
    const cancelButton = $("cancelMoodEditButton");

    if (nameField) {
      nameField.value = name || "";
      nameField.focus();
    }

    if (saveButton) {
      saveButton.textContent = editing
        ? "Update mood"
        : "Save mood";
    }

    if (cancelButton) {
      cancelButton.hidden = !editing;
    }
  }

  function cancelMoodEdit() {
    state.editingMoodId = "";
    setMoodEditor("", false);
  }

  function saveMood() {
    const nameField = $("moodNameInput");
    const name = nameField ? nameField.value.trim() : "";

    if (!name) {
      notify("Give this mood a name first.");
      if (nameField) nameField.focus();
      return;
    }

    const colours = getCurrentColours();
    const now = new Date().toISOString();

    if (state.editingMoodId) {
      const existing = state.moods.find(
        (mood) => mood.id === state.editingMoodId
      );

      if (!existing) {
        state.editingMoodId = "";

        notify("That mood could not be found. Save it as a new mood.");
        return;
      }

      const previous = clone(existing);

      existing.name = name.slice(0, 80);
      existing.colours = colours;
      existing.updatedAt = now;

      if (!saveMoodsToStorage()) {
        Object.assign(existing, previous);
        return;
      }

      cancelMoodEdit();
      renderMoodLibrary();

      notify("Mood updated with the current exact colours.");
      return;
    }

    const mood = {
      schemaVersion: 1,
      id: makeId("mood"),
      name: name.slice(0, 80),
      colours: colours,
      createdAt: now,
      updatedAt: now
    };

    state.moods.push(mood);

    if (!saveMoodsToStorage()) {
      state.moods.pop();
      return;
    }

    if (nameField) nameField.value = "";

    renderMoodLibrary();
    notify("Mood saved to your Mood Library.");
  }

  function applyMood(moodId) {
    const mood = state.moods.find(
      (item) => item.id === moodId
    );

    if (!mood) return;

    MOOD_COLOURS.forEach((key) => {
      const field = $(key + "Setting");

      if (field) {
        field.value = mood.colours[key];
      }
    });

    state.settings = Object.assign({}, state.settings, mood.colours);

    if (!writeLocalStorage(
      SETTINGS_KEY,
      JSON.stringify(state.settings)
    )) {
      notify("The selected mood could not be saved.");
      return;
    }

    applySettingsToPage();
    scheduleSave();

    notify(
      '"' + mood.name + '" applied. Save Settings to close this window.'
    );

    renderMoodLibrary();
  }

  function renameMood(moodId) {
    const mood = state.moods.find(
      (item) => item.id === moodId
    );

    if (!mood) return;

    state.editingMoodId = mood.id;
    setMoodEditor(mood.name, true);

    notify("Change the name or colours, then choose Update mood.");
  }

  function deleteMood(moodId) {
    const mood = state.moods.find(
      (item) => item.id === moodId
    );

    if (!mood) return;

    if (!window.confirm(
      'Delete "' + mood.name + '" from the Mood Library?'
    )) return;

    const previous = state.moods;
    state.moods = state.moods.filter(
      (item) => item.id !== moodId
    );

    if (!saveMoodsToStorage()) {
      state.moods = previous;
      return;
    }

    if (state.editingMoodId === moodId) {
      cancelMoodEdit();
    }

    renderMoodLibrary();
    notify("Mood deleted.");
  }

  function exportMood(moodId) {
    const mood = state.moods.find(
      (item) => item.id === moodId
    );

    if (!mood) return;

    downloadJson(
      slugify(mood.name) + "-mood.json",
      clone(mood)
    );

    notify('"' + mood.name + '" exported.');
  }

  function createMoodImportInput() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".json,application/json";
    input.hidden = true;

    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];

      if (!file) {
        input.remove();
        return;
      }

      try {
        const parsed = JSON.parse(await readFileAsText(file));

        const candidates = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.moods)
            ? parsed.moods
            : [parsed];

        const valid = candidates
          .map(normalizeMood)
          .filter(Boolean);

        if (!valid.length) {
          throw new Error("No valid mood data found.");
        }

        const previousLength = state.moods.length;

        valid.forEach((incoming) => {
          const duplicate = state.moods.find(
            (item) => item.id === incoming.id
          );

          if (duplicate) {
            incoming.id = makeId("mood");
          }

          state.moods.push(incoming);
        });

        if (!saveMoodsToStorage()) {
          state.moods.splice(previousLength);
          return;
        }

        renderMoodLibrary();

        notify(
          valid.length + " mood" +
          (valid.length === 1 ? "" : "s") +
          " imported into your library."
        );
      } catch (error) {
        notify("That file is not a valid CEEQWINN mood JSON file.");
      }

      input.remove();
    });

    document.body.appendChild(input);
    input.click();
  }

  function renderMoodLibrary() {
    const list = $("moodLibraryList");
    const count = $("moodCount");

    if (count) {
      count.textContent = String(state.moods.length);
    }

    if (!list) return;

    list.replaceChildren();

    if (!state.moods.length) {
      const empty = document.createElement("p");

      empty.className = "muted";
      empty.textContent =
        "Your Mood Library is empty. Set your four workspace colours, name the mood and save it here.";

      list.appendChild(empty);
      return;
    }

    state.moods.forEach((mood) => {
      const card = document.createElement("article");

      card.className = "mood-card";
      card.style.padding = "14px";
      card.style.marginBottom = "12px";
      card.style.border = "1px solid var(--border, rgba(255,255,255,.14))";
      card.style.borderRadius = "12px";

      const heading = document.createElement("h3");

      heading.textContent = mood.name;
      heading.style.margin = "0 0 10px";

      card.appendChild(heading);

      const swatches = document.createElement("div");

      swatches.style.display = "grid";
      swatches.style.gridTemplateColumns = "repeat(4, minmax(0, 1fr))";
      swatches.style.gap = "6px";
      swatches.style.marginBottom = "10px";

      MOOD_COLOURS.forEach((key) => {
        const swatch = document.createElement("div");

        swatch.style.minWidth = "0";
        swatch.style.height = "34px";
        swatch.style.borderRadius = "7px";
        swatch.style.backgroundColor = mood.colours[key];
        swatch.style.border = "1px solid rgba(255,255,255,.2)";
        swatch.title = key + ": " + mood.colours[key];

        swatch.setAttribute(
          "aria-label",
          key + " " + mood.colours[key]
        );

        swatches.appendChild(swatch);
      });

      card.appendChild(swatches);

      const details = document.createElement("p");

      details.className = "mood-colour-values";
      details.style.fontSize = "12px";
      details.style.lineHeight = "1.6";
      details.style.overflowWrap = "anywhere";

      details.textContent =
        "Accent " + mood.colours.accent +
        " · Background " + mood.colours.background +
        " · Panel " + mood.colours.panel +
        " · Text " + mood.colours.text;

      card.appendChild(details);

      const actions = document.createElement("div");

      actions.className = "mood-actions";
      actions.style.display = "flex";
      actions.style.flexWrap = "wrap";
      actions.style.gap = "7px";

      [
        ["Apply", () => applyMood(mood.id)],
        ["Rename / Edit", () => renameMood(mood.id)],
        ["Export JSON", () => exportMood(mood.id)],
        ["Delete", () => deleteMood(mood.id)]
      ].forEach(([label, action]) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "button secondary";
        button.textContent = label;
        button.addEventListener("click", action);

        actions.appendChild(button);
      });

      card.appendChild(actions);
      list.appendChild(card);
    });
  }

  function bindMoodLibrary() {
    bindClick("saveMoodButton", saveMood);
    bindClick("cancelMoodEditButton", cancelMoodEdit);
    bindClick("importMoodButton", createMoodImportInput);
    bindClick("importMoodButtonAlt", createMoodImportInput);

    bindClick("exportAllMoodsButton", () => {
      if (!state.moods.length) {
        notify("There are no moods to export yet.");
        return;
      }

      downloadJson("ceeqwinn-mood-library.json", {
        schemaVersion: 1,
        moods: state.moods
      });

      notify("Mood Library exported.");
    });

    const nameField = $("moodNameInput");

    if (nameField) {
      nameField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          saveMood();
        }

        if (event.key === "Escape") {
          cancelMoodEdit();
        }
      });
    }
  }

  /* =========================================================
     THEATRE PREVIEW
     ========================================================= */

  function openPreview() {
    if (!$("previewDialog") || !window.CeeqwinnTheatre) {
      notify("The theatre preview engine is not available.");
      return;
    }

    safeSet(
      "previewStoryTitle",
      state.project.title || "Untitled story"
    );

    const frame = $("previewFrame");

    if (frame && $("previewSize")) {
      frame.classList.remove(
        "phone-preview",
        "tablet-preview",
        "desktop-preview"
      );

      frame.classList.add(
        ($("previewSize").value || "phone") + "-preview"
      );
    }

    window.CeeqwinnTheatre.render(
      $("theatrePreview"),
      state.project,
      currentChapter(),
      {
        mode: "preview",

        onNavigate: (id) => {
          const chapter = state.project.chapters.find(
            (item) => item.id === id
          );

          if (!chapter) return;

          state.chapterId = id;
          state.selectedBlockId = "";

          renderAll();
          openPreview();
        },

        onChoice: () => {}
      }
    );

    $("previewDialog").showModal();
  }

  /* =========================================================
     SIDEBAR AND FILE PICKERS
     ========================================================= */

  function toggleSidebar() {
    const sidebar = $("mainSidebar");
    const layout = document.querySelector(".app-layout");
    const expandButton = $("expandSidebarButton");
    const collapseButton = $("collapseSidebarButton");

    if (!sidebar || !layout) return;

    state.sidebarCollapsed = !state.sidebarCollapsed;

    sidebar.classList.toggle(
      "collapsed",
      state.sidebarCollapsed
    );

    layout.classList.toggle(
      "sidebar-collapsed",
      state.sidebarCollapsed
    );

    if (expandButton) {
      expandButton.hidden = !state.sidebarCollapsed;

      expandButton.setAttribute(
        "aria-expanded",
        String(!state.sidebarCollapsed)
      );
    }

    if (collapseButton) {
      collapseButton.hidden = state.sidebarCollapsed;

      collapseButton.setAttribute(
        "aria-expanded",
        String(!state.sidebarCollapsed)
      );
    }

    sidebar.querySelectorAll(
      ".nav-item span, .sidebar-section, .sidebar-bottom"
    ).forEach((item) => {
      item.hidden = state.sidebarCollapsed;
    });
  }

  function openAssetPicker(accept) {
    showPanel("assetsPanel");

    const input = $("assetFileInput");
    if (!input) return;

    input.accept = accept || "";
    input.click();
  }

  function bindAssetDropZone() {
    const dropZone = $("assetDropZone");
    if (!dropZone) return;

    dropZone.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;

      if ($("assetFileInput")) {
        $("assetFileInput").click();
      }
    });

    ["dragenter", "dragover"].forEach((name) => {
      dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        dropZone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((name) => {
      dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        dropZone.classList.remove("drag-over");
      });
    });

    dropZone.addEventListener("drop", async (event) => {
      const files = await collectDroppedEntries(event.dataTransfer);
      await addFiles(files);
    });
  }

  function bindManuscriptAssetDrop() {
    const manuscript = $("manuscript");
    if (!manuscript) return;

    manuscript.addEventListener("dragover", (event) => {
      if (
        Array.from(event.dataTransfer.types || []).includes(
          "text/ceeqwinn-asset"
        )
      ) {
        event.preventDefault();
      }
    });

    manuscript.addEventListener("drop", (event) => {
      const assetId = event.dataTransfer.getData("text/ceeqwinn-asset");
      if (!assetId) return;

      event.preventDefault();

      const asset = state.project.assets.find(
        (item) => item.id === assetId
      );

      if (asset) insertAssetIntoStory(asset);
    });
  }

  /* =========================================================
     EVENT BINDINGS
     ========================================================= */

  function bind() {
    document.querySelectorAll(".nav-item").forEach((button) => {
      button.addEventListener("click", () => {
        finishHistoryGroup();
        showPanel(button.dataset.panel);
      });
    });

    bindClick("addChapterButton", addChapter);
    bindClick("overviewAddChapterButton", addChapter);
    bindClick("renameChapterButton", renameChapter);
    bindClick("deleteChapterButton", deleteChapter);

    bindClick(
      "manageChapterFoldersButton",
      openChapterFolderDialog
    );

    bindClick("addChapterFolderButton", addChapterFolder);

    if ($("chapterFolderSelect")) {
      $("chapterFolderSelect").addEventListener("change", () => {
        assignChapterFolder($("chapterFolderSelect").value);
      });
    }

    if ($("newChapterFolderName")) {
      $("newChapterFolderName").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addChapterFolder();
        }
      });
    }

    bindClick("newWritingBatchButton", () => addBlock("paragraph"));
    bindClick("addParagraphButton", () => addBlock("paragraph"));
    bindClick("addParagraphButtonBottom", () => addBlock("paragraph"));

    bindClick("insertExperienceButton", () => {
      if ($("experienceDialog")) {
        $("experienceDialog").showModal();
      }
    });

    bindClick("insertExperienceButtonBottom", () => {
      if ($("experienceDialog")) {
        $("experienceDialog").showModal();
      }
    });

    bindClick("addImageButton", () => openAssetPicker("image/*"));
    bindClick("addImageButtonBottom", () => openAssetPicker("image/*"));

    bindClick("addVideoButton", () => openAssetPicker("video/*"));
    bindClick("addVideoButtonBottom", () => openAssetPicker("video/*"));

    bindClick("addReferenceButton", () => {
      openAssetPicker(
        ".pdf,.doc,.docx,.txt,.md,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.json"
      );
    });

    document.querySelectorAll(".experience-option").forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.type;

        if ($("experienceDialog")) {
          $("experienceDialog").close();
        }

        if (type) addBlock(type);
      });
    });

    document.querySelectorAll(".dialog-close").forEach((button) => {
      button.addEventListener("click", () => {
        const dialog = button.closest("dialog");
        if (dialog) dialog.close();
      });
    });

    bindClick("settingsButton", openSettings);
    bindClick("saveSettingsButton", saveSettings);
    bindClick("resetSettingsButton", resetSettings);

    bindMoodLibrary();

    bindClick("previewButton", openPreview);
    bindClick("previewChapterButton", openPreview);

    bindClick("closePreviewButton", () => {
      if ($("previewDialog")) {
        $("previewDialog").close();
      }
    });

    if ($("previewSize")) {
      $("previewSize").addEventListener("change", () => {
        const frame = $("previewFrame");
        if (!frame) return;

        frame.classList.remove(
          "phone-preview",
          "tablet-preview",
          "desktop-preview"
        );

        frame.classList.add(
          $("previewSize").value + "-preview"
        );
      });
    }

    bindClick("backToOverview", () => showPanel("overviewPanel"));

    bindClick("overviewStartWritingButton", () => {
      showPanel("writingPanel");
    });

    bindClick("undoButton", undo);
    bindClick("redoButton", redo);
    bindClick("writingUndoButton", undo);
    bindClick("writingRedoButton", redo);

    bindClick("clearSelectionButton", () => {
      finishHistoryGroup();

      state.selectedBlockId = "";

      renderManuscript();
      renderInspector();
      updateInspectorState();
    });

    bindClick("expandInspectorButton", toggleInspectorExpanded);
    bindClick("closeInspectorButton", closeInspector);
    bindClick("inspectorCloseButton", closeInspector);

    bindClick("openAssetTrayButton", openWritingAssetTray);
    bindClick("closeAssetTrayButton", closeWritingAssetTray);

    bindClick("collapseSidebarButton", toggleSidebar);
    bindClick("expandSidebarButton", toggleSidebar);

    bindClick("createAssetFolderButton", () => {
      if ($("assetFolderDialog")) {
        $("assetFolderDialog").showModal();
      }
    });

    bindClick("saveAssetFolderButton", addAssetFolder);

    bindClick("cancelAssetFolderButton", () => {
      if ($("assetFolderDialog")) {
        $("assetFolderDialog").close();
      }
    });

    if ($("newAssetFolderName")) {
      $("newAssetFolderName").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          addAssetFolder();
        }
      });
    }

    if ($("assetFolderFilter")) {
      $("assetFolderFilter").addEventListener(
        "change",
        renderAssetShelf
      );
    }

    if ($("manuscriptChapterTitle")) {
      $("manuscriptChapterTitle").addEventListener("input", () => {
        const chapter = currentChapter();
        if (!chapter) return;

        chapter.title = $("manuscriptChapterTitle").value;

        safeSet(
          "currentChapterLabel",
          chapter.title || "Untitled chapter"
        );

        recordHistory("typing");
        scheduleSave();
        renderChapterList();
      });

      $("manuscriptChapterTitle").addEventListener(
        "change",
        finishHistoryGroup
      );

      $("manuscriptChapterTitle").addEventListener(
        "blur",
        finishHistoryGroup
      );
    }

    [
      ["storyTitle", "title"],
      ["storyDescription", "description"],
      ["storyGenre", "genre"],
      ["storyStatus", "status"]
    ].forEach(([id, key]) => {
      const field = $(id);
      if (!field) return;

      field.addEventListener("input", () => {
        state.project[key] = field.value;

        if (key === "title") {
          safeSet(
            "previewStoryTitle",
            field.value || "Untitled story"
          );

          const slug = $("storySlug");

          if (slug && !slug.dataset.edited) {
            slug.value = slugify(field.value);
            state.project.slug = slugify(field.value);
          }
        }

        recordHistory("typing");
        updatePublishUrl();
        scheduleSave();
      });

      field.addEventListener("change", finishHistoryGroup);
      field.addEventListener("blur", finishHistoryGroup);
    });

    if ($("storySlug")) {
      $("storySlug").addEventListener("input", () => {
        $("storySlug").dataset.edited = "true";

        state.project.slug = slugify($("storySlug").value);

        recordHistory("typing");
        updatePublishUrl();
        scheduleSave();
      });

      $("storySlug").addEventListener("change", finishHistoryGroup);
      $("storySlug").addEventListener("blur", finishHistoryGroup);
    }

    bindClick("exportButton", exportProject);
    bindClick("publishingExportButton", exportProject);
    bindClick("exportPublishButton", exportReaderStory);

    bindClick("importButton", () => {
      if ($("importFile")) {
        $("importFile").click();
      }
    });

    if ($("importFile")) {
      $("importFile").addEventListener("change", () => {
        importProject($("importFile").files[0]);
        $("importFile").value = "";
      });
    }

    bindClick("chooseAssetsButton", () => {
      if ($("assetFileInput")) {
        $("assetFileInput").click();
      }
    });

    bindClick("dropChooseFilesButton", (event) => {
      if (event) event.stopPropagation();

      if ($("assetFileInput")) {
        $("assetFileInput").click();
      }
    });

    bindClick("chooseFolderButton", (event) => {
      if (event) event.stopPropagation();

      if ($("assetFolderInput")) {
        $("assetFolderInput").click();
      }
    });

    if ($("assetFileInput")) {
      $("assetFileInput").addEventListener("change", () => {
        addFiles($("assetFileInput").files);
        $("assetFileInput").value = "";
      });
    }

    if ($("assetFolderInput")) {
      $("assetFolderInput").addEventListener("change", () => {
        addFiles($("assetFolderInput").files);
        $("assetFolderInput").value = "";
      });
    }

    bindAssetDropZone();
    bindManuscriptAssetDrop();

    if ($("assetShelf")) {
      $("assetShelf").addEventListener("dragover", (event) => {
        if (
          Array.from(event.dataTransfer.types || []).includes("Files")
        ) {
          event.preventDefault();
        }
      });
    }

    if ($("fontSizeSetting")) {
      $("fontSizeSetting").addEventListener("input", () => {
        safeSet(
          "fontSizeValue",
          $("fontSizeSetting").value + "px"
        );
      });
    }

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey;

      if (!modifier || event.altKey) return;

      const target = event.target;

      const isTyping = target && (
        target.matches("input, textarea, select") ||
        target.isContentEditable
      );

      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        key === "y" ||
        (key === "z" && event.shiftKey)
      ) {
        event.preventDefault();
        redo();
      } else if (key === "s") {
        event.preventDefault();
        saveNow();
      } else if (key === "b" && !isTyping) {
        event.preventDefault();
        addBlock("paragraph");
      }
    });

    // Capture any pending typing before the user leaves the page.
    window.addEventListener("beforeunload", () => {
      finishHistoryGroup();

      if (state.saveTimer) {
        window.clearTimeout(state.saveTimer);
        state.saveTimer = null;
      }

      saveNow();
    });
  }

  /* =========================================================
     STARTUP
     ========================================================= */

  loadSettings();
  loadMoods();
  loadProject();

  bind();

  renderAll();
  renderMoodLibrary();

  showPanel("overviewPanel");

})();
