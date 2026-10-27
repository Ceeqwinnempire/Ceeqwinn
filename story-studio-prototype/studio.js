(function () {
  "use strict";

  var STORAGE_KEY = "ceeqwinn_story_studio_prototype_v1";
  var activeStoryId = null;
  var activeChapterId = null;
  var activeSceneId = null;
  var toastTimer = null;
  var project = null;
  var theatre = null;

  var $ = function (id) { return document.getElementById(id); };
  var makeId = function (prefix) {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  };
  var clone = function (value) { return JSON.parse(JSON.stringify(value)); };

  function starterProject() {
    return {
      schemaVersion: 1,
      id: "emerald-inheritance-demo",
      title: "The Emerald Inheritance",
      description: "A family legacy, a new arrival, and secrets that refuse to stay quiet.",
      genre: "Fashion drama · Mystery",
      status: "draft",
      release: { status: "draft", date: "" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: [
        {
          id: "chapter-arrival",
          title: "Chapter 1 — The Arrival",
          status: "draft",
          nextChapterId: "chapter-discordant",
          scenes: [
            { id: "scene-open", type: "narration", title: "A house full of history", text: "The Okoye estate looked peaceful from the road. Inside, every polished surface seemed to be keeping a secret.", background: "", color: "#263c2c", audio: "", autoPlayAudio: false, choices: [] },
            { id: "scene-lexis", type: "dialogue", title: "A very deliberate entrance", character: "Lexis Azunna", characterImage: "", text: "If this family wanted a quiet arrival, they should have invited somebody else.", background: "", color: "#49312b", audio: "", autoPlayAudio: false, choices: [] },
            { id: "scene-reveal", type: "revelation", title: "The emerald seal", text: "On the table lay an emerald signet bearing the family crest — and a name that should never have appeared there.", background: "", color: "#153d30", audio: "", autoPlayAudio: false, choices: [] },
            { id: "scene-choice", type: "choice", title: "What should Lexis do?", text: "The room has gone silent. Every eye is on the seal.", background: "", color: "#2a3426", audio: "", autoPlayAudio: false, choices: [
              { id: "choice-inspect", label: "Inspect the seal", targetSceneId: "scene-inspect" },
              { id: "choice-question", label: "Ask who brought it", targetSceneId: "scene-question" }
            ]},
            { id: "scene-inspect", type: "narration", title: "A closer look", text: "The crest has been altered. Someone wanted the family to notice — but not understand.", background: "", color: "#273c2c", audio: "", autoPlayAudio: false, nextSceneId: "scene-end", choices: [] },
            { id: "scene-question", type: "dialogue", title: "Nobody answers quickly", character: "Lexis Azunna", characterImage: "", text: "Interesting. Everyone has an opinion until somebody asks a direct question.", background: "", color: "#49312b", audio: "", autoPlayAudio: false, nextSceneId: "scene-end", choices: [] },
            { id: "scene-end", type: "chapterEnd", title: "The story continues", text: "End of the sample chapter.", background: "", color: "#263c2c", audio: "", autoPlayAudio: false, choices: [] }
          ]
        },
        {
          id: "chapter-discordant",
          title: "Chapter 2 — Discordant Descendants",
          status: "draft",
          nextChapterId: "",
          scenes: [
            { id: "scene-c2-open", type: "narration", title: "The morning after", text: "By breakfast, the entire house had developed a different version of last night's events.", background: "", color: "#2c3b2b", audio: "", autoPlayAudio: false, choices: [] },
            { id: "scene-c2-game", type: "game", title: "A challenge appears", text: "A character invites you to play a quick fashion challenge.", gameId: "FASHION-01", background: "", color: "#3d2e43", audio: "", autoPlayAudio: false, choices: [] },
            { id: "scene-c2-end", type: "chapterEnd", title: "To be continued", text: "", background: "", color: "#263c2c", audio: "", autoPlayAudio: false, choices: [] }
          ]
        }
      ]
    };
  }

  function notify(message) {
    var toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2400);
  }

  function setSaveStatus(message) {
    $("saveStatus").textContent = message;
  }

  function saveProject(silent) {
    if (!project) return;
    project.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      setSaveStatus("Saved locally");
      if (!silent) notify("Project saved in this browser.");
    } catch (error) {
      setSaveStatus("Save failed");
      notify("Browser storage is full. Export a backup and remove large embedded media.");
    }
  }

  function loadProject() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.chapters)) return parsed;
      }
    } catch (error) {}
    return starterProject();
  }

  function currentChapter() {
    return (project.chapters || []).find(function (chapter) { return chapter.id === activeChapterId; }) || null;
  }

  function currentScene() {
    var chapter = currentChapter();
    return chapter && chapter.scenes.find(function (scene) { return scene.id === activeSceneId; }) || null;
  }

  function renderStorySelect() {
    var select = $("storySelect");
    select.replaceChildren();
    var option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.title || "Untitled story";
    select.appendChild(option);
  }

  function renderChapters() {
    var list = $("chapterList");
    list.replaceChildren();
    $("chapterCount").textContent = project.chapters.length;
    project.chapters.forEach(function (chapter, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chapter-item" + (chapter.id === activeChapterId ? " selected" : "");
      var title = document.createElement("strong");
      title.textContent = chapter.title || "Untitled chapter";
      var meta = document.createElement("small");
      meta.textContent = chapter.scenes.length + " scenes · " + (chapter.status || "draft");
      button.append(title, meta);
      button.addEventListener("click", function () {
        activeChapterId = chapter.id;
        activeSceneId = chapter.scenes[0] ? chapter.scenes[0].id : null;
        renderAll();
      });
      list.appendChild(button);
    });
  }

  function renderScenes() {
    var chapter = currentChapter();
    var list = $("sceneList");
    list.replaceChildren();
    $("activeChapterHeading").textContent = chapter ? chapter.title : "Choose a chapter";
    $("addSceneBtn").disabled = !chapter;
    if (!chapter) return;
    chapter.scenes.forEach(function (scene, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "scene-item" + (scene.id === activeSceneId ? " selected" : "");
      var number = document.createElement("span");
      number.className = "scene-number";
      number.textContent = String(index + 1).padStart(2, "0");
      var copy = document.createElement("span");
      copy.className = "scene-item-copy";
      var title = document.createElement("strong");
      title.textContent = scene.title || labelType(scene.type);
      var meta = document.createElement("small");
      meta.textContent = labelType(scene.type);
      copy.append(title, meta);
      button.append(number, copy);
      button.addEventListener("click", function () {
        activeSceneId = scene.id;
        renderScenes();
        renderSceneEditor();
      });
      list.appendChild(button);
    });
  }

  function labelType(type) {
    return ({ narration: "Narration", dialogue: "Dialogue", revelation: "Revelation", choice: "Player choice", game: "Game placement", chapterEnd: "Chapter ending" })[type] || "Scene";
  }

  function field(label, name, value, options) {
    options = options || {};
    var wrap = document.createElement("div");
    if (options.span) wrap.className = "span-two";
    var labelEl = document.createElement("label");
    labelEl.className = "field-label";
    labelEl.htmlFor = "field_" + name;
    labelEl.textContent = label;
    var control;
    if (options.select) {
      control = document.createElement("select");
      options.select.forEach(function (item) {
        var opt = document.createElement("option");
        opt.value = item.value; opt.textContent = item.label;
        control.appendChild(opt);
      });
      control.value = value || options.select[0].value;
    } else if (options.textarea) {
      control = document.createElement("textarea");
      control.rows = options.rows || 4;
      control.value = value || "";
    } else {
      control = document.createElement("input");
      control.type = options.type || "text";
      control.value = value || "";
    }
    control.className = "control";
    control.id = "field_" + name;
    if (options.placeholder) control.placeholder = options.placeholder;
    if (options.help) {
      var help = document.createElement("p"); help.className = "small-help"; help.textContent = options.help;
      wrap.append(labelEl, control, help);
    } else wrap.append(labelEl, control);
    return { wrap: wrap, control: control };
  }

  function renderSceneEditor() {
    var host = $("sceneEditor");
    host.replaceChildren();
    var chapter = currentChapter();
    var scene = currentScene();
    if (!chapter || !scene) {
      host.className = "scene-editor empty-state";
      host.innerHTML = '<span class="empty-icon">✦</span><h2>Choose a scene to edit</h2><p>Add a scene, then select it to edit its text, visuals, sound, and behaviour.</p>';
      return;
    }
    host.className = "scene-editor";
    var heading = document.createElement("h2");
    heading.textContent = "Edit scene";
    host.appendChild(heading);
    var grid = document.createElement("div");
    grid.className = "editor-form-grid";

    var typeField = field("Scene type", "type", scene.type, { select: [
      { value: "narration", label: "Narration" }, { value: "dialogue", label: "Dialogue" },
      { value: "revelation", label: "Revelation" }, { value: "choice", label: "Player choice" },
      { value: "game", label: "Game placement" }, { value: "chapterEnd", label: "Chapter ending" }
    ]});
    var titleField = field("Scene title", "title", scene.title, { placeholder: "Scene title" });
    var textField = field("Text / dialogue", "text", scene.text, { textarea: true, rows: 5, span: true, placeholder: "Write what the reader sees or hears..." });
    var characterField = field("Character / speaker", "character", scene.character, { placeholder: "Optional character name" });
    var portraitField = field("Character portrait URL", "characterImage", scene.characterImage, { placeholder: "https://... (optional)" });
    var backgroundField = field("Background image URL", "background", scene.background, { placeholder: "https://... (optional)" });
    var colorField = field("Fallback background colour", "color", scene.color || "#263c2c", { type: "color" });
    var audioField = field("Audio URL", "audio", scene.audio, { placeholder: "https://... (optional)", help: "Use a direct audio-file URL. Browser autoplay may be blocked; controls will remain available." });
    var gameField = field("Game ID", "gameId", scene.gameId, { placeholder: "e.g. FASHION-01" });
    [typeField, titleField, textField, characterField, portraitField, backgroundField, colorField, audioField, gameField].forEach(function (item) { grid.appendChild(item.wrap); });
    host.appendChild(grid);

    var choicesArea = document.createElement("div");
    choicesArea.className = "span-two";
    var choicesLabel = document.createElement("label");
    choicesLabel.className = "field-label";
    choicesLabel.textContent = "Choice options (one per line: Button label | Target scene title)";
    var choicesText = document.createElement("textarea");
    choicesText.className = "control";
    choicesText.rows = 4;
    choicesText.placeholder = "Inspect the seal | A closer look\nAsk who brought it | Nobody answers";
    choicesText.value = (scene.choices || []).map(function (choice) {
      var target = chapter.scenes.find(function (candidate) { return candidate.id === choice.targetSceneId; });
      return (choice.label || "") + " | " + (target ? target.title : "");
    }).join("\n");
    choicesArea.append(choicesLabel, choicesText);
    host.appendChild(choicesArea);
    var choiceHelp = document.createElement("p");
    choiceHelp.className = "small-help";
    choiceHelp.textContent = "Choice targets must match another scene title in this chapter. Leave the target blank to continue to the next scene.";
    host.appendChild(choiceHelp);

    var actions = document.createElement("div");
    actions.className = "form-actions";
    var up = makeButton("Move up", "button button-outline button-small", function () { moveScene(-1); });
    var down = makeButton("Move down", "button button-outline button-small", function () { moveScene(1); });
    var deleteButton = makeButton("Delete scene", "button button-outline button-small", deleteScene);
    deleteButton.style.color = "var(--danger)";
    var apply = makeButton("Apply scene changes", "button button-primary", function () {
      scene.type = typeField.control.value;
      scene.title = titleField.control.value.trim();
      scene.text = textField.control.value;
      scene.character = characterField.control.value.trim();
      scene.characterImage = portraitField.control.value.trim();
      scene.background = backgroundField.control.value.trim();
      scene.color = colorField.control.value;
      scene.audio = audioField.control.value.trim();
      scene.gameId = gameField.control.value.trim();
      if (scene.type === "choice") {
        scene.choices = choicesText.value.split("\n").map(function (line) {
          var parts = line.split("|");
          var label = (parts.shift() || "").trim();
          var targetTitle = parts.join("|").trim();
          var target = chapter.scenes.find(function (candidate) { return candidate.id !== scene.id && candidate.title.trim().toLowerCase() === targetTitle.toLowerCase(); });
          return { id: makeId("choice"), label: label, targetSceneId: target ? target.id : "" };
        }).filter(function (choice) { return choice.label; });
      } else {
        scene.choices = [];
      }
      saveProject(true);
      renderAll();
      notify("Scene updated.");
    });
    actions.append(up, down, deleteButton, apply);
    host.appendChild(actions);
  }

  function makeButton(text, className, handler) {
    var button = document.createElement("button");
    button.type = "button"; button.className = className; button.textContent = text;
    button.addEventListener("click", handler);
    return button;
  }

  function moveScene(direction) {
    var chapter = currentChapter();
    if (!chapter) return;
    var index = chapter.scenes.findIndex(function (scene) { return scene.id === activeSceneId; });
    var next = index + direction;
    if (index < 0 || next < 0 || next >= chapter.scenes.length) return;
    var item = chapter.scenes.splice(index, 1)[0];
    chapter.scenes.splice(next, 0, item);
    saveProject(true); renderAll();
  }

  function deleteScene() {
    var chapter = currentChapter();
    if (!chapter) return;
    if (!window.confirm("Delete this scene? This cannot be undone unless you have an exported backup.")) return;
    chapter.scenes = chapter.scenes.filter(function (scene) { return scene.id !== activeSceneId; });
    activeSceneId = chapter.scenes[0] ? chapter.scenes[0].id : null;
    saveProject(true); renderAll(); notify("Scene deleted.");
  }

  function renderAll() {
    renderStorySelect();
    $("storyTitle").value = project.title || "";
    $("storyDescription").value = project.description || "";
    $("storyGenre").value = project.genre || "";
    $("storyStatus").value = project.status || "draft";
    $("releaseStatus").value = project.release && project.release.status || "draft";
    $("releaseDate").value = project.release && project.release.date || "";
    renderChapters(); renderScenes(); renderSceneEditor();
  }

  function bindStoryFields() {
    [["storyTitle","title"],["storyDescription","description"],["storyGenre","genre"],["storyStatus","status"]].forEach(function (pair) {
      $(pair[0]).addEventListener("change", function () {
        project[pair[1]] = $(pair[0]).value;
        renderStorySelect(); saveProject(true);
      });
    });
    $("releaseStatus").addEventListener("change", function () {
      project.release = project.release || {};
      project.release.status = this.value; saveProject(true);
    });
    $("releaseDate").addEventListener("change", function () {
      project.release = project.release || {};
      project.release.date = this.value; saveProject(true);
    });
  }

  function addChapter() {
    var title = window.prompt("Chapter title:", "New chapter");
    if (title === null) return;
    var chapter = { id: makeId("chapter"), title: title.trim() || "Untitled chapter", status: "draft", nextChapterId: "", scenes: [
      { id: makeId("scene"), type: "narration", title: "Opening scene", text: "", background: "", color: "#263c2c", audio: "", autoPlayAudio: false, choices: [] }
    ]};
    project.chapters.push(chapter);
    activeChapterId = chapter.id; activeSceneId = chapter.scenes[0].id;
    saveProject(true); renderAll(); notify("Chapter added.");
  }

  function addScene() {
    var chapter = currentChapter();
    if (!chapter) return;
    var type = window.prompt("Scene type: narration, dialogue, revelation, choice, game, chapterEnd", "narration");
    if (type === null) return;
    type = type.trim();
    var allowed = ["narration","dialogue","revelation","choice","game","chapterEnd"];
    if (allowed.indexOf(type) < 0) {
      notify("Unknown type. Using narration."); type = "narration";
    }
    var scene = { id: makeId("scene"), type: type, title: "New " + labelType(type).toLowerCase(), text: "", character: "", characterImage: "", background: "", color: "#263c2c", audio: "", autoPlayAudio: false, gameId: "", choices: [] };
    chapter.scenes.push(scene); activeSceneId = scene.id;
    saveProject(true); renderAll(); notify("Scene added.");
  }

  function exportProject() {
    saveProject(true);
    var blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url; link.download = (project.title || "ceeqwinn-story").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".json";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    notify("Project JSON exported.");
  }

  function importProjectFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var imported = JSON.parse(reader.result);
        if (!imported || !Array.isArray(imported.chapters) || typeof imported.title !== "string") throw new Error("Project file needs a title and chapters array.");
        if (!window.confirm("Replace the current workspace with the imported project? Export a backup first if needed.")) return;
        project = imported;
        project.id = project.id || makeId("story");
        project.release = project.release || { status: "draft", date: "" };
        activeChapterId = project.chapters[0] ? project.chapters[0].id : null;
        activeSceneId = project.chapters[0] && project.chapters[0].scenes[0] ? project.chapters[0].scenes[0].id : null;
        saveProject(true); renderAll(); notify("Project imported.");
      } catch (error) { window.alert("Could not import this project: " + error.message); }
    };
    reader.readAsText(file);
  }

  function openPreview() {
    saveProject(true);
    var modal = $("previewModal");
    modal.hidden = false; modal.setAttribute("aria-hidden", "false");
    var chapter = currentChapter() || project.chapters[0];
    if (chapter) theatre.start(chapter.id);
  }

  function closePreview() {
    $("previewModal").hidden = true;
    $("previewModal").setAttribute("aria-hidden", "true");
  }

  function init() {
    project = loadProject();
    if (!project.chapters.length) project.chapters.push({ id: makeId("chapter"), title: "Chapter 1", status: "draft", nextChapterId: "", scenes: [] });
    activeChapterId = project.chapters[0].id;
    activeSceneId = project.chapters[0].scenes[0] ? project.chapters[0].scenes[0].id : null;
    theatre = new window.CeeqwinnTheatreEngine({ root: $("theatreRoot"), getProject: function () { return project; } });
    bindStoryFields();
    $("saveBtn").addEventListener("click", function () { saveProject(false); });
    $("exportBtn").addEventListener("click", exportProject);
    $("newStoryBtn").addEventListener("click", function () {
      if (!window.confirm("Start a new story project? Export the current project first if you want a separate backup.")) return;
      project = { schemaVersion: 1, id: makeId("story"), title: "Untitled story", description: "", genre: "", status: "draft", release: { status: "draft", date: "" }, chapters: [] };
      var chapter = { id: makeId("chapter"), title: "Chapter 1", status: "draft", nextChapterId: "", scenes: [{ id: makeId("scene"), type: "narration", title: "Opening scene", text: "", color: "#263c2c", background: "", audio: "", choices: [] }] };
      project.chapters.push(chapter); activeChapterId = chapter.id; activeSceneId = chapter.scenes[0].id;
      saveProject(true); renderAll(); notify("New story project created.");
    });
    $("addChapterBtn").addEventListener("click", addChapter);
    $("addSceneBtn").addEventListener("click", addScene);
    $("previewBtn").addEventListener("click", openPreview);
    $("closePreviewBtn").addEventListener("click", closePreview);
    $("restartPreviewBtn").addEventListener("click", function () { var chapter = currentChapter() || project.chapters[0]; if (chapter) theatre.start(chapter.id); });
    document.querySelectorAll("[data-close-preview]").forEach(function (el) { el.addEventListener("click", closePreview); });
    $("importBtn").addEventListener("click", function () { $("importFile").click(); });
    $("importFile").addEventListener("change", function () { importProjectFile(this.files[0]); this.value = ""; });
    $("resetBtn").addEventListener("click", function () {
      if (!window.confirm("Replace the current browser draft with the original sample project? Export first if needed.")) return;
      project = starterProject(); activeChapterId = project.chapters[0].id; activeSceneId = project.chapters[0].scenes[0].id;
      saveProject(true); renderAll(); notify("Sample project restored.");
    });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !$("previewModal").hidden) closePreview(); });
    renderAll();
    saveProject(true);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
