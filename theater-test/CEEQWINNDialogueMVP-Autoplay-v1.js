
/* ==================================================
   CEEQWINN DIALOGUE MVP — AUTOPLAY v1
   Independent Theatre 2 controller
   ================================================== */

(function () {
  "use strict";

  const root = document.getElementById("dialogueAutoplayV1");
  if (!root) return;

  const characters = {
    lexis: {
      name: "LEXIS",
      main: "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_militarily.jpg.jpeg",
      portrait: "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/lexis_default.png",
      reaction: "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_street.jpg.jpeg"
    },
    mara: {
      name: "MARA",
      main: "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/young_woman_rainy_atmosphere_c%20(2).jpeg",
      portrait: "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/young_woman_rainy_atmosphere_c.jpeg",
      reaction: "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/young_woman_rainy_atmosphere_c.jpeg"
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
      text: "I may have told somebody something I was supposed to keep secret.",
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
      text: "When you repeat it like that, it sounds much worse.",
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
      text: "Sit down. We are going to discuss your definition of a secret."
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

  function $(id) {
    return root.querySelector("#" + id);
  }

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

  /* Fail safely if the required Theatre 2 markup is incomplete. */
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
    return;
  }

  let index = 0;
  let lastSpeaker = null;
  let typing = false;
  let finished = false;
  let paused = false;

  let typingTimer = null;
  let advanceTimer = null;
  let reactionTimer = null;

  let typeToken = 0;
  let sceneToken = 0;
  let lastTap = 0;

  function clearTimers() {
    clearTimeout(typingTimer);
    clearTimeout(advanceTimer);
    clearTimeout(reactionTimer);

    typingTimer = null;
    advanceTimer = null;
    reactionTimer = null;
  }

  function readingPause(line) {
    const words = line.trim().split(/\s+/).length;

    return Math.min(
      TYPE.maximumReadingPause,
      Math.max(TYPE.minimumReadingPause, words * 190)
    );
  }

  /* ------------------------------------------
     Main speaking character
     ------------------------------------------ */

  function showCharacter(key) {
    const character = characters[key];
    if (!character) return;

    const token = sceneToken;
    const preloader = new Image();

    el.image.classList.add("is-changing");

    preloader.onload = function () {
      if (token !== sceneToken) return;

      el.image.style.backgroundImage =
        'url("' + character.main + '")';

      requestAnimationFrame(function () {
        if (token === sceneToken) {
          el.image.classList.remove("is-changing");
        }
      });
    };

    preloader.onerror = function () {
      if (token !== sceneToken) return;

      el.image.classList.remove("is-changing");
      el.status.textContent =
        "Image unavailable · Dialogue continues";
    };

    preloader.src = character.main;

    if (preloader.complete && preloader.naturalWidth > 0) {
      el.image.style.backgroundImage =
        'url("' + character.main + '")';

      el.image.classList.remove("is-changing");
    }
  }

  /* ------------------------------------------
     PRESENT portraits
     ------------------------------------------ */

  function buildPortraits() {
    el.portraits.replaceChildren();

    Object.keys(characters).forEach(function (key) {
      const character = characters[key];
      const item = document.createElement("div");
      const img = document.createElement("img");
      const name = document.createElement("span");

      item.className = "autoplay-portrait";
      item.dataset.character = key;

      img.src = character.portrait;
      img.alt = "";
      img.loading = "eager";

      name.textContent = character.name;

      item.appendChild(img);
      item.appendChild(name);
      el.portraits.appendChild(item);
    });
  }

  function updatePortraits() {
    el.portraits
      .querySelectorAll(".autoplay-portrait")
      .forEach(function (item) {
        item.classList.toggle(
          "is-speaking",
          item.dataset.character === lastSpeaker
        );
      });
  }

  /* ------------------------------------------
     Silent reaction portrait
     ------------------------------------------ */

  function hideReaction() {
    clearTimeout(reactionTimer);
    reactionTimer = null;

    el.reaction.classList.remove("is-visible");
    el.reaction.setAttribute("aria-hidden", "true");
  }

  function showReaction(beat, token) {
    hideReaction();

    if (!beat.reaction || !characters[beat.reaction]) {
      return;
    }

    const character = characters[beat.reaction];

    el.reactionImage.onload = function () {
      if (token !== sceneToken) return;

      el.reaction.classList.add("is-visible");
      el.reaction.setAttribute("aria-hidden", "false");
    };

    el.reactionImage.onerror = function () {
      if (token !== sceneToken) return;
      hideReaction();
    };

    el.reactionName.textContent =
      beat.reactionLabel || character.name + " · REACTION";

    el.reactionImage.alt = character.name + " reaction";
    el.reactionImage.src = character.reaction;

    /* Cached images can already be ready. */
    if (
      el.reactionImage.complete &&
      el.reactionImage.naturalWidth > 0
    ) {
      el.reaction.classList.add("is-visible");
      el.reaction.setAttribute("aria-hidden", "false");
    }

    reactionTimer = setTimeout(function () {
      if (token === sceneToken) {
        hideReaction();
      }
    }, beat.reactionDuration || 1800);
  }

  /* ------------------------------------------
     Automatic progressive typing
     ------------------------------------------ */

  function scheduleNext(line) {
    clearTimeout(advanceTimer);

    const token = sceneToken;
    const beat = story[index];

    advanceTimer = setTimeout(function () {
      if (token !== sceneToken || paused || finished) {
        return;
      }

      render(index + 1);
    }, readingPause(line) +
       (beat.reaction ? TYPE.reactionExtraPause : 0));
  }

  function typeLine(line, token) {
    let position = 0;

    typing = true;
    el.text.textContent = "";
    el.hint.textContent = "TYPING…";

    function typeNextCharacter() {
      if (token !== typeToken || paused || finished) {
        return;
      }

      if (position >= line.length) {
        typing = false;
        el.hint.textContent = "PLAYING AUTOMATICALLY";
        scheduleNext(line);
        return;
      }

      const character = line.charAt(position);

      el.text.textContent += character;
      position += 1;

      let delay = TYPE.characterDelay;

      if (".!?".includes(character)) {
        delay = TYPE.sentencePause;
      } else if (",;:".includes(character)) {
        delay = TYPE.punctuationPause;
      }

      typingTimer = setTimeout(typeNextCharacter, delay);
    }

    typeNextCharacter();
  }

  /* ------------------------------------------
     Render one dialogue beat
     ------------------------------------------ */

  function render(nextIndex) {
    clearTimers();
    hideReaction();

    sceneToken += 1;
    typeToken += 1;

    if (nextIndex >= story.length) {
      finish();
      return;
    }

    index = nextIndex;
    finished = false;

    const beat = story[index];
    const character = characters[beat.speaker];

    if (!character) {
      finish();
      return;
    }

    const speakerChanged = lastSpeaker !== beat.speaker;
    lastSpeaker = beat.speaker;

    if (speakerChanged || index === 0) {
      showCharacter(beat.speaker);
    }

    el.speaker.textContent = character.name;

    el.counter.textContent =
      String(index + 1).padStart(2, "0") +
      " / " +
      String(story.length).padStart(2, "0");

    el.status.textContent =
      "Automatic dialogue · Progressive typing";

    updatePortraits();

    const token = typeToken;

    typeLine(beat.text, token);
    showReaction(beat, sceneToken);
  }

  /* ------------------------------------------
     Tap: reveal line, then continue
     ------------------------------------------ */

  function revealOrContinue() {
    const now = Date.now();

    /* Prevent a double tap from skipping two beats. */
    if (now - lastTap < 250) return;
    lastTap = now;

    if (finished) {
      restart();
      return;
    }

    if (paused) return;

    if (typing) {
      typeToken += 1;

      clearTimeout(typingTimer);
      typingTimer = null;

      typing = false;

      el.text.textContent = story[index].text;
      el.hint.textContent = "TAP TO CONTINUE";

      scheduleNext(story[index].text);
      return;
    }

    clearTimeout(advanceTimer);
    advanceTimer = null;

    render(index + 1);
  }

  /* ------------------------------------------
     End and restart
     ------------------------------------------ */

  function finish() {
    clearTimers();
    hideReaction();

    sceneToken += 1;
    typeToken += 1;

    typing = false;
    finished = true;

    el.speaker.textContent = "THE END";

    el.text.textContent =
      "And that was only the beginning. Tap to watch the conversation again.";

    el.counter.textContent = "COMPLETE";
    el.hint.textContent = "TAP TO REPLAY";

    el.status.textContent =
      "CEEQWINN Dialogue Theatre · Scene complete";

    updatePortraits();
  }

  function restart() {
    clearTimers();
    hideReaction();

    index = 0;
    lastSpeaker = null;
    finished = false;
    paused = false;

    sceneToken += 1;
    typeToken += 1;

    el.image.style.backgroundImage = "";
    el.image.classList.remove("is-changing");

    render(0);
  }

  /* ------------------------------------------
     Controls
     ------------------------------------------ */

  el.advance.addEventListener("click", revealOrContinue);

  el.stage.addEventListener("click", function (event) {
    if (event.target.closest("button")) return;
    revealOrContinue();
  });

  el.restart.addEventListener("click", restart);

  /* Pause while the page is hidden.
     Resume with the complete current line visible. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (paused || finished) return;

      paused = true;
      clearTimers();

      typeToken += 1;
      hideReaction();
      return;
    }

    if (!paused || finished) return;

    paused = false;

    el.text.textContent = story[index].text;
    typing = false;
    el.hint.textContent = "PLAYING AUTOMATICALLY";

    scheduleNext(story[index].text);
  });

  /* Start Theatre 2 independently. */
  buildPortraits();
  render(0);

})();
