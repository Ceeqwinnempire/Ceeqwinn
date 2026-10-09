
/* =========================================================
   CEEQWINN DIALOGUE THEATRE — AUTOPLAY v1
   Complete replacement script

   BEHAVIOUR
   1. Dialogue starts typing automatically.
   2. Tap during typing: reveal the complete line.
   3. Tap again: advance immediately.
   4. No taps: advance automatically after the reading pause.
   5. Reaction shots receive extra display time.
   6. PRESENT portraits show who is in the scene.
   7. Restart returns to the first line.
   ========================================================= */

(function () {
  "use strict";

  const root = document.getElementById("dialogueAutoplayV1");
  if (!root) return;

  const IMAGE_BASE =
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/";

  const characters = {
    lexis: {
      name: "LEXIS",
      main:
        IMAGE_BASE +
        "characters/lexis/outfits/Lexis_Azunna_militarily.jpg.jpeg",
      portrait:
        IMAGE_BASE +
        "characters/lexis/outfits/lexis_default.png",
      reaction:
        IMAGE_BASE +
        "characters/lexis/outfits/Lexis_Azunna_street.jpg.jpeg"
    },

    mara: {
      name: "MARA",
      main:
        IMAGE_BASE +
        "young_woman_rainy_atmosphere_c%20(2).jpeg",
      portrait:
        IMAGE_BASE +
        "young_woman_rainy_atmosphere_c.jpeg",
      reaction:
        IMAGE_BASE +
        "young_woman_rainy_atmosphere_c.jpeg"
    }
  };

  const story = [
    {
      speaker: "lexis",
      text: "You said you had something important to tell me."
    },
    {
      speaker: "mara",
      text: "I do. But first, promise you won't get angry."
    },
    {
      speaker: "mara",
      text:
        "I may have told somebody something I was supposed to keep secret.",
      reaction: "lexis",
      reactionLabel: "LEXIS · REACTION",
      reactionDuration: 1700
    },
    {
      speaker: "lexis",
      text: "You may have WHAT?"
    },
    {
      speaker: "mara",
      text:
        "When you repeat it like that, it sounds much worse.",
      reaction: "lexis",
      reactionLabel: "LEXIS · UNIMPRESSED",
      reactionDuration: 1800
    },
    {
      speaker: "lexis",
      text: "Mara. Please tell me you are joking."
    },
    {
      speaker: "mara",
      text: "I would. But then I'd be lying twice.",
      reaction: "lexis",
      reactionLabel: "LEXIS · SILENT JUDGMENT",
      reactionDuration: 2000
    },
    {
      speaker: "lexis",
      text:
        "Sit down. We are going to discuss your definition of a secret."
    }
  ];

  const TYPE = {
    characterDelay: 30,
    punctuationPause: 120,
    sentencePause: 240,
    minimumReadingPause: 1800,
    maximumReadingPause: 4800,
    reactionExtraPause: 500
  };

  const $ = function (id) {
    return root.querySelector("#" + id);
  };

  const el = {
    stage: $("autoplayStage"),
    image: $("autoplayImage"),
    speaker: $("autoplaySpeaker"),
    text: $("autoplayText"),
    counter: $("autoplayCounter"),
    hint: $("autoplayHint"),
    advance: $("autoplayAdvance"),
    status: $("autoplayStatus"),
    restart: $("autoplayRestart"),
    reaction: $("autoplayReaction"),
    reactionImage: $("autoplayReactionImage"),
    reactionName: $("autoplayReactionName"),
    portraits: $("autoplayPortraitList")
  };

  if (
    !el.stage ||
    !el.image ||
    !el.speaker ||
    !el.text ||
    !el.counter ||
    !el.hint ||
    !el.advance ||
    !el.status ||
    !el.restart ||
    !el.reaction ||
    !el.reactionImage ||
    !el.reactionName ||
    !el.portraits
  ) {
    console.error(
      "CEEQWINN Autoplay: one or more required HTML elements are missing."
    );
    return;
  }

  let index = 0;
  let typing = false;
  let lineComplete = false;
  let finished = false;
  let paused = false;
  let revealedByTap = false;

  let typeTimer = null;
  let nextTimer = null;
  let reactionTimer = null;
  let reactionEndTimer = null;

  let typeToken = 0;
  let sceneToken = 0;
  let lastTap = 0;
  let currentText = "";

  const imageCache = Object.create(null);

  function preloadImage(url) {
    if (!url) return Promise.resolve(false);

    if (imageCache[url]) {
      return imageCache[url];
    }

    imageCache[url] = new Promise(function (resolve) {
      const img = new Image();

      img.onload = function () {
        resolve(true);
      };

      img.onerror = function () {
        resolve(false);
      };

      img.src = url;
    });

    return imageCache[url];
  }

  function clearTypeTimer() {
    if (typeTimer !== null) {
      clearTimeout(typeTimer);
      typeTimer = null;
    }
  }

  function clearNextTimer() {
    if (nextTimer !== null) {
      clearTimeout(nextTimer);
      nextTimer = null;
    }
  }

  function clearReactionTimers() {
    if (reactionTimer !== null) {
      clearTimeout(reactionTimer);
      reactionTimer = null;
    }

    if (reactionEndTimer !== null) {
      clearTimeout(reactionEndTimer);
      reactionEndTimer = null;
    }
  }

  function clearAllTimers() {
    clearTypeTimer();
    clearNextTimer();
    clearReactionTimers();
  }

  function hideReaction() {
    clearReactionTimers();

    el.reaction.classList.remove("is-visible");
    el.reaction.setAttribute("aria-hidden", "true");
  }

  function showMainImage(characterKey, token) {
    const character = characters[characterKey];
    if (!character) return;

    el.image.classList.add("is-changing");

    preloadImage(character.main).then(function (loaded) {
      if (token !== sceneToken || !loaded) {
        if (token === sceneToken) {
          el.image.classList.remove("is-changing");
        }
        return;
      }

      el.image.style.backgroundImage =
        'url("' + character.main + '")';

      requestAnimationFrame(function () {
        if (token === sceneToken) {
          el.image.classList.remove("is-changing");
        }
      });
    });
  }

  function buildPortraits() {
    el.portraits.replaceChildren();

    Object.keys(characters).forEach(function (key) {
      const character = characters[key];

      const portrait = document.createElement("div");
      portrait.className = "autoplay-portrait";
      portrait.dataset.character = key;

      const img = document.createElement("img");
      img.alt = character.name;
      img.loading = "eager";
      img.decoding = "async";
      img.src = character.portrait;

      const label = document.createElement("span");
      label.textContent = character.name;

      portrait.appendChild(img);
      portrait.appendChild(label);
      el.portraits.appendChild(portrait);
    });
  }

  function updatePortraits(speakerKey) {
    const portraits =
      el.portraits.querySelectorAll(".autoplay-portrait");

    portraits.forEach(function (portrait) {
      const speaking =
        portrait.dataset.character === speakerKey;

      portrait.classList.toggle("is-speaking", speaking);

      if (speaking) {
        portrait.setAttribute("aria-current", "true");
      } else {
        portrait.removeAttribute("aria-current");
      }
    });
  }

  function showReaction(line, token) {
    hideReaction();

    if (!line.reaction || !characters[line.reaction]) {
      return;
    }

    const character = characters[line.reaction];

    el.reactionImage.alt = character.name + " reaction";
    el.reactionName.textContent =
      line.reactionLabel || character.name + " · REACTION";

    preloadImage(character.reaction).then(function (loaded) {
      if (token !== sceneToken || !loaded || paused) return;

      el.reactionImage.src = character.reaction;

      el.reaction.classList.add("is-visible");
      el.reaction.setAttribute("aria-hidden", "false");

      reactionEndTimer = setTimeout(function () {
        if (token !== sceneToken) return;

        el.reaction.classList.remove("is-visible");
        el.reaction.setAttribute("aria-hidden", "true");
        reactionEndTimer = null;
      }, line.reactionDuration || 1700);
    });
  }

  function getReadingPause(line) {
    const textLength = line.text.length;

    const pause = Math.max(
      TYPE.minimumReadingPause,
      Math.min(
        TYPE.maximumReadingPause,
        textLength * 42
      )
    );

    return pause +
      (line.reaction ? TYPE.reactionExtraPause : 0);
  }

  function updateHint() {
    if (finished) {
      el.hint.textContent = "TAP TO REPLAY";
    } else if (typing) {
      el.hint.textContent = "TAP TO REVEAL";
    } else {
      el.hint.textContent = "TAP TO CONTINUE";
    }
  }

  function scheduleNext(line, token) {
    clearNextTimer();

    if (paused || finished || token !== sceneToken) return;

    nextTimer = setTimeout(function () {
      nextTimer = null;

      if (paused || finished || token !== sceneToken) return;

      render(index + 1);
    }, getReadingPause(line));
  }

  function revealWholeLine() {
    clearTypeTimer();

    typeToken++;

    typing = false;
    lineComplete = true;
    revealedByTap = true;

    el.text.textContent = currentText;

    updateHint();

    el.status.textContent =
      "Line revealed · Tap again to continue";

    const line = story[index];

    if (line) {
      scheduleNext(line, sceneToken);
    }
  }

  function typeLine(line, token) {
    clearTypeTimer();

    typeToken++;

    const thisTypeToken = typeToken;
    currentText = line.text;

    typing = true;
    lineComplete = false;
    revealedByTap = false;

    el.text.textContent = "";
    updateHint();

    let characterIndex = 0;

    function typeNextCharacter() {
      if (
        paused ||
        token !== sceneToken ||
        thisTypeToken !== typeToken
      ) {
        return;
      }

      if (characterIndex >= currentText.length) {
        typing = false;
        lineComplete = true;

        el.text.textContent = currentText;
        updateHint();

        el.status.textContent =
          "Reading dialogue · Continuing automatically";

        scheduleNext(line, token);
        return;
      }

      const character = currentText.charAt(characterIndex);

      el.text.textContent += character;
      characterIndex++;

      let delay = TYPE.characterDelay;

      if (/[,.!?;:]/.test(character)) {
        delay += TYPE.punctuationPause;
      }

      if (/[.!?]/.test(character)) {
        delay += TYPE.sentencePause;
      }

      typeTimer = setTimeout(typeNextCharacter, delay);
    }

    /* Typing begins automatically; no tap is required. */
    typeNextCharacter();
  }

  function finish() {
    clearAllTimers();
    hideReaction();

    typing = false;
    lineComplete = true;
    finished = true;
    revealedByTap = false;

    el.hint.textContent = "TAP TO REPLAY";
    el.status.textContent =
      "Scene complete · Tap to watch again";

    el.advance.setAttribute("aria-label", "Replay dialogue");
  }

  function render(nextIndex) {
    clearAllTimers();
    hideReaction();

    sceneToken++;

    const token = sceneToken;

    if (nextIndex >= story.length) {
      index = story.length - 1;
      finish();
      return;
    }

    if (nextIndex < 0) {
      nextIndex = 0;
    }

    index = nextIndex;

    typing = false;
    lineComplete = false;
    finished = false;
    revealedByTap = false;

    const line = story[index];
    const character = characters[line.speaker];

    el.speaker.textContent = character.name;
    el.counter.textContent =
      String(index + 1).padStart(2, "0") +
      " / " +
      String(story.length).padStart(2, "0");

    el.status.textContent = "Automatic dialogue · Progressive typing";
    el.advance.setAttribute(
      "aria-label",
      "Reveal text or continue dialogue"
    );

    updatePortraits(line.speaker);
    showMainImage(line.speaker, token);

    /* The reaction and typing begin together for this line. */
    showReaction(line, token);
    typeLine(line, token);
  }

  function restart() {
    clearAllTimers();
    hideReaction();

    sceneToken++;
    typeToken++;

    index = 0;
    typing = false;
    lineComplete = false;
    finished = false;
    paused = false;
    revealedByTap = false;
    currentText = "";

    el.text.textContent = "";
    el.image.style.backgroundImage = "none";
    el.image.classList.remove("is-changing");

    render(0);
  }

  function revealOrContinue() {
    if (paused) return;

    const now = Date.now();

    /* Prevent a stage tap and button tap from counting twice. */
    if (now - lastTap < 250) return;
    lastTap = now;

    if (finished) {
      restart();
      return;
    }

    if (typing) {
      /* First tap during typing reveals the complete line. */
      revealWholeLine();
      return;
    }

    /* Once the line is complete, a tap advances immediately. */
    clearNextTimer();
    render(index + 1);
  }

  el.advance.addEventListener("click", function (event) {
    event.stopPropagation();
    revealOrContinue();
  });

  el.stage.addEventListener("click", function (event) {
    if (event.target.closest("button")) return;
    revealOrContinue();
  });

  el.restart.addEventListener("click", function (event) {
    event.stopPropagation();
    lastTap = Date.now();
    restart();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (paused) return;

      paused = true;

      clearAllTimers();
      hideReaction();

      return;
    }

    if (!paused) return;

    paused = false;

    if (finished) return;

    /*
     * When the player returns to the tab, reveal the current line
     * rather than making them wait through typing again.
     */
    if (typing) {
      clearTypeTimer();

      typeToken++;

      typing = false;
      lineComplete = true;
      revealedByTap = false;

      el.text.textContent = currentText;
      updateHint();
    }

    const line = story[index];

    if (line) {
      scheduleNext(line, sceneToken);
    }
  });

  buildPortraits();
  render(0);
})();
