
(function () {
  "use strict";

  const PROJECT_KEY = "ceeqwinn_story_studio_next_v1";
  const DB_NAME = "ceeqwinn_story_studio_assets_v1";
  const DB_STORE = "files";
  const $ = id => document.getElementById(id);
  const uid = () => "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  let project = loadProject();
  let selectedBlockId = null;
  let selectedAssetId = null;
  let history = [];
  let historyIndex = -1;
  let db;
  let assetUrls = new Map();
  let dragBlockId = null;
  let dragAssetId = null;
  let saveTimer = null;

  function blankProject() {
    return {
      schemaVersion: 1,
      title: "Untitled Story",
      slug: "untitled-story",
      genre: "",
      status: "draft",
      description: "",
      currentChapterId: null,
      assets: [],
      chapters: [{ id: uid(), title: "Chapter 1", blocks: [] }]
    };
  }

  function loadProject() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROJECT_KEY));
      if (saved && Array.isArray(saved.chapters) && saved.chapters.length) {
        saved.assets ||= [];
        saved.chapters.forEach(c => c.blocks ||= []);
        saved.currentChapterId ||= saved.chapters[0].id;
        return saved;
      }
    } catch (e) {
      console.warn("Could not load the saved draft.", e);
    }
    const p = blankProject();
    p.currentChapterId = p.chapters[0].id;
    return p;
  }

  function currentChapter() {
    return project.chapters.find(c => c.id === project.currentChapterId) || project.chapters[0];
  }

  function currentBlock() {
    return currentChapter().blocks.find(b => b.id === selectedBlockId);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function recordHistory() {
    const snapshot = JSON.stringify(project);
    if (history[historyIndex] === snapshot) return;
    history = history.slice(0, historyIndex + 1);
    history.push(snapshot);
    if (history.length > 80) history.shift();
    historyIndex = history.length - 1;
    updateUndoButtons();
  }

  function updateUndoButtons() {
    $("undoButton").disabled = historyIndex <= 0;
    $("redoButton").disabled = historyIndex >= history.length - 1;
  }

  function restoreHistory(index) {
    if (index < 0 || index >= history.length) return;
    historyIndex = index;
    project = JSON.parse(history[index]);
    selectedBlockId = null;
    saveProject();
    renderAll();
    updateUndoButtons();
  }

  function dbReady() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("This browser does not support IndexedDB."));
        return;
      }
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(DB_STORE)) {
          database.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => { db = request.result; resolve(db); };
      request.onerror = () => reject(request.error);
    });
  }

  async function putFile(id, file) {
    const database = await dbReady();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({
        id, blob: file, name: file.name, type: file.type || "application/octet-stream",
        size: file.size, updated: Date.now()
      });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getFile(id) {
    const database = await dbReady();
    return new Promise((resolve, reject) => {
      const request = database.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function deleteFile(id) {
    try {
      const database = await dbReady();
      await new Promise((resolve, reject) => {
        const tx = database.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(id);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn("Could not remove the stored file.", e);
    }
    if (assetUrls.has(id)) URL.revokeObjectURL(assetUrls.get(id));
    assetUrls.delete(id);
  }

  async function urlFor(asset) {
    if (!asset) return null;
    if (assetUrls.has(asset.id)) return assetUrls.get(asset.id);
    if (asset.dataUrl) return asset.dataUrl;
    try {
      const record = await getFile(asset.id);
      if (!record || !record.blob) return null;
      const url = URL.createObjectURL(record.blob);
      assetUrls.set(asset.id, url);
      return url;
    } catch (e) {
      console.warn("Could not load asset", asset.name, e);
      return null;
    }
  }

  function saveProject() {
    clearTimeout(saveTimer);
    $("saveStatus").textContent = "Saving…";
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(PROJECT_KEY, JSON.stringify(project));
        $("saveStatus").textContent = "Draft saved in this browser";
      } catch (e) {
        $("saveStatus").textContent = "Save issue — export a backup";
        console.error(e);
      }
    }, 180);
  }

  function markChange() {
    recordHistory();
    saveProject();
    renderOverview();
    renderChapters();
    renderManuscript();
  }

  function addBlock(type, options = {}) {
    const chapter = currentChapter();
    const block = {
      id: uid(), type, text: "", speaker: "", reaction: "", heading: "",
      caption: "", url: "", options: [], assetId: null
    };
    if (type === "paragraph") block.text = "";
    if (type === "narration") block.text = "";
    if (type === "dialogue") { block.speaker = "CHARACTER"; block.text = ""; }
    if (type === "reveal") block.heading = "A revelation";
    if (type === "transition") block.text = "Later that day…";
    if (type === "choice") {
      block.text = "What happens next?";
      block.options = [{ label: "Choice A", result: "Result A" }, { label: "Choice B", result: "Result B" }];
    }
    if (type === "game") block.heading = "Interactive experience";
    if (type === "chapterEnd") block.text = "End of chapter";
    Object.assign(block, options);

    let index = chapter.blocks.length;
    const existingIndex = chapter.blocks.findIndex(b => b.id === selectedBlockId);
    if (existingIndex >= 0 && options.insertAfterSelected) index = existingIndex + 1;
    delete block.insertAfterSelected;
    chapter.blocks.splice(index, 0, block);
    selectedBlockId = block.id;
    markChange();
    renderInspector();
    $("experienceDialog").close?.();
    return block;
  }

  function addChapter() {
    const chapter = { id: uid(), title: "Chapter " + (project.chapters.length + 1), blocks: [] };
    project.chapters.push(chapter);
    project.currentChapterId = chapter.id;
    selectedBlockId = null;
    markChange();
    renderInspector();
    showPage("writing");
  }

  function switchChapter(id) {
    project.currentChapterId = id;
    selectedBlockId = null;
    saveProject();
    renderAll();
  }

  function renameChapter() {
    const chapter = currentChapter();
    const name = prompt("Chapter title:", chapter.title);
    if (name === null) return;
    chapter.title = name.trim() || "Untitled chapter";
    markChange();
  }

  function deleteChapter() {
    if (project.chapters.length <= 1) {
      alert("A story needs at least one chapter.");
      return;
    }
    if (!confirm("Delete this chapter and its story elements?")) return;
    project.chapters = project.chapters.filter(c => c.id !== project.currentChapterId);
    project.currentChapterId = project.chapters[0].id;
    selectedBlockId = null;
    markChange();
    renderInspector();
  }

  function showPage(name) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    $(name).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (name === "writing") renderAll();
    if (name === "overview") renderOverview();
  }

  function renderOverview() {
    $("storyTitle").value = project.title || "";
    $("storySlug").value = project.slug || "";
    $("storyGenre").value = project.genre || "";
    $("storyStatus").value = project.status || "draft";
    $("storyDescription").value = project.description || "";
    $("chapterCount").textContent = project.chapters.length;
    $("blockCount").textContent = project.chapters.reduce((n, c) => n + c.blocks.length, 0);
    $("wordCount").textContent = project.chapters.reduce((n, c) =>
      n + c.blocks.reduce((m, b) => m + ((b.text || "").trim().match(/\S+/g) || []).length, 0), 0);
    $("assetCount").textContent = project.assets.length;

    const host = $("overviewChapterList");
    host.replaceChildren();
    project.chapters.forEach((chapter, i) => {
      const card = document.createElement("article");
      card.className = "chapter-card";
      const title = document.createElement("h3");
      title.textContent = chapter.title || "Untitled chapter";
      const info = document.createElement("p");
      info.textContent = chapter.blocks.length + " story elements";
      const button = document.createElement("button");
      button.className = "button secondary";
      button.textContent = "Open chapter →";
      button.addEventListener("click", () => {
        switchChapter(chapter.id);
        showPage("writing");
      });
      card.append(title, info, button);
      host.appendChild(card);
    });
  }

  function renderChapters() {
    const host = $("chapterList");
    host.replaceChildren();
    project.chapters.forEach(chapter => {
      const button = document.createElement("button");
      button.className = "chapter-item" + (chapter.id === project.currentChapterId ? " active" : "");
      button.textContent = chapter.title || "Untitled chapter";
      button.addEventListener("click", () => switchChapter(chapter.id));
      host.appendChild(button);
    });
    $("currentChapterLabel").textContent = currentChapter().title || "Untitled chapter";
    $("manuscriptChapterTitle").value = currentChapter().title || "";
  }

  function blockLabel(type) {
    return window.CeeqwinnTheatre.TYPES[type] || type;
  }

  function makeButton(text, title, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.title = title;
    button.addEventListener("click", callback);
    return button;
  }

  function moveBlock(id, direction) {
    const blocks = currentChapter().blocks;
    const i = blocks.findIndex(b => b.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    selectedBlockId = id;
    markChange();
    renderInspector();
  }

  function duplicateBlock(id) {
    const blocks = currentChapter().blocks;
    const i = blocks.findIndex(b => b.id === id);
    if (i < 0) return;
    const copy = clone(blocks[i]);
    copy.id = uid();
    blocks.splice(i + 1, 0, copy);
    selectedBlockId = copy.id;
    markChange();
    renderInspector();
  }

  function deleteBlock(id) {
    if (!confirm("Delete this story element?")) return;
    currentChapter().blocks = currentChapter().blocks.filter(b => b.id !== id);
    if (selectedBlockId === id) selectedBlockId = null;
    markChange();
    renderInspector();
  }

  function insertAsset(assetId) {
    const asset = project.assets.find(a => a.id === assetId);
    if (!asset) return;
    if (asset.kind === "reference") {
      addBlock("reference", { text: asset.name, assetId });
      return;
    }
    const type = asset.kind === "video" ? "video" :
      asset.kind === "audio" ? "audio" : "image";
    addBlock(type, { assetId, caption: "" });
  }

  function renderManuscript() {
    const host = $("manuscript");
    host.replaceChildren();
    const chapter = currentChapter();
    $("elementCount").textContent = chapter.blocks.length + " elements";

    if (!chapter.blocks.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = "Your story begins here.<br>Choose <b>＋ Add anything</b> or <b>＋ Paragraph</b>.";
      host.appendChild(empty);
    }

    chapter.blocks.forEach(block => {
      const card = document.createElement("article");
      card.className = "story-block" + (block.id === selectedBlockId ? " selected" : "");
      card.dataset.blockId = block.id;
      card.draggable = true;

      const top = document.createElement("div");
      top.className = "block-top";
      const handle = document.createElement("span");
      handle.className = "drag-handle";
      handle.textContent = "⠿";
      handle.title = "Drag to reorder";
      const label = document.createElement("span");
      label.className = "block-type";
      label.textContent = blockLabel(block.type);
      const actions = document.createElement("div");
      actions.className = "block-actions";
      actions.append(
        makeButton("＋", "Insert after this element", () => {
          selectedBlockId = block.id;
          $("experienceDialog").showModal();
        }),
        makeButton("⧉", "Duplicate", () => duplicateBlock(block.id)),
        makeButton("↑", "Move up", () => moveBlock(block.id, -1)),
        makeButton("↓", "Move down", () => moveBlock(block.id, 1)),
        makeButton("×", "Delete", () => deleteBlock(block.id))
      );
      top.append(handle, label, actions);
      card.appendChild(top);

      if (["paragraph", "narration", "dialogue", "reveal", "transition", "choice", "game", "chapterEnd", "reference"].includes(block.type)) {
        const text = document.createElement("textarea");
        text.className = "block-text";
        text.value = block.text || "";
        text.placeholder = block.type === "paragraph" ? "Write your story here…" : "Write the content for this experience…";
        text.rows = 3;
        text.addEventListener("focus", () => selectBlock(block.id));
        text.addEventListener("input", () => {
          block.text = text.value;
          saveProject();
          renderOverview();
          renderInspector(false);
        });
        card.appendChild(text);
        if (block.type === "dialogue") {
          const speaker = document.createElement("input");
          speaker.placeholder = "Character name";
          speaker.value = block.speaker || "";
          speaker.addEventListener("focus", () => selectBlock(block.id));
          speaker.addEventListener("input", () => { block.speaker = speaker.value; saveProject(); renderInspector(false); });
          card.insertBefore(speaker, text);
        }
        if (block.type === "reveal" || block.type === "game") {
          const heading = document.createElement("input");
          heading.placeholder = "Experience heading";
          heading.value = block.heading || "";
          heading.addEventListener("focus", () => selectBlock(block.id));
          heading.addEventListener("input", () => { block.heading = heading.value; saveProject(); renderInspector(false); });
          card.insertBefore(heading, text);
        }
        if (block.type === "game") {
          const url = document.createElement("input");
          url.type = "url";
          url.placeholder = "Game URL (optional)";
          url.value = block.url || "";
          url.addEventListener("focus", () => selectBlock(block.id));
          url.addEventListener("input", () => { block.url = url.value; saveProject(); renderInspector(false); });
          card.appendChild(url);
        }
        if (block.type === "choice") {
          (block.options || []).forEach((option, index) => {
            const row = document.createElement("div");
            row.className = "choice-edit-row";
            const labelInput = document.createElement("input");
            labelInput.placeholder = "Choice label";
            labelInput.value = option.label || "";
            labelInput.addEventListener("input", () => { option.label = labelInput.value; saveProject(); });
            const resultInput = document.createElement("input");
            resultInput.placeholder = "Preview result";
            resultInput.value = option.result || "";
            resultInput.addEventListener("input", () => { option.result = resultInput.value; saveProject(); });
            row.append(labelInput, resultInput);
            card.appendChild(row);
          });
          card.appendChild(makeButton("＋ Add choice", "Add another choice", () => {
            block.options ||= [];
            block.options.push({ label: "New choice", result: "" });
            markChange();
          }));
        }
      }

      if (["image", "video", "audio"].includes(block.type)) {
        const asset = project.assets.find(a => a.id === block.assetId);
        const preview = document.createElement("div");
        preview.className = "block-media-preview";
        if (!asset) {
          preview.textContent = "No asset selected. Choose one from the shelf.";
        } else if (block.type === "image") {
          const img = document.createElement("img");
          img.alt = asset.name;
          img.src = assetUrls.get(asset.id) || "";
          preview.appendChild(img);
          if (!img.src) urlFor(asset).then(url => { if (url && img.isConnected) img.src = url; });
        } else if (block.type === "video") {
          const video = document.createElement("video");
          video.controls = true;
          video.src = assetUrls.get(asset.id) || "";
          preview.appendChild(video);
          if (!video.src) urlFor(asset).then(url => { if (url && video.isConnected) video.src = url; });
        } else {
          const audio = document.createElement("audio");
          audio.controls = true;
          audio.src = assetUrls.get(asset.id) || "";
          preview.appendChild(audio);
          if (!audio.src) urlFor(asset).then(url => { if (url && audio.isConnected) audio.src = url; });
        }
        card.appendChild(preview);
        const caption = document.createElement("input");
        caption.className = "inline-caption";
        caption.placeholder = "Caption (optional)";
        caption.value = block.caption || "";
        caption.addEventListener("focus", () => selectBlock(block.id));
        caption.addEventListener("input", () => { block.caption = caption.value; saveProject(); });
        card.appendChild(caption);
        card.appendChild(makeButton("Change media", "Choose another asset", () => {
          selectedBlockId = block.id;
          $("assetFileInput").click();
        }));
      }

      card.addEventListener("click", event => {
        if (event.target.closest("button") || event.target.matches("textarea,input")) return;
        selectBlock(block.id);
      });
      card.addEventListener("dragstart", event => {
        if (event.target.closest("button,input,textarea")) { event.preventDefault(); return; }
        dragBlockId = block.id;
        event.dataTransfer.setData("text/ceeqwinn-block", block.id);
        event.dataTransfer.effectAllowed = "move";
        setTimeout(() => card.classList.add("dragging"), 0);
      });
      card.addEventListener("dragend", () => {
        dragBlockId = null;
        document.querySelectorAll(".story-block").forEach(n => n.classList.remove("dragging", "drop-before"));
      });
      card.addEventListener("dragover", event => {
        if (!dragBlockId || dragBlockId === block.id) return;
        event.preventDefault();
        card.classList.add("drop-before");
      });
      card.addEventListener("dragleave", () => card.classList.remove("drop-before"));
      card.addEventListener("drop", event => {
        event.preventDefault();
        card.classList.remove("drop-before");
        const assetId = event.dataTransfer.getData("text/ceeqwinn-asset");
        if (assetId) { insertAsset(assetId); return; }
        const fromId = event.dataTransfer.getData("text/ceeqwinn-block") || dragBlockId;
        if (!fromId || fromId === block.id) return;
        const blocks = currentChapter().blocks;
        const from = blocks.findIndex(b => b.id === fromId);
        const to = blocks.findIndex(b => b.id === block.id);
        if (from < 0 || to < 0) return;
        const [moving] = blocks.splice(from, 1);
        blocks.splice(to, 0, moving);
        selectedBlockId = moving.id;
        markChange();
        renderInspector();
      });
      host.appendChild(card);
    });

    host.ondragover = event => {
      if (event.dataTransfer.types.includes("Files") || event.dataTransfer.types.includes("text/ceeqwinn-asset")) {
        event.preventDefault();
      }
    };
    host.ondrop = event => {
      if (event.target.closest(".story-block")) return;
      const assetId = event.dataTransfer.getData("text/ceeqwinn-asset");
      if (assetId) { event.preventDefault(); insertAsset(assetId); }
      else if (event.dataTransfer.files.length) { event.preventDefault(); importFiles(event.dataTransfer.files); }
    };
  }

  function selectBlock(id) {
    selectedBlockId = id;
    document.querySelectorAll(".story-block").forEach(node =>
      node.classList.toggle("selected", node.dataset.blockId === id));
    renderInspector(false);
  }

  function renderInspector(refresh = true) {
    const host = $("inspectorContent");
    if (refresh) host.replaceChildren();
    else host.replaceChildren();
    const block = currentBlock();
    if (!block) {
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = "Select a paragraph, image, or experience to edit it here.";
      host.appendChild(note);
      return;
    }
    const title = document.createElement("p");
    title.className = "eyebrow";
    title.textContent = blockLabel(block.type);
    host.appendChild(title);

    function field(labelText, key, multiline = false) {
      const label = document.createElement("label");
      label.textContent = labelText;
      const input = document.createElement(multiline ? "textarea" : "input");
      input.value = block[key] || "";
      input.addEventListener("input", () => {
        block[key] = input.value;
        saveProject();
        if (key === "text" || key === "caption") renderOverview();
      });
      label.appendChild(input);
      host.appendChild(label);
    }

    if (["paragraph", "narration", "dialogue", "reveal", "transition", "choice", "game", "chapterEnd"].includes(block.type)) {
      field("Text / content", "text", true);
    }
    if (block.type === "dialogue") field("Speaker", "speaker");
    if (block.type === "reveal" || block.type === "game") field("Heading", "heading");
    if (block.type === "game") field("Game URL", "url");
    if (["image", "video", "audio"].includes(block.type)) {
      const asset = project.assets.find(a => a.id === block.assetId);
      if (asset && asset.kind === "image") {
        const img = document.createElement("img");
        img.className = "inspector-preview";
        img.alt = asset.name;
        host.appendChild(img);
        urlFor(asset).then(url => { if (url && img.isConnected) img.src = url; });
      }
      field("Caption", "caption");
      const pick = makeButton("Choose from asset shelf", "Select a saved media file", () => {
        $("assetPanel").classList.remove("collapsed");
        $("assetPanel").scrollIntoView({ behavior: "smooth", block: "center" });
      });
      host.appendChild(pick);
    }
    host.appendChild(makeButton("Duplicate element", "Create a copy", () => duplicateBlock(block.id)));
    host.appendChild(makeButton("Delete element", "Remove this element", () => deleteBlock(block.id)));
  }

  function renderAll() {
    renderOverview();
    renderChapters();
    renderManuscript();
    renderInspector();
    renderAssets();
  }

  function fileKind(file) {
    const name = file.name.toLowerCase();
    if (file.type.startsWith("image/") || /\.(gif|avif|webp|png|jpe?g|svg)$/.test(name)) return "image";
    if (file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/.test(name)) return "video";
    if (file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/.test(name)) return "audio";
    return "reference";
  }

  async function importFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(file.name + " is larger than 100 MB and was skipped.");
        continue;
      }
      const asset = {
        id: uid(), name: file.name, kind: fileKind(file),
        mime: file.type || "application/octet-stream", size: file.size,
        lastModified: file.lastModified || Date.now()
      };
      try {
        await putFile(asset.id, file);
        project.assets.push(asset);
        if (asset.kind !== "reference" && !selectedBlockId && ["image", "video", "audio"].includes(asset.kind)) {
          // Keep imported media in the shelf; don't insert it without user consent.
        }
      } catch (error) {
        console.error(error);
        alert("Could not save " + file.name + ". Your browser may be out of storage space.");
      }
    }
    saveProject();
    renderAssets();
    renderOverview();
    if (selectedBlockId) renderInspector();
    $("saveStatus").textContent = "Assets saved in this browser";
  }

  function renderAssets() {
    const hosts = [$("assetShelf"), $("assetShelfDrawer")].filter(Boolean);
    hosts.forEach(host => {
      host.replaceChildren();
      project.assets.forEach(asset => {
        const card = document.createElement("div");
        card.className = "asset-card";
        card.draggable = asset.kind !== "reference";
        card.dataset.assetId = asset.id;
        if (asset.kind === "image") {
          const img = document.createElement("img");
          img.alt = asset.name;
          img.loading = "lazy";
          card.appendChild(img);
          urlFor(asset).then(url => { if (url && img.isConnected) img.src = url; });
        } else {
          const placeholder = document.createElement("div");
          placeholder.className = "asset-placeholder";
          placeholder.textContent = asset.kind === "video" ? "▷" : asset.kind === "audio" ? "♫" : "▤";
          card.appendChild(placeholder);
        }
        const name = document.createElement("span");
        name.className = "asset-name";
        name.textContent = asset.name;
        card.appendChild(name);

        if (asset.kind !== "reference") {
          card.appendChild(makeButton("Insert", "Insert this asset into the story", () => insertAsset(asset.id)));
        } else {
          card.appendChild(makeButton("Open", "Open reference file", () => openAsset(asset)));
        }
        card.appendChild(makeButton("Remove", "Remove from shelf", async () => {
          if (!confirm("Remove this asset from the shelf? Story elements using it may no longer display.")) return;
          project.assets = project.assets.filter(a => a.id !== asset.id);
          await deleteFile(asset.id);
          markChange();
          renderAssets();
        }));
        card.addEventListener("dragstart", event => {
          dragAssetId = asset.id;
          event.dataTransfer.setData("text/ceeqwinn-asset", asset.id);
          event.dataTransfer.effectAllowed = "copy";
        });
        host.appendChild(card);
      });
    });
  }

  async function openAsset(asset) {
    const url = await urlFor(asset);
    if (!url) { alert("This file is unavailable. It may have been removed by the browser."); return; }
    window.open(url, "_blank", "noopener");
  }

  async function fileToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function exportBackup() {
    const out = clone(project);
    out.exportedAt = new Date().toISOString();
    out.assets = [];
    for (const meta of project.assets) {
      const record = await getFile(meta.id);
      if (!record || !record.blob) {
        alert("Asset missing from browser storage: " + meta.name + ". The backup may be incomplete.");
        continue;
      }
      out.assets.push({ ...meta, dataUrl: await fileToDataURL(record.blob) });
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    downloadBlob(blob, (project.slug || "ceeqwinn-story") + "-backup.json");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importBackup(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.chapters) || !data.chapters.length) throw new Error("This file doesn't contain a valid story project.");
      if (!confirm("Import this backup and replace the draft currently open in this Studio? Export your current draft first if you need to keep it.")) return;
      const newAssets = [];
      for (const asset of (data.assets || [])) {
        if (!asset.dataUrl) continue;
        const response = await fetch(asset.dataUrl);
        const blob = await response.blob();
        const meta = { ...asset };
        delete meta.dataUrl;
        await putFile(meta.id, new File([blob], meta.name, { type: meta.mime || blob.type }));
        newAssets.push(meta);
      }
      data.assets = newAssets;
      delete data.exportedAt;
      project = data;
      project.currentChapterId ||= project.chapters[0].id;
      selectedBlockId = null;
      recordHistory();
      saveProject();
      renderAll();
      showPage("overview");
    } catch (error) {
      alert("Import failed: " + error.message);
    }
  }

  function preview() {
    $("previewStoryTitle").textContent = project.title || "Your story";
    const chapter = currentChapter();
    const assets = new Map();
    Promise.all(project.assets.map(async asset => {
      assets.set(asset.id, { ...asset, url: await urlFor(asset) });
    })).then(() => {
      window.CeeqwinnTheatre.render(project, chapter, assets, $("theatrePreview"));
      $("previewDialog").showModal();
    });
  }

  function bindProjectField(id, key, slugify = false) {
    $(id).addEventListener("input", () => {
      project[key] = $(id).value;
      if (slugify) {
        project.slug = $(id).value.toLowerCase().trim()
          .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        $("storySlug").value = project.slug;
      }
      saveProject();
      renderOverview();
    });
    $(id).addEventListener("change", () => {
      project[key] = $(id).value;
      recordHistory();
      saveProject();
    });
  }

  bindProjectField("storyTitle", "title");
  bindProjectField("storySlug", "slug");
  bindProjectField("storyGenre", "genre");
  bindProjectField("storyStatus", "status");
  bindProjectField("storyDescription", "description");

  $("startWritingButton").addEventListener("click", () => showPage("writing"));
  $("backToOverview").addEventListener("click", () => showPage("overview"));
  $("addChapterButton").addEventListener("click", addChapter);
  $("overviewAddChapter").addEventListener("click", addChapter);
  $("renameChapterButton").addEventListener("click", renameChapter);
  $("deleteChapterButton").addEventListener("click", deleteChapter);
  $("manuscriptChapterTitle").addEventListener("input", () => {
    currentChapter().title = $("manuscriptChapterTitle").value;
    $("currentChapterLabel").textContent = currentChapter().title;
    saveProject();
    renderChapters();
    renderOverview();
  });
  $("manuscriptChapterTitle").addEventListener("change", recordHistory);

  $("addAnythingButton").addEventListener("click", () => $("experienceDialog").showModal());
  $("bottomAddAnything").addEventListener("click", () => $("experienceDialog").showModal());
  $("addParagraphButton").addEventListener("click", () => addBlock("paragraph"));
  $("bottomAddParagraph").addEventListener("click", () => addBlock("paragraph"));
  $("addImageButton").addEventListener("click", () => {
    $("assetFileInput").accept = "image/*";
    $("assetFileInput").click();
  });
  $("addVideoButton").addEventListener("click", () => {
    $("assetFileInput").accept = "video/*";
    $("assetFileInput").click();
  });
  $("addReferenceButton").addEventListener("click", () => {
    $("assetFileInput").accept = ".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ppt,.pptx";
    $("assetFileInput").click();
  });
  $("chooseAssetsButton").addEventListener("click", () => {
    $("assetFileInput").accept = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ppt,.pptx";
    $("assetFileInput").click();
  });
  $("assetFileInput").addEventListener("change", async event => {
    const files = Array.from(event.target.files || []);
    await importFiles(files);
    const media = files.find(file => ["image", "video", "audio"].includes(fileKind(file)));
    if (selectedBlockId && media) {
      const asset = project.assets.find(a => a.name === media.name && a.size === media.size);
      const block = currentBlock();
      if (asset && block && ["image", "video", "audio"].includes(block.type)) {
        block.assetId = asset.id;
        block.type = asset.kind;
        markChange();
      }
    }
    event.target.value = "";
  });

  $("assetFolderInput").addEventListener("change", event => {
    importFiles(event.target.files);
    event.target.value = "";
  });
  $("assetDropZone").addEventListener("click", () => $("assetFileInput").click());
  ["dragenter", "dragover"].forEach(type => $("assetDropZone").addEventListener(type, event => {
    event.preventDefault();
    $("assetDropZone").classList.add("drag-over");
  }));
  ["dragleave", "drop"].forEach(type => $("assetDropZone").addEventListener(type, event => {
    event.preventDefault();
    $("assetDropZone").classList.remove("drag-over");
  }));
  $("assetDropZone").addEventListener("drop", event => {
    if (event.dataTransfer.files.length) importFiles(event.dataTransfer.files);
  });

  $("toggleAssetsButton").addEventListener("click", () => {
    $("assetDrawer").classList.toggle("hidden");
    if (!$("assetDrawer").classList.contains("hidden")) $("assetDrawer").scrollIntoView({ behavior: "smooth" });
  });
  $("collapseAssetsButton").addEventListener("click", () => $("assetPanel").classList.add("collapsed"));
  $("closeAssetDrawer").addEventListener("click", () => $("assetDrawer").classList.add("hidden"));

  document.querySelectorAll(".experience-option").forEach(button => {
    button.addEventListener("click", () => addBlock(button.dataset.type, { insertAfterSelected: true }));
  });
  document.querySelectorAll(".dialog-close").forEach(button => {
    button.addEventListener("click", () => $(button.dataset.close).close());
  });
  $("previewButton").addEventListener("click", preview);
  $("closePreviewButton").addEventListener("click", () => $("previewDialog").close());
  $("previewSize").addEventListener("change", () => {
    $("previewFrame").className = "preview-frame " + $("previewSize").value + "-preview";
  });
  $("exportButton").addEventListener("click", exportBackup);
  $("importButton").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", event => {
    if (event.target.files[0]) importBackup(event.target.files[0]);
    event.target.value = "";
  });
  $("undoButton").addEventListener("click", () => restoreHistory(historyIndex - 1));
  $("redoButton").addEventListener("click", () => restoreHistory(historyIndex + 1));

  // Keep the drop zone usable with files from the computer.
  document.addEventListener("dragover", event => {
    if (event.dataTransfer && Array.from(event.dataTransfer.types).includes("Files")) event.preventDefault();
  });

  recordHistory();
  renderAll();
})();
