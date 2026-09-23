/* =========================================================
   CEEQWINN VISUAL STORY THEATRE
   Isolated Theatre Engine
   Does NOT modify article.html
   ========================================================= */

(function () {

  "use strict";

  /* =======================================================
     CONFIGURATION
     ======================================================= */

  var CONFIG = {
    storyPath:
      "../../content/articles/discordant-descendants-chapter-2.md",

    imageRoot:
      "../../content/images/characters/lexis/outfits/",

    defaultLexisImage:
      "lexis_default.png",

    fallbackLexisImage:
      "lexis_default.png.jpeg"
  };


  /* =======================================================
     DOM
     ======================================================= */

  var root =
    document.getElementById("theatre-root");

  var status =
    document.getElementById("theatre-status");


  if (!root) {
    return;
  }


  /* =======================================================
     STATE
     ======================================================= */

  var theatreState = {
    currentScene: null,
    scenes: [],
    currentBeat: 0,
    reducedMotion:
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
  };


  /* =======================================================
     STATUS
     ======================================================= */

  function setStatus(message) {

    if (!status) {
      return;
    }

    status.textContent = message;
  }


  /* =======================================================
     FETCH MARKDOWN
     ======================================================= */

  function loadMarkdown() {

    setStatus(
      "Loading Visual Theatre..."
    );

    return fetch(CONFIG.storyPath)
      .then(function (response) {

        if (!response.ok) {
          throw new Error(
            "Could not load Chapter 2 Markdown."
          );
        }

        return response.text();
      });
  }


  /* =======================================================
     FRONTMATTER
     ======================================================= */

  function removeFrontmatter(markdown) {

    return markdown.replace(
      /^---[\s\S]*?---\s*/m,
      ""
    );
  }


  /* =======================================================
     BASIC MARKDOWN ESCAPE
     ======================================================= */

  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* =======================================================
     INLINE MARKDOWN
     ======================================================= */

  function inlineMarkdown(text) {

    var safe =
      escapeHTML(text);

    safe = safe.replace(
      /\*\*(.+?)\*\*/g,
      "<strong>$1</strong>"
    );

    safe = safe.replace(
      /\*(.+?)\*/g,
      "<em>$1</em>"
    );

    safe = safe.replace(
      /`(.+?)`/g,
      "<span class=\"object-focus\">$1</span>"
    );

    return safe;
  }


  /* =======================================================
     PARAGRAPH RENDERER
     ======================================================= */

  function renderParagraphs(lines) {

    var html = "";

    var paragraph = [];

    function flush() {

      if (!paragraph.length) {
        return;
      }

      var text =
        paragraph.join(" ");

      html +=
        "<p>" +
        inlineMarkdown(text) +
        "</p>";

      paragraph = [];
    }


    lines.forEach(function (line) {

      var trimmed =
        line.trim();

      if (!trimmed) {
        flush();
        return;
      }

      if (
        trimmed === "---" ||
        /^\[.*\]$/.test(trimmed)
      ) {
        flush();
        return;
      }

      paragraph.push(trimmed);
    });

    flush();

    return html;
  }


  /* =======================================================
     SCENE MARKERS
     ======================================================= */

  function parseSceneMarkers(markdown) {

    var lines =
      markdown.split(/\r?\n/);

    var scenes = [];

    var current = null;

    var beforeFirstScene = [];


    lines.forEach(function (line) {

      var sceneMatch =
        line.match(
          /^\[SCENE:\s*([^\]]+)\]\s*$/i
        );


      if (sceneMatch) {

        if (current) {
          scenes.push(current);
        }

        current = {
          id:
            sceneMatch[1].trim(),

          lines: []
        };

        return;
      }


      if (!current) {

        beforeFirstScene.push(line);

        return;
      }


      current.lines.push(line);
    });


    if (current) {
      scenes.push(current);
    }


    /*
     * If a scene marker exists, the material before it
     * remains available but is not treated as a theatre scene.
     */

    return {
      scenes: scenes,
      before:
        beforeFirstScene
    };
  }


  /* =======================================================
     HEADINGS
     ======================================================= */

  function splitIntoBeats(lines) {

    var beats = [];

    var current = {
      heading: "",
      lines: []
    };


    lines.forEach(function (line) {

      var heading =
        line.match(
          /^##\s+(.+)$/
        );


      if (heading) {

        if (
          current.heading ||
          current.lines.length
        ) {
          beats.push(current);
        }

        current = {
          heading:
            heading[1].trim(),

          lines: []
        };

        return;
      }


      current.lines.push(line);
    });


    if (
      current.heading ||
      current.lines.length
    ) {
      beats.push(current);
    }


    return beats;
  }


  /* =======================================================
     SPECIAL MARKERS
     ======================================================= */

  function extractMarker(lines, markerName) {

    var found = [];

    lines.forEach(function (line) {

      var regex =
        new RegExp(
          "^\\[" +
          markerName +
          ":\\s*([^\\]]+)\\]\\s*$",
          "i"
        );

      var match =
        line.match(regex);

      if (match) {
        found.push(
          match[1].trim()
        );
      }
    });

    return found;
  }


  /* =======================================================
     SHOT
     ======================================================= */

  function getShot(lines) {

    var shots =
      extractMarker(
        lines,
        "SHOT"
      );

    return shots.length
      ? shots[0]
      : "FULL";
  }


  /* =======================================================
     TEXT SAFE
     ======================================================= */

  function getTextSafe(lines) {

    var values =
      extractMarker(
        lines,
        "TEXTSAFE"
      );

    return values.length
      ? values[0]
      : "BOTTOM";
  }


  /* =======================================================
     FOCUS
     ======================================================= */

  function getFocus(lines) {

    var values =
      extractMarker(
        lines,
        "FOCUS"
      );

    return values.length
      ? values[0]
      : "";
  }


  /* =======================================================
     TRANSITION
     ======================================================= */

  function getTransition(lines) {

    var values =
      extractMarker(
        lines,
        "TRANSITION"
      );

    return values.length
      ? values[0]
      : "fade";
  }


  /* =======================================================
     IMAGE SELECTION
     ======================================================= */

  function getSceneImage(sceneId) {

    var id =
      String(sceneId)
        .toLowerCase();


    /*
     * Current Chapter 2 opening scene.
     *
     * We deliberately use the real Lexis asset supplied
     * by the CEEQWINN repository.
     */

    if (
      id === "morning-after"
    ) {
      return (
        CONFIG.imageRoot +
        CONFIG.defaultLexisImage
      );
    }


    return (
      CONFIG.imageRoot +
      CONFIG.defaultLexisImage
    );
  }


  /* =======================================================
     IMAGE FALLBACK
     ======================================================= */

  function attachImageFallback(img) {

    img.addEventListener(
      "error",
      function () {

        if (
          img.dataset.fallbackUsed === "true"
        ) {
          img.style.display = "none";
          return;
        }

        img.dataset.fallbackUsed =
          "true";

        img.src =
          CONFIG.imageRoot +
          CONFIG.fallbackLexisImage;
      }
    );
  }


  /* =======================================================
     CHOICE PARSER
     ======================================================= */

  function parseChoice(lines) {

    var start = -1;

    for (
      var i = 0;
      i < lines.length;
      i++
    ) {

      if (
        /^\[CHOICE:/i.test(
          lines[i].trim()
        )
      ) {
        start = i;
        break;
      }
    }


    if (start === -1) {
      return null;
    }


    var choiceId =
      lines[start]
        .replace(
          /^\[CHOICE:\s*/i,
          ""
        )
        .replace(
          /\]\s*$/,
          ""
        )
        .trim();


    var options = [];


    for (
      var j = start + 1;
      j < lines.length;
      j++
    ) {

      var match =
        lines[j].match(
          /^\[([A-Z])\]\s+(.+)$/
        );


      if (match) {

        options.push({
          key:
            match[1],

          text:
            match[2].trim()
        });

        continue;
      }


      if (
        /^\[CONSEQUENCE:/i.test(
          lines[j]
        )
      ) {
        break;
      }
    }


    if (!options.length) {
      return null;
    }


    return {
      id: choiceId,
      options: options
    };
  }


  /* =======================================================
     NEXT PARSER
     ======================================================= */

  function parseNext(lines) {

    for (
      var i = 0;
      i < lines.length;
      i++
    ) {

      var match =
        lines[i].match(
          /^\[NEXT:([^|\]]+)\|([^\]]+)\]\s*$/i
        );


      if (match) {

        return {
          file:
            match[1].trim(),

          label:
            match[2].trim()
        };
      }
    }


    return null;
  }


  /* =======================================================
     CLEAN STORY LINES
     ======================================================= */

  function cleanStoryLines(lines) {

    return lines.filter(
      function (line) {

        var trimmed =
          line.trim();

        if (!trimmed) {
          return true;
        }

        if (
          /^\[SCENE:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[BEAT:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[DIALOGUE:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[SHOT:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[TEXTSAFE:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[FOCUS:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[TRANSITION:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[CHOICE:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[[A-Z]\]\s+/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[CONSEQUENCE:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[ENDCHOICE\]/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[NEXT:/i.test(trimmed)
        ) {
          return false;
        }

        if (
          /^\[IF:/i.test(trimmed) ||
          /^\[ELSE\]/i.test(trimmed) ||
          /^\[ENDIF\]/i.test(trimmed)
        ) {
          return false;
        }

        return true;
      }
    );
  }


  /* =======================================================
     RENDER SCENE
     ======================================================= */

  function renderScene(scene, index) {

    var sceneElement =
      document.createElement("section");

    sceneElement.className =
      "theatre-scene";

    sceneElement.dataset.sceneId =
      scene.id;


    var beats =
      splitIntoBeats(
        scene.lines
      );


    var image =
      getSceneImage(
        scene.id
      );


    var sceneImage =
      document.createElement("img");

    sceneImage.className =
      "scene-character";

    sceneImage.src =
      image;

    sceneImage.alt =
      "Lexis Azunna";

    sceneImage.loading =
      index === 0
        ? "eager"
        : "lazy";

    attachImageFallback(
      sceneImage
    );


    var world =
      document.createElement("div");

    world.className =
      "scene-world";


    var lightOne =
      document.createElement("div");

    lightOne.className =
      "scene-light one";


    var lightTwo =
      document.createElement("div");

    lightTwo.className =
      "scene-light two";


    world.appendChild(
      lightOne
    );

    world.appendChild(
      lightTwo
    );

    world.appendChild(
      sceneImage
    );


    sceneElement.appendChild(
      world
    );


    var atmosphere =
      document.createElement("div");

    atmosphere.className =
      "scene-atmosphere";


    sceneElement.appendChild(
      atmosphere
    );


    var attention =
      document.createElement("div");

    attention.className =
      "attention-zone";

    attention.textContent =
      scene.id.replace(
        /-/g,
        " "
      );


    sceneElement.appendChild(
      attention
    );


    var reading =
      document.createElement("div");

    reading.className =
      "scene-reading";


    var kicker =
      document.createElement("div");

    kicker.className =
      "scene-kicker";

    kicker.textContent =
      "Visual Story Theatre";


    reading.appendChild(
      kicker
    );


    /*
     * If there are no headings, use the scene ID.
     */

    if (!beats.length) {

      beats.push({
        heading:
          scene.id,

        lines:
          scene.lines
      });
    }


    beats.forEach(
      function (beat, beatIndex) {

        renderBeat(
          reading,
          beat,
          beatIndex,
          scene
        );
      }
    );


    var next =
      parseNext(
        scene.lines
      );


    if (next) {

      renderNext(
        reading,
        next
      );
    }


    sceneElement.appendChild(
      reading
    );


    return sceneElement;
  }


  /* =======================================================
     RENDER BEAT
     ======================================================= */

  function renderBeat(
    parent,
    beat,
    beatIndex,
    scene
  ) {

    var cleaned =
      cleanStoryLines(
        beat.lines
      );


    var textLines =
      cleaned;


    var choice =
      parseChoice(
        beat.lines
      );


    /*
     * Skip empty structural beats.
     */

    var hasText =
      textLines.some(
        function (line) {
          return line.trim() !== "";
        }
      );


    if (
      !hasText &&
      !choice &&
      !beat.heading
    ) {
      return;
    }


    var container =
      document.createElement("article");

    container.className =
      "theatre-beat";

    container.dataset.beat =
      String(beatIndex);


    var shot =
      getShot(
        beat.lines
      );

    var textSafe =
      getTextSafe(
        beat.lines
      );

    var focus =
      getFocus(
        beat.lines
      );

    var transition =
      getTransition(
        beat.lines
      );


    container.dataset.shot =
      shot;

    container.dataset.textsafe =
      textSafe;

    container.dataset.transition =
      transition;

    if (focus) {
      container.dataset.focus =
        focus;
    }


    if (beat.heading) {

      var title =
        document.createElement("h2");

      title.className =
        "scene-title";

      title.textContent =
        beat.heading;

      container.appendChild(
        title
      );
    }


    if (hasText) {

      var story =
        document.createElement("div");

      story.className =
        "scene-story";

      story.innerHTML =
        renderParagraphs(
          textLines
        );

      container.appendChild(
        story
      );
    }


    if (choice) {

      renderChoice(
        container,
        choice
      );
    }


    parent.appendChild(
      container
    );


    observeBeat(
      container
    );
  }


  /* =======================================================
     CHOICE
     ======================================================= */

  function renderChoice(
    parent,
    choice
  ) {

    var box =
      document.createElement("div");

    box.className =
      "theatre-choice";


    var kicker =
      document.createElement("div");

    kicker.className =
      "choice-kicker";

    kicker.textContent =
      "Your choice";


    var question =
      document.createElement("div");

    question.className =
      "choice-question";

    question.textContent =
      "What does Lexis do?";


    var options =
      document.createElement("div");

    options.className =
      "choice-options";


    choice.options.forEach(
      function (option) {

        var button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.textContent =
          option.key +
          " — " +
          option.text;


        button.addEventListener(
          "click",
          function () {

            handleChoice(
              choice,
              option
            );
          }
        );


        options.appendChild(
          button
        );
      }
    );


    box.appendChild(
      kicker
    );

    box.appendChild(
      question
    );

    box.appendChild(
      options
    );


    parent.appendChild(
      box
    );
  }


  /* =======================================================
     CHOICE HANDLING
     ======================================================= */

  function handleChoice(
    choice,
    option
  ) {

    /*
     * This Theatre laboratory does not yet write into
     * the production story state.
     *
     * It records the choice locally for the Theatre only.
     */

    try {

      sessionStorage.setItem(
        "ceeqwinn_theatre_choice_" +
        choice.id,
        option.key
      );

    } catch (error) {
      /* Storage unavailable: Theatre continues. */
    }


    document.body.classList.add(
      "theatre-focus"
    );


    setStatus(
      "Choice " +
      option.key +
      " selected"
    );


    setTimeout(
      function () {

        document.body.classList.remove(
          "theatre-focus"
        );

      },
      800
    );
  }


  /* =======================================================
     NEXT
     ======================================================= */

  function renderNext(
    parent,
    next
  ) {

    var wrapper =
      document.createElement("div");

    wrapper.className =
      "theatre-next";


    var link =
      document.createElement("a");

    link.href =
      "../article.html?file=" +
      encodeURIComponent(
        next.file
      );

    link.textContent =
      next.label;


    wrapper.appendChild(
      link
    );


    parent.appendChild(
      wrapper
    );
  }


  /* =======================================================
     BEAT OBSERVER
     ======================================================= */

  function observeBeat(
    element
  ) {

    if (
      !("IntersectionObserver" in window)
    ) {
      return;
    }


    var observer =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(
            function (entry) {

              if (
                entry.isIntersecting
              ) {

                element.classList.add(
                  "is-focused"
                );

                setTimeout(
                  function () {

                    element.classList.remove(
                      "is-focused"
                    );

                  },
                  1200
                );
              }
            }
          );
        },
        {
          threshold: 0.32
        }
      );


    observer.observe(
      element
    );
  }


  /* =======================================================
     CAMERA
     ======================================================= */

  function activateCamera() {

    if (
      theatreState.reducedMotion
    ) {
      return;
    }


    var stages =
      document.querySelectorAll(
        ".theatre-scene"
      );


    stages.forEach(
      function (stage, index) {

        if (index === 0) {

          setTimeout(
            function () {

              stage.classList.add(
                "camera-active"
              );

            },
            700
          );
        }
      }
    );
  }


  /* =======================================================
     INITIALIZE
     ======================================================= */

  function initialize(markdown) {

    var cleaned =
      removeFrontmatter(
        markdown
      );


    var parsed =
      parseSceneMarkers(
        cleaned
      );


    theatreState.scenes =
      parsed.scenes;


    if (!parsed.scenes.length) {

      setStatus(
        "No Visual Theatre scenes found"
      );

      root.innerHTML =
        "<p style=\"padding:40px;color:#ddd\">" +
        "No [SCENE:...] marker was found." +
        "</p>";

      return;
    }


    parsed.scenes.forEach(
      function (scene, index) {

        var element =
          renderScene(
            scene,
            index
          );

        root.appendChild(
          element
        );
      }
    );


    theatreState.currentScene =
      parsed.scenes[0].id;


    activateCamera();


    setStatus(
      "Visual Theatre • " +
      parsed.scenes.length +
      " scene" +
      (
        parsed.scenes.length === 1
          ? ""
          : "s"
      )
    );
  }


  /* =======================================================
     START
     ======================================================= */

  loadMarkdown()
    .then(function (markdown) {

      initialize(
        markdown
      );

    })
    .catch(function (error) {

      console.error(
        "CEEQWINN Theatre:",
        error
      );


      setStatus(
        "Visual Theatre could not load the story"
      );


      root.innerHTML =
        "<div style=\"" +
        "max-width:760px;" +
        "margin:120px auto;" +
        "padding:24px;" +
        "color:#eee;" +
        "font-family:Arial,sans-serif;" +
        "\">" +

        "<h2>Visual Theatre loading error</h2>" +

        "<p>" +
        escapeHTML(
          error.message
        ) +
        "</p>" +

        "</div>";
    });


})();
