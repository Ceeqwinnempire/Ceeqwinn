/*
 * CEEQWINN Theatre
 * Starts either the existing demo or a CMS Markdown article.
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

  async function startTheatre() {
    const root = document.getElementById("theater-root");

    if (!root) {
      showStartupError(
        "The theatre container is missing from theater.html."
      );
      return;
    }

    if (typeof window.createTheaterEngine !== "function") {
      showStartupError(
        "The theatre engine could not be loaded."
      );
      return;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const articleSlug = params.get("file");

      let scene;

      if (articleSlug) {
        if (
          !window.CEEQWINN_MARKDOWN ||
          typeof window.CEEQWINN_MARKDOWN.loadArticle !== "function"
        ) {
          throw new Error("The Markdown adapter did not load.");
        }

        scene = await window.CEEQWINN_MARKDOWN.loadArticle(
          articleSlug
        );

        const pageTitle = document.getElementById("page-title");

        if (pageTitle) {
          pageTitle.textContent = scene.title;
        }

        document.title = "CEEQWINN Theatre — " + scene.title;
      } else {
        scene = window.CEEQWINN_DEMO_SCENE;
      }

      if (!scene) {
        throw new Error(
          "No story was loaded. Check the article filename."
        );
      }

      const theatre = window.createTheaterEngine({
        root: root,
        scene: scene,

        onError: function (message) {
          console.warn("CEEQWINN Theatre:", message);
        },

        onStateChange: function (state, details) {
          root.dataset.currentBeat =
            details.currentBeatId || "";

          root.dataset.sceneEnded = String(details.ended);

          // Story state remains temporary in this test.
          void state;
        }
      });

      theatre.start();

      root.setAttribute("aria-busy", "false");
      window.CEEQWINN_THEATRE = theatre;
    } catch (error) {
      showStartupError(
        error && error.message
          ? error.message
          : "The story could not be loaded."
      );

      console.error("CEEQWINN Theatre:", error);
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
