
/*
 * CEEQWINN THEATRE ENGINE
 * Version: 1.0.0
 * Technology: Vanilla JavaScript
 *
 * Responsibilities:
 * - Scene playback and navigation
 * - Dialogue, narration, reflection and action
 * - Images, audio, video and backgrounds
 * - Choices and conditional branches
 * - Scene state and previous-beat history
 * - Branch-loop protection
 * - Temporary local media selection
 * - Safe text rendering and media error handling
 *
 * No frameworks or paid dependencies.
 *
 * Public API:
 *   const theatre = createTheaterEngine({
 *     root: document.getElementById("theater-root"),
 *     scene: myScene
 *   });
 *
 *   theatre.start();
 *   theatre.restart();
 *   theatre.destroy();
 */

(function (global) {
  "use strict";

  const MAX_BRANCH_HOPS = 30;

  const VALID_TYPES = new Set([
    "narration",
    "reflection",
    "action",
    "dialogue",
    "image",
    "audio",
    "video",
    "background",
    "choice",
    "branch",
    "wait",
    "end"
  ]);

  function createTheaterEngine(config) {
    if (!config || !config.root) {
      throw new Error(
        "CEEQWINN Theatre Engine requires a root element."
      );
    }

    const root = config.root;
    const scene = config.scene;
    const onStateChange =
      typeof config.onStateChange === "function"
        ? config.onStateChange
        : function () {};

    if (!scene || !Array.isArray(scene.beats)) {
      throw new Error(
        "The scene must contain a beats array."
      );
    }

    const beats = scene.beats;
    const beatMap = new Map();

    beats.forEach(function (beat, index) {
      if (!beat || typeof beat.id !== "string" || !beat.id.trim()) {
        throw new Error(
          "Every beat needs a non-empty string ID. Check beat " +
          index + "."
        );
      }

      if (beatMap.has(beat.id)) {
        throw new Error("Duplicate beat ID: " + beat.id);
      }

      if (!VALID_TYPES.has(beat.type)) {
        throw new Error(
          "Unsupported beat type in " + beat.id +
          ": " + beat.type
        );
      }

      beatMap.set(beat.id, beat);
    });

    if (beats.length === 0) {
      throw new Error("The scene has no beats.");
    }

    const initialState = cloneValue(scene.initialState || {});

    let currentIndex = 0;
    let started = false;
    let ended = false;
    let destroyed = false;
    let currentBackground = null;
    let history = [];
    let mediaUrls = new Set();
    let mediaGeneration = 0;

    function cloneValue(value) {
      if (value === undefined) return undefined;

      if (typeof structuredClone === "function") {
        try {
          return structuredClone(value);
        } catch (_) {
          // Fall through to the JSON-compatible copy.
        }
      }

      return JSON.parse(JSON.stringify(value));
    }

    let state = cloneValue(initialState);

    function makeElement(tag, className, text) {
      const element = document.createElement(tag);

      if (className) {
        element.className = className;
      }

      if (text !== undefined && text !== null) {
        element.textContent = String(text);
      }

      return element;
    }

    function makeButton(label, action, className) {
      const button = makeElement(
        "button",
        className || "theater-button",
        label
      );

      button.type = "button";
      button.dataset.action = action;

      return button;
    }

    function clearElement(element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }

    function reportError(message) {
      const errorBox = root.querySelector("[data-role='error']");

      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
      }

      if (typeof config.onError === "function") {
        config.onError(message);
      }
    }

    function clearError() {
      const errorBox = root.querySelector("[data-role='error']");

      if (errorBox) {
        errorBox.textContent = "";
        errorBox.hidden = true;
      }
    }

    function notifyStateChange() {
      try {
        onStateChange(cloneValue(state), {
          sceneId: scene.id || null,
          currentBeatId: getCurrentBeat()?.id || null,
          ended: ended
        });
      } catch (error) {
        reportError(
          "A scene-state notification failed. Playback can continue."
        );
      }
    }

    function getCurrentBeat() {
      return beats[currentIndex] || null;
    }

    function getDestinationIndex(destination) {
      if (typeof destination === "number") {
        return Number.isInteger(destination) &&
          destination >= 0 &&
          destination < beats.length
          ? destination
          : -1;
      }

      if (typeof destination === "string") {
        const beat = beatMap.get(destination);

        return beat ? beats.indexOf(beat) : -1;
      }

      return -1;
    }

    function readDestination(beat) {
      return beat.next !== undefined
        ? beat.next
        : beat.target;
    }

    function matchesCondition(condition) {
      if (!condition || typeof condition !== "object") {
        return false;
      }

      // Supported:
      // { key: "clueFound", equals: true }
      // { key: "clueFound", value: true }
      // { key: "clueFound", notEquals: false }
      // { all: [condition, condition] }
      // { any: [condition, condition] }
      // { not: condition }

      if (Array.isArray(condition.all)) {
        return condition.all.every(matchesCondition);
      }

      if (Array.isArray(condition.any)) {
        return condition.any.some(matchesCondition);
      }

      if (condition.not) {
        return !matchesCondition(condition.not);
      }

      if (typeof condition.key !== "string") {
        return false;
      }

      const actual = state[condition.key];

      if (Object.prototype.hasOwnProperty.call(condition, "equals")) {
        return actual === condition.equals;
      }

      if (Object.prototype.hasOwnProperty.call(condition, "value")) {
        return actual === condition.value;
      }

      if (
        Object.prototype.hasOwnProperty.call(condition, "notEquals")
      ) {
        return actual !== condition.notEquals;
      }

      return Boolean(actual);
    }

    function evaluateBranch(beat) {
      const routes = Array.isArray(beat.routes)
        ? beat.routes
        : [];

      for (const route of routes) {
        if (matchesCondition(route.when || route.condition)) {
          return readDestination(route);
        }
      }

      if (beat.default !== undefined) {
        return beat.default;
      }

      return readDestination(beat);
    }

    function releaseMediaUrls() {
      mediaUrls.forEach(function (url) {
        try {
          URL.revokeObjectURL(url);
        } catch (_) {
          // Cleanup should never stop playback.
        }
      });

      mediaUrls.clear();
    }

    function clearStage() {
      mediaGeneration += 1;
      releaseMediaUrls();
      clearElement(root);
    }

    function createInterface() {
      clearElement(root);

      const shell = makeElement("section", "theater-shell");
      shell.setAttribute("aria-label", "Interactive story theatre");

      const heading = makeElement("header", "theater-header");
      heading.appendChild(
        makeElement("h2", "theater-title", scene.title || "Story Theatre")
      );

      const progress = makeElement("div", "theater-progress");
      progress.setAttribute("data-role", "progress");

      const progressText = makeElement("p", "theater-progress-text");
      progressText.setAttribute("data-role", "progress-text");

      const track = makeElement("div", "theater-progress-track");
      const fill = makeElement("div", "theater-progress-fill");
      fill.setAttribute("data-role", "progress-fill");
      track.appendChild(fill);

      progress.appendChild(progressText);
      progress.appendChild(track);

      const error = makeElement("p", "theater-error");
      error.setAttribute("data-role", "error");
      error.setAttribute("role", "alert");
      error.hidden = true;

      const stage = makeElement("main", "theater-stage");
      stage.setAttribute("data-role", "stage");
      stage.setAttribute("aria-live", "polite");

      const controls = makeElement("nav", "theater-controls");
      controls.setAttribute("aria-label", "Story controls");

      controls.appendChild(makeButton("Previous", "previous"));
      controls.appendChild(makeButton("Continue", "continue"));
      controls.appendChild(makeButton("Restart", "restart"));

      shell.appendChild(heading);
      shell.appendChild(progress);
      shell.appendChild(error);
      shell.appendChild(stage);
      shell.appendChild(controls);

      root.appendChild(shell);
    }

    function addTextContent(container, text) {
      if (text === undefined || text === null || text === "") {
        return;
      }

      const paragraph = makeElement("p", "theater-text", text);
      container.appendChild(paragraph);
    }

    function getMediaSource(beat) {
      if (typeof beat.src === "string" && beat.src.trim()) {
        return beat.src.trim();
      }

      if (beat.media && typeof beat.media.src === "string") {
        return beat.media.src.trim();
      }

      return "";
    }

    function addMediaFallback(container, message) {
      container.appendChild(
        makeElement("p", "theater-media-fallback", message)
      );
    }

    function renderMedia(beat, container) {
      const source = getMediaSource(beat);

      if (!source) {
        addMediaFallback(
          container,
          "No media source was provided for this scene."
        );

        addLocalMediaPicker(beat, container);
        return;
      }

      const generation = mediaGeneration;
      let media;

      if (beat.type === "image") {
        media = makeElement("img", "theater-image");
        media.alt = beat.alt || beat.heading || "Story illustration";
        media.loading = "lazy";
        media.decoding = "async";
      } else if (beat.type === "audio") {
        media = makeElement("audio", "theater-audio");
        media.controls = true;
        media.preload = "none";
      } else if (beat.type === "video") {
        media = makeElement("video", "theater-video");
        media.controls = true;
        media.preload = "metadata";
        media.playsInline = true;
        media.setAttribute("playsinline", "");
        // Intentionally no autoplay.
      } else {
        return;
      }

      media.addEventListener("error", function () {
        if (
          destroyed ||
          generation !== mediaGeneration ||
          !media.isConnected
        ) {
          return;
        }

        addMediaFallback(
          container,
          "This media could not be loaded. You can continue the story."
        );
      });

      media.src = source;
      container.appendChild(media);

      addLocalMediaPicker(beat, container);
    }

    function addLocalMediaPicker(beat, container) {
      const pickerLabel = makeElement(
        "label",
        "theater-local-media",
        "Choose a temporary local media file"
      );

      const input = makeElement("input", "theater-local-media-input");
      input.type = "file";
      input.accept =
        beat.type === "image" ? "image/*" :
        beat.type === "audio" ? "audio/*" :
        beat.type === "video" ? "video/*" :
        "image/*,audio/*,video/*";

      input.addEventListener("change", function () {
        const file = input.files && input.files[0];

        if (!file) return;

        const expectedType =
          beat.type === "background" ? "image" : beat.type;

        if (
          !["image", "audio", "video"].includes(expectedType) ||
          !file.type.startsWith(expectedType + "/")
        ) {
          reportError(
            "Choose a file that matches this beat's media type."
          );
          input.value = "";
          return;
        }

        const url = URL.createObjectURL(file);
        mediaUrls.add(url);

        if (beat.type === "background") {
          currentBackground = url;
          renderCurrent();
          return;
        }

        const mediaBeat = Object.assign({}, beat, { src: url });
        const stage = root.querySelector("[data-role='stage']");

        if (!stage) return;

        const mediaContainer = stage.querySelector(
          "[data-role='media']"
        );

        if (!mediaContainer) return;

        clearElement(mediaContainer);
        renderMedia(mediaBeat, mediaContainer);
      });

      pickerLabel.appendChild(input);
      container.appendChild(pickerLabel);
    }

    function renderChoices(beat, container) {
      const options = Array.isArray(beat.options)
        ? beat.options
        : Array.isArray(beat.choices)
          ? beat.choices
          : [];

      if (options.length === 0) {
        reportError("This choice beat has no options.");
        return;
      }

      const list = makeElement("div", "theater-choice-list");

      options.forEach(function (option, index) {
        const label =
          option.label || option.text || ("Choice " + (index + 1));

        const button = makeButton(
          label,
          "choice",
          "theater-button theater-choice"
        );

        button.dataset.choiceIndex = String(index);
        list.appendChild(button);
      });

      container.appendChild(list);
    }

    function updateProgress() {
      const text = root.querySelector("[data-role='progress-text']");
      const fill = root.querySelector("[data-role='progress-fill']");

      if (!text || !fill) return;

      const current = Math.min(currentIndex + 1, beats.length);
      const percentage = beats.length
        ? (current / beats.length) * 100
        : 0;

      text.textContent =
        "Beat " + current + " of " + beats.length;

      fill.style.width = percentage + "%";
    }

    function updateControls(beat) {
      const previous = root.querySelector(
        "[data-action='previous']"
      );

      const next = root.querySelector(
        "[data-action='continue']"
      );

      if (previous) {
        previous.disabled = history.length === 0 || ended;
      }

      if (next) {
        next.hidden =
          ended ||
          beat.type === "choice";

        next.textContent =
          beat.type === "end" ? "Finished" : "Continue";

        next.disabled = ended;
      }
    }

    function renderCurrent() {
      if (destroyed) return;

      clearError();

      let branchHops = 0;
      const visitedBranches = new Set();

      // Resolve branches iteratively rather than recursively.
      // This prevents branch chains from exhausting the call stack.
      while (true) {
        const beat = getCurrentBeat();

        if (!beat) {
          reportError("The current beat does not exist.");
          return;
        }

        if (beat.type !== "branch") break;

        branchHops += 1;

        if (
          branchHops > MAX_BRANCH_HOPS ||
          visitedBranches.has(beat.id)
        ) {
          reportError(
            "Branch loop detected. Playback stopped to protect the story."
          );

          ended = true;
          updateControls(beat);
          return;
        }

        visitedBranches.add(beat.id);

        const destination = evaluateBranch(beat);
        const destinationIndex = getDestinationIndex(destination);

        if (destinationIndex < 0) {
          reportError(
            "Invalid branch destination in beat '" + beat.id + "'."
          );

          ended = true;
          updateControls(beat);
          return;
        }

        currentIndex = destinationIndex;
      }

      const beat = getCurrentBeat();

      if (!beat) return;

      const stage = root.querySelector("[data-role='stage']");

      if (!stage) return;

      clearElement(stage);

      stage.className =
        "theater-stage theater-beat-" + beat.type;

      if (beat.heading) {
        stage.appendChild(
          makeElement("h3", "theater-beat-heading", beat.heading)
        );
      }

      if (beat.type === "end") {
        addTextContent(stage, beat.text);

        stage.appendChild(
          makeElement(
            "p",
            "theater-ending-label",
            beat.endingLabel || "The End"
          )
        );

        ended = true;
      } else {
        ended = false;
      }

      if (
        ["narration", "reflection", "action", "dialogue", "wait",
         "background"].includes(beat.type)
      ) {
        addTextContent(stage, beat.text);
      }

      if (["image", "audio", "video"].includes(beat.type)) {
        addTextContent(stage, beat.text);

        const mediaContainer = makeElement(
          "div",
          "theater-media",
        );

        mediaContainer.setAttribute("data-role", "media");
        stage.appendChild(mediaContainer);

        renderMedia(beat, mediaContainer);
      }

      if (beat.type === "background") {
        const source = getMediaSource(beat);

        if (source) {
          currentBackground = source;
        }

        if (currentBackground) {
          stage.style.backgroundImage =
            "linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.25)), " +
            "url(" + JSON.stringify(currentBackground) + ")";

          stage.style.backgroundSize = "cover";
          stage.style.backgroundPosition = "center";
        } else {
          stage.style.backgroundImage = "";
        }
      } else {
        stage.style.backgroundImage = "";
      }

      if (beat.type === "choice") {
        addTextContent(stage, beat.text);
        renderChoices(beat, stage);
      }

      if (beat.type === "end") {
        const restartButton = makeButton(
          "Play Again",
          "restart",
          "theater-button theater-restart"
        );

        stage.appendChild(restartButton);
      }

      updateProgress();
      updateControls(beat);
      notifyStateChange();
    }

    function moveTo(destination, saveHistory) {
      const destinationIndex = getDestinationIndex(destination);

      if (destinationIndex < 0) {
        reportError(
          "Cannot navigate: the requested destination does not exist."
        );
        return false;
      }

      if (saveHistory) {
        history.push({
          index: currentIndex,
          state: cloneValue(state),
          background: currentBackground
        });
      }

      currentIndex = destinationIndex;
      ended = false;
      renderCurrent();

      return true;
    }

    function continueStory() {
      if (ended) return;

      const beat = getCurrentBeat();

      if (!beat) return;

      if (beat.type === "choice") {
        reportError("Please choose an option to continue.");
        return;
      }

      if (beat.type === "end") {
        ended = true;
        updateControls(beat);
        return;
      }

      const destination = readDestination(beat);

      if (destination !== undefined && destination !== null) {
        moveTo(destination, true);
        return;
      }

      if (currentIndex + 1 < beats.length) {
        moveTo(currentIndex + 1, true);
        return;
      }

      reportError(
        "The scene has reached its last beat without an ending."
      );
    }

    function selectChoice(index) {
      if (ended) return;

      const beat = getCurrentBeat();

      if (!beat || beat.type !== "choice") return;

      const options = Array.isArray(beat.options)
        ? beat.options
        : Array.isArray(beat.choices)
          ? beat.choices
          : [];

      const option = options[index];

      if (!option) {
        reportError("That choice does not exist.");
        return;
      }

      const destination = readDestination(option);

      if (destination === undefined || destination === null) {
        reportError("This choice has no destination.");
        return;
      }

      // Validate the destination before changing the story state.
      if (getDestinationIndex(destination) < 0) {
        reportError(
          "This choice points to a beat that does not exist."
        );
        return;
      }

      history.push({
        index: currentIndex,
        state: cloneValue(state),
        background: currentBackground
      });

      const changes = option.set || option.state || {};

      Object.keys(changes).forEach(function (key) {
        state[key] = cloneValue(changes[key]);
      });

      notifyStateChange();
      moveTo(destination, false);
    }

    function previous() {
      if (ended || history.length === 0) return;

      const previousStep = history.pop();

      currentIndex = previousStep.index;
      state = cloneValue(previousStep.state);
      currentBackground = previousStep.background;
      ended = false;

      renderCurrent();
    }

    function restart() {
      if (destroyed) return;

      currentIndex = 0;
      state = cloneValue(initialState);
      history = [];
      ended = false;
      started = true;
      currentBackground = null;

      clearStage();
      createInterface();
      renderCurrent();
    }

    function handleClick(event) {
      const button = event.target.closest("[data-action]");

      if (!button || !root.contains(button)) return;

      switch (button.dataset.action) {
        case "continue":
          continueStory();
          break;

        case "previous":
          previous();
          break;

        case "restart":
          restart();
          break;

        case "choice":
          selectChoice(Number(button.dataset.choiceIndex));
          break;
      }
    }

    function start() {
      if (destroyed) {
        throw new Error(
          "This theatre instance has been destroyed."
        );
      }

      if (started) return api;

      started = true;
      createInterface();

      root.addEventListener("click", handleClick);
      renderCurrent();

      return api;
    }

    function destroy() {
      if (destroyed) return;

      root.removeEventListener("click", handleClick);
      clearStage();

      started = false;
      ended = true;
      destroyed = true;
    }

    const api = {
      start: start,
      restart: restart,
      destroy: destroy,

      getState: function () {
        return cloneValue(state);
      },

      getCurrentBeat: function () {
        return cloneValue(getCurrentBeat());
      },

      setState: function (key, value) {
        if (typeof key !== "string" || !key) {
          throw new Error("State keys must be non-empty strings.");
        }

        state[key] = cloneValue(value);
        notifyStateChange();

        return api;
      },

      goTo: function (destination) {
        if (destroyed) return false;

        return moveTo(destination, true);
      }
    };

    return api;
  }

  global.createTheaterEngine = createTheaterEngine;
})(window);
