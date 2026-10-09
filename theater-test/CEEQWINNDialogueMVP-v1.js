(function () {
  "use strict";

  const IMAGE = {
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

  /*
   * Each beat is a small instruction to the director.
   * speaker: who owns the stage and speaks.
   * reaction: a temporary, silent reaction from another actor.
   * duration: approximate reading time in milliseconds.
   */
  const STORY = [
    {
      speaker: "lexis",
      text: "You said you had something important to tell me.",
      duration: 3500
    },
    {
      speaker: "mara",
      text: "I do. But first, promise you won't get angry.",
      duration: 3500
    },
    {
      speaker: "mara",
      text: "I may have told somebody something I was supposed to keep secret.",
      duration: 4200,
      reaction: "lexis",
      reactionLabel: "LEXIS · REACTION",
      reactionDuration: 1700
    },
    {
      speaker: "lexis",
      text: "You may have WHAT?",
      duration: 2300
    },
    {
      speaker: "mara",
      text: "When you repeat it like that, it sounds much worse.",
      duration: 3500,
      reaction: "lexis",
      reactionLabel: "LEXIS · UNIMPRESSED",
      reactionDuration: 1800
    },
    {
      speaker: "lexis",
      text: "Mara. Please tell me you are joking.",
      duration: 3000
    },
    {
      speaker: "mara",
      text: "I would. But then I'd be lying twice.",
      duration: 3000,
      reaction: "lexis",
      reactionLabel: "LEXIS · SILENT JUDGMENT",
      reactionDuration: 2000
    },
    {
      speaker: "lexis",
      text: "Sit down. We are going to discuss your definition of a secret.",
      duration: 4000
    }
  ];

  const TYPE = {
    imageFade: 650,
    defaultReadingTime: 3000,
    minimumReadingTime: 1500,
    maximumReadingTime: 7000
  };

  const el = {
    stage: document.querySelector(".scene-stage"),
    imageA: document.getElementById("stageImageA"),
    imageB: document.getElementById("stageImageB"),
    speakerName: document.getElementById("speakerName"),
    dialogueText: document.getElementById("dialogueText"),
    readingSweep: document.getElementById("readingSweep"),
    beatCounter: document.getElementById("beatCounter"),
    tapHint: document.getElementById("tapHint"),
    stageAdvance: document.getElementById("stageAdvance"),
    restartButton: document.getElementById("restartButton"),
    reactionShot: document.getElementById("reactionShot"),
    reactionImage: document.getElementById("reactionImage"),
    reactionName: document.getElementById("reactionName"),
    portraitList: document.getElementById("portraitList"),
    supportingPortraits: document.getElementById("supportingPortraits"),
    sceneIndicator: document.getElementById("sceneIndicator"),
    stageCaption: document.getElementById("stageCaption")
  };

  let beatIndex = 0;
  let imageLayer = "A";
  let currentSpeaker = null;
  let timer = null;
  let reactionTimer = null;
  let sweepFrame = null;
  let transitionToken = 0;
  let isFinished = false;
  let isPaused = false;
  let startedAt = 0;
  let remainingTime = 0;
  let currentDuration = TYPE.defaultReadingTime;

  function preload(url) {
    return new Promise(function (resolve) {
      const image = new Image();

      image.onload = function () {
        resolve(true);
      };

      image.onerror = function () {
        resolve(false);
      };

      image.src = url;

      if (image.complete && image.naturalWidth > 0) {
        resolve(true);
      }
    });
  }

  function preloadImages() {
    const urls = [
      IMAGE.lexis.main,
      IMAGE.lexis.portrait,
      IMAGE.lexis.reaction,
      IMAGE.mara.main,
      IMAGE.mara.portrait,
      IMAGE.mara.reaction
    ];

    return Promise.all(urls.map(preload));
  }

  function showMainImage(url) {
    const token = ++transitionToken;
    const incoming = imageLayer === "A" ? el.imageB : el.imageA;
    const outgoing = imageLayer === "A" ? el.imageA : el.imageB;

    incoming.classList.remove("is-visible");

    const image = new Image();

    image.onload = function () {
      if (token !== transitionToken) return;

      incoming.style.backgroundImage = 'url("' + url + '")';
      incoming.classList.add("is-visible");
      outgoing.classList.remove("is-visible");

      imageLayer = imageLayer === "A" ? "B" : "A";
    };

    image.onerror = function () {
      if (token !== transitionToken) return;

      // Keep the existing stage visible if a new image fails to load.
      incoming.classList.remove("is-visible");
    };

    image.src = url;

    if (image.complete && image.naturalWidth > 0) {
      incoming.style.backgroundImage = 'url("' + url + '")';
      incoming.classList.add("is-visible");
      outgoing.classList.remove("is-visible");
      imageLayer = imageLayer === "A" ? "B" : "A";
    }
  }

  function buildPortraits() {
    el.portraitList.innerHTML = "";

    Object.keys(IMAGE).forEach(function (key) {
      const character = IMAGE[key];
      const button = document.createElement("button");
      const img = document.createElement("img");
      const name = document.createElement("span");

      button.type = "button";
      button.className = "character-portrait";
      button.dataset.character = key;
      button.setAttribute("aria-label", character.name + " portrait");

      img.src = character.portrait;
      img.alt = "";

      name.textContent = character.name;

      button.appendChild(img);
      button.appendChild(name);
      el.portraitList.appendChild(button);
    });

    el.supportingPortraits.classList.add("has-portraits");
  }

  function updatePortraitStates() {
    const portraits = el.portraitList.querySelectorAll(".character-portrait");

    portraits.forEach(function (portrait) {
      const active = portrait.dataset.character === currentSpeaker;
      portrait.classList.toggle("is-speaking", active);
    });
  }

  function clearTimers() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }

    if (reactionTimer !== null) {
      clearTimeout(reactionTimer);
      reactionTimer = null;
    }

    if (sweepFrame !== null) {
      cancelAnimationFrame(sweepFrame);
      sweepFrame = null;
    }
  }

  function hideReaction() {
    if (reactionTimer !== null) {
      clearTimeout(reactionTimer);
      reactionTimer = null;
    }

    el.reactionShot.classList.remove("is-visible");
    el.reactionShot.setAttribute("aria-hidden", "true");
  }

  function showReaction(beat) {
    hideReaction();

    if (!beat.reaction) return;

    const character = IMAGE[beat.reaction];

    if (!character) return;

    el.reactionImage.onload = function () {
      el.reactionShot.classList.add("is-visible");
      el.reactionShot.setAttribute("aria-hidden", "false");
    };

    el.reactionImage.onerror = function () {
      hideReaction();
    };

    el.reactionImage.src = character.reaction;
    el.reactionImage.alt = character.name + " reaction";

    el.reactionName.textContent =
      beat.reactionLabel || character.name + " · REACTION";

    if (el.reactionImage.complete && el.reactionImage.naturalWidth > 0) {
      el.reactionShot.classList.add("is-visible");
      el.reactionShot.setAttribute("aria-hidden", "false");
    }

    reactionTimer = setTimeout(function () {
      hideReaction();
    }, beat.reactionDuration || 1800);
  }

  function startReadingSweep(duration) {
    if (sweepFrame !== null) {
      cancelAnimationFrame(sweepFrame);
    }

    const start = performance.now();
    const total = Math.max(
      TYPE.minimumReadingTime,
      Math.min(TYPE.maximumReadingTime, duration)
    );

    el.readingSweep.style.transition = "none";
    el.readingSweep.style.width = "0%";

    // Force a layout read so the next animation starts at zero.
    void el.readingSweep.offsetWidth;

    function animate(now) {
      if (isPaused || isFinished) {
        sweepFrame = null;
        return;
      }

      const progress = Math.min(1, (now - start) / total);

      el.readingSweep.style.width = (progress * 100) + "%";

      if (progress < 1) {
        sweepFrame = requestAnimationFrame(animate);
      } else {
        sweepFrame = null;
      }
    }

    sweepFrame = requestAnimationFrame(animate);
  }

  function getDuration(beat) {
    if (beat.duration) return beat.duration;

    const words = beat.text.trim().split(/\s+/).length;

    // A comfortable default, adjustable for individual story beats.
    return Math.max(
      TYPE.minimumReadingTime,
      Math.min(TYPE.maximumReadingTime, words * 330 + 800)
    );
  }

  function renderBeat(index) {
    clearTimers();
    hideReaction();

    if (index < 0 || index >= STORY.length) {
      finishScene();
      return;
    }

    beatIndex = index;
    isFinished = false;
    isPaused = false;

    const beat = STORY[beatIndex];
    const character = IMAGE[beat.speaker];

    if (!character) {
      finishScene();
      return;
    }

    const speakerChanged = currentSpeaker !== beat.speaker;
    currentSpeaker = beat.speaker;

    if (speakerChanged || index === 0) {
      showMainImage(character.main);
    }

    el.speakerName.textContent = character.name;
    el.dialogueText.textContent = beat.text;
    el.beatCounter.textContent =
      String(beatIndex + 1).padStart(2, "0") +
      " / " +
      String(STORY.length).padStart(2, "0");

    el.sceneIndicator.textContent =
      "THEATRE · " + String(beatIndex + 1).padStart(2, "0");

    el.tapHint.innerHTML = 'TAP TO CONTINUE <span>›</span>';
    el.stage.classList.remove("is-finished");

    updatePortraitStates();

    currentDuration = getDuration(beat);
    remainingTime = currentDuration;
    startedAt = performance.now();

    startReadingSweep(currentDuration);
    showReaction(beat);

    timer = setTimeout(function () {
      if (!isPaused && !isFinished) {
        el.tapHint.innerHTML = 'CONTINUE <span>›</span>';
      }
    }, currentDuration);
  }

  function nextBeat() {
    if (isFinished) {
      restartScene();
      return;
    }

    clearTimers();
    hideReaction();

    renderBeat(beatIndex + 1);
  }

  function finishScene() {
    clearTimers();
    hideReaction();

    isFinished = true;

    el.stage.classList.add("is-finished");
    el.speakerName.textContent = "THE END";
    el.dialogueText.textContent =
      "And that was only the beginning. Restart to watch the conversation again.";
    el.beatCounter.textContent = "COMPLETE";
    el.tapHint.innerHTML = 'REPLAY SCENE <span>↺</span>';
    el.readingSweep.style.width = "100%";

    el.sceneIndicator.textContent = "THEATRE · COMPLETE";
    el.stageCaption.textContent = "CEEQWINN Dialogue Theatre";
  }

  function restartScene() {
    clearTimers();
    hideReaction();

    beatIndex = 0;
    currentSpeaker = null;
    imageLayer = "A";
    isFinished = false;
    isPaused = false;

    el.imageA.classList.remove("is-visible");
    el.imageB.classList.remove("is-visible");

    renderBeat(0);
  }

  function pauseSweep() {
    if (isPaused || isFinished) return;

    isPaused = true;
    remainingTime = Math.max(
      0,
      currentDuration - (performance.now() - startedAt)
    );

    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }

    if (sweepFrame !== null) {
      cancelAnimationFrame(sweepFrame);
      sweepFrame = null;
    }
  }

  function resumeSweep() {
    if (!isPaused || isFinished) return;

    isPaused = false;
    startedAt = performance.now();

    startReadingSweep(remainingTime || currentDuration);
  }

  function init() {
    buildPortraits();

    el.stageAdvance.addEventListener("click", nextBeat);
    el.restartButton.addEventListener("click", restartScene);

    // Tapping the stage advances the story, except when tapping a control.
    el.stage.addEventListener("click", function (event) {
      if (event.target.closest("button")) return;
      nextBeat();
    });

    // The sweep can pause when the reader leaves the page.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        pauseSweep();
      } else {
        resumeSweep();
      }
    });

    preloadImages().then(function () {
      restartScene();
    });

    el.stageCaption.textContent = "A conversation after the rain.";
  }

  init();
})();

```javascript
/* CEEQWINN DIALOGUE MVP — AUTOPLAY v1 */
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

  /* Build the small circular PRESENT portraits. */
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

  /* Hide a reaction without affecting the speaking character. */
  function hideReaction() {
    clearTimeout(reactionTimer);
    reactionTimer = null;

    el.reaction.classList.remove("is-visible");
    el.reaction.setAttribute("aria-hidden", "true");
  }

  /* Display a temporary, silent reaction portrait. */
  function showReaction(beat, token) {
    hideReaction();

    if (!beat.reaction || !characters[beat.reaction]) return;

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

    el.reactionImage.src = character.reaction;
    el.reactionImage.alt = character.name + " reaction";

    el.reactionName.textContent =
      beat.reactionLabel || character.name + " · REACTION";

    if (el.reactionImage.complete &&
        el.reactionImage.naturalWidth > 0) {
      el.reaction.classList.add("is-visible");
      el.reaction.setAttribute("aria-hidden", "false");
    }

    reactionTimer = setTimeout(function () {
      if (token === sceneToken) hideReaction();
    }, beat.reactionDuration || 1800);
  }

  function scheduleNext(line) {
    clearTimeout(advanceTimer);

    const token = sceneToken;
    const beat = story[index];

    advanceTimer = setTimeout(function () {
      if (token !== sceneToken || paused || finished) return;
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
      if (token !== typeToken || paused || finished) return;

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

  function revealOrContinue() {
    const now = Date.now();

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
  }

  function restart() {
    clearTimers();
    hideReaction();

    index = 0;
    lastSpeaker = null;
    finished = false;
    paused = false;

    el.image.style.backgroundImage = "";
    el.image.classList.remove("is-changing");

    render(0);
  }

  el.advance.addEventListener("click", revealOrContinue);

  el.stage.addEventListener("click", function (event) {
    if (event.target.closest("button")) return;
    revealOrContinue();
  });

  el.restart.addEventListener("click", restart);

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

    // Resume without leaving a half-typed line on screen.
    el.text.textContent = story[index].text;
    typing = false;
    el.hint.textContent = "PLAYING AUTOMATICALLY";

    scheduleNext(story[index].text);
  });

  buildPortraits();
  render(0);
})();
```
