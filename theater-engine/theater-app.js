
/*
 * CEEQWINN THEATRE ENGINE
 * File: theater-app.js
 * Version: 1.0.0
 *
 * Connects the scene to the engine and starts playback.
 * Uses vanilla JavaScript only.
 */

(function () {
  "use strict";

  function showStartupError(message) {
    const root = document.getElementById("theater-root");

    if (!root) {
      console.error("CEEQWINN Theatre:", message);
      return;
    }

    root.setAttribute("aria-busy", "false");

    const error = document.createElement("section");
    error.className = "theater-shell theater-startup-error";
    error.setAttribute("role", "alert");

    const heading = document.createElement("h2");
    heading.className = "theater-title";
    heading.textContent = "The Theatre Could Not Start";

    const paragraph = document.createElement("p");
    paragraph.className = "theater-text";
    paragraph.textContent = message;

    error.appendChild(heading);
    error.appendChild(paragraph);

    root.replaceChildren(error);

    console.error("CEEQWINN Theatre:", message);
  }

  function startTheatre() {
    const root = document.getElementById("theater-root");

    if (!root) {
      showStartupError(
        "The theatre container is missing from theater.html."
      );
      return;
    }

    if (typeof window.createTheaterEngine !== "function") {
      showStartupError(
        "The theatre engine could not be loaded. " +
        "Check that theater-engine.js exists in the same folder."
      );
      return;
    }

    if (!window.CEEQWINN_DEMO_SCENE) {
      showStartupError(
        "The demo scene could not be loaded. " +
        "Check that demo-scene.js exists in the same folder."
      );
      return;
    }

    try {
      const theatre = window.createTheaterEngine({
        root: root,
        scene: window.CEEQWINN_DEMO_SCENE,

        onError: function (message) {
          console.warn("CEEQWINN Theatre:", message);
        },

        onStateChange: function (state, details) {
          // State is available for future approved integrations.
          // This demo does not save it permanently or modify the CMS.
          root.dataset.currentBeat = details.currentBeatId || "";
          root.dataset.sceneEnded = String(details.ended);

          // Deliberately do not log story state or reader choices.
          void state;
        }
      });

      theatre.start();

      root.setAttribute("aria-busy", "false");

      // Expose a small debugging handle for local development.
      // This does not communicate with the existing article reader.
      window.CEEQWINN_THEATRE = theatre;
    } catch (error) {
      showStartupError(
        "The theatre encountered a startup problem. " +
        "Check the JavaScript files and scene definition, " +
        "then try again."
      );

      console.error(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startTheatre,
      { once: true }
    );
  } else {
    startTheatre();
  }
})();
