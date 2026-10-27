/* CEEQWINN Theatre Engine — local prototype.
   This is a self-contained scene player. It does not modify the existing Reader. */
(function (global) {
  "use strict";

  function safeText(value) {
    return String(value == null ? "" : value);
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }

  function TheatreEngine(options) {
    this.root = options.root;
    this.getProject = options.getProject;
    this.onMessage = options.onMessage || function () {};
    this.chapterId = null;
    this.sceneIndex = 0;
    this.visited = {};
    this.audio = null;
    this.project = null;
  }

  TheatreEngine.prototype.start = function (chapterId) {
    this.stopAudio();
    this.project = this.getProject();
    this.chapterId = chapterId || (this.project.chapters[0] && this.project.chapters[0].id);
    this.sceneIndex = 0;
    this.visited = {};
    this.render();
  };

  TheatreEngine.prototype.getChapter = function () {
    return (this.project.chapters || []).find(function (chapter) {
      return chapter.id === this.chapterId;
    }, this) || null;
  };

  TheatreEngine.prototype.getScene = function () {
    var chapter = this.getChapter();
    return chapter && chapter.scenes ? chapter.scenes[this.sceneIndex] : null;
  };

  TheatreEngine.prototype.stopAudio = function () {
    if (this.audio) {
      try { this.audio.pause(); this.audio.currentTime = 0; } catch (e) {}
      this.audio = null;
    }
  };

  TheatreEngine.prototype.render = function () {
    var chapter = this.getChapter();
    var scene = this.getScene();
    this.root.replaceChildren();
    if (!chapter) {
      this.root.appendChild(createElement("div", "theatre-content", "No chapter is available to preview."));
      return;
    }
    if (!scene) {
      this.renderChapterEnd(chapter);
      return;
    }

    this.visited[scene.id] = true;
    var screen = createElement("div", "theatre-screen fade-in");
    if (scene.background) {
      screen.style.setProperty("--scene-bg", "linear-gradient(0deg,rgba(5,9,6,.75),rgba(5,9,6,.12)), url(" + JSON.stringify(scene.background).slice(1, -1) + ")");
      screen.style.backgroundImage = "linear-gradient(0deg,rgba(5,9,6,.82),rgba(5,9,6,.12)), url(" + JSON.stringify(scene.background).slice(1, -1) + ")";
    } else {
      screen.style.backgroundImage = "linear-gradient(140deg," + (scene.color || "#273c2c") + ",#101510)";
    }

    var topline = createElement("div", "theatre-topline");
    topline.appendChild(createElement("span", "", this.project.title || "CEEQWINN"));
    topline.appendChild(createElement("span", "", (chapter.title || "Chapter") + " · Scene " + (this.sceneIndex + 1)));
    screen.appendChild(topline);

    var content = createElement("div", "theatre-content");
    content.appendChild(createElement("div", "theatre-kicker", this.typeLabel(scene.type)));

    if (scene.type === "dialogue" && (scene.characterImage || scene.character)) {
      var speaker = createElement("div", "speaker-row");
      if (scene.characterImage) {
        var img = createElement("img", "speaker-image");
        img.src = scene.characterImage;
        img.alt = scene.character ? scene.character + " portrait" : "Character portrait";
        img.onerror = function () { this.hidden = true; };
        speaker.appendChild(img);
      }
      speaker.appendChild(createElement("div", "speaker-name", scene.character || "Speaker"));
      content.appendChild(speaker);
    }

    if (scene.title) content.appendChild(createElement("h2", "theatre-title", scene.title));
    if (scene.text) content.appendChild(createElement("div", "theatre-body", scene.text));

    if (scene.audio) {
      var audioWrap = createElement("div", "theatre-controls");
      var audio = createElement("audio", "");
      audio.controls = true;
      audio.preload = "none";
      audio.src = scene.audio;
      audioWrap.appendChild(audio);
      content.appendChild(audioWrap);
      this.audio = audio;
      if (scene.autoPlayAudio) {
        var playAudio = function () { audio.play().catch(function () {}); };
        // Browsers may block autoplay; controls remain available.
        setTimeout(playAudio, 0);
      }
    }

    if (scene.type === "choice") {
      var options = createElement("div", "theatre-options");
      var choices = Array.isArray(scene.choices) ? scene.choices : [];
      choices.forEach(function (choice) {
        var button = createElement("button", "theatre-option", choice.label || "Continue");
        button.type = "button";
        button.addEventListener("click", function () {
          if (choice.targetSceneId) {
            var targetIndex = chapter.scenes.findIndex(function (item) { return item.id === choice.targetSceneId; });
            if (targetIndex >= 0) {
              this.sceneIndex = targetIndex;
              this.render();
              return;
            }
          }
          this.advance();
        }.bind(this));
        options.appendChild(button);
      }, this);
      if (!choices.length) options.appendChild(createElement("p", "theatre-message", "Add choice options in the Studio editor to test branching."));
      content.appendChild(options);
    } else if (scene.type === "game") {
      content.appendChild(createElement("div", "theatre-message", "Game placement preview: " + (scene.gameId || "No game selected") + ". The real game module can be connected in a later integration."));
    }

    var controls = createElement("div", "theatre-controls");
    controls.appendChild(createElement("span", "theatre-footer", (this.sceneIndex + 1) + " of " + chapter.scenes.length + " scenes"));
    var next = createElement("button", "button button-primary", scene.type === "chapterEnd" ? "Finish chapter" : "Continue →");
    next.type = "button";
    next.addEventListener("click", function () {
      if (scene.type === "choice") return;
      if (scene.type === "chapterEnd") this.renderChapterEnd(chapter);
      else this.advance();
    }.bind(this));
    controls.appendChild(next);
    content.appendChild(controls);

    var progress = createElement("div", "theatre-progress");
    var progressFill = createElement("span");
    progressFill.style.width = Math.min(100, ((this.sceneIndex + 1) / Math.max(1, chapter.scenes.length)) * 100) + "%";
    progress.appendChild(progressFill);
    content.appendChild(progress);

    screen.appendChild(content);
    this.root.appendChild(screen);
  };

  TheatreEngine.prototype.typeLabel = function (type) {
    var labels = {
      narration: "Narration", dialogue: "Character dialogue", revelation: "Revelation",
      choice: "Your choice matters", game: "Interactive game", chapterEnd: "Chapter transition"
    };
    return labels[type] || "Theatre scene";
  };

  TheatreEngine.prototype.advance = function () {
    this.stopAudio();
    var chapter = this.getChapter();
    if (!chapter) return;
    var current = this.getScene();
    if (current && current.nextSceneId) {
      var routedIndex = chapter.scenes.findIndex(function (item) { return item.id === current.nextSceneId; });
      if (routedIndex >= 0) {
        this.sceneIndex = routedIndex;
        this.render();
        return;
      }
    }
    this.sceneIndex += 1;
    if (this.sceneIndex >= chapter.scenes.length) this.renderChapterEnd(chapter);
    else this.render();
  };

  TheatreEngine.prototype.renderChapterEnd = function (chapter) {
    this.stopAudio();
    this.root.replaceChildren();
    var screen = createElement("div", "theatre-screen fade-in");
    screen.style.backgroundImage = "linear-gradient(140deg,#2c3e2c,#111810)";
    var content = createElement("div", "theatre-content");
    content.appendChild(createElement("div", "theatre-kicker", "Chapter complete"));
    content.appendChild(createElement("h2", "theatre-title", chapter.title || "The End"));
    content.appendChild(createElement("div", "theatre-body", "You've reached the end of this chapter preview."));
    var controls = createElement("div", "theatre-controls");
    var restart = createElement("button", "button button-primary", "Replay chapter");
    restart.type = "button";
    restart.addEventListener("click", function () { this.start(chapter.id); }.bind(this));
    controls.appendChild(restart);
    var nextChapter = (this.project.chapters || []).find(function (item) { return item.id === chapter.nextChapterId; });
    if (nextChapter) {
      var next = createElement("button", "button button-outline", "Next: " + nextChapter.title);
      next.type = "button";
      next.addEventListener("click", function () { this.start(nextChapter.id); }.bind(this));
      controls.appendChild(next);
    }
    content.appendChild(controls);
    screen.appendChild(content);
    this.root.appendChild(screen);
  };

  global.CeeqwinnTheatreEngine = TheatreEngine;
})(window);
