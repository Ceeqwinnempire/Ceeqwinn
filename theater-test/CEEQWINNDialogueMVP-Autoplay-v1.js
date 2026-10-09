
/* CEEQWINN DIALOGUE MVP — AUTOPLAY v1 */
(function () {
  "use strict";

  const root = document.getElementById("dialogueAutoplayV1");
  if (!root) return;

  const characters = {
    lexis: {
      name: "LEXIS",
      image: "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_militarily.jpg.jpeg"
    },
    mara: {
      name: "MARA",
      image: "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/young_woman_rainy_atmosphere_c%20(2).jpeg"
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
      reaction: "lexis"
    },
    {
      speaker: "lexis",
      text: "You may have WHAT?"
    },
    {
      speaker: "mara",
      text: "When you repeat it like that, it sounds much worse.",
      reaction: "lexis"
    },
    {
      speaker: "lexis",
      text: "Mara. Please tell me you are joking."
    },
    {
      speaker: "mara",
      text: "I would. But then I'd be lying twice.",
      reaction: "lexis"
    },
    {
      speaker: "lexis",
      text: "Sit down. We are going to discuss your definition of a secret."
    }
  ];

  const $ = id => document.getElementById(id);

  const image = $("autoplayImage");
  const speaker = $("autoplaySpeaker");
  const text = $("autoplayText");
  const counter = $("autoplayCounter");
  const hint = $("autoplayHint");
  const advance = $("autoplayAdvance");
  const status = $("autoplayStatus");

  let index = 0;
  let typingTimer = null;
  let advanceTimer = null;
  let reactionTimer = null;
  let typeToken = 0;
  let sceneToken = 0;
  let typing = false;
  let finished = false;
  let paused = false;
  let lastSpeaker = null;
  let lastTap = 0;

  // Text timing: comfortable progressive typing, not a golden sweep.
  const CHARACTER_DELAY = 30;
  const MINIMUM_READING_PAUSE = 1500;
  const MAXIMUM_READING_PAUSE = 4500;
  const SPEAKER_CHANGE_PAUSE = 450;

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
      MAXIMUM_READING_PAUSE,
      Math.max(MINIMUM_READING_PAUSE, words * 180)
    );
  }

  function showCharacter(key) {
    const character = characters[key];
    if (!character) return;

    image.classList.add("is-changing");

    const token = sceneToken;
    const preloader = new Image();

    preloader.onload = function () {
      if (token !== sceneToken) return;
      image.style.backgroundImage = 'url("' + character.image + '")';
      requestAnimationFrame(function () {
        if (token === sceneToken) {
          image.classList.remove("is-changing");
        }
      });
    };

    preloader.onerror = function () {
      if (token === sceneToken) {
        image.classList.remove("is-changing");
        status.textContent = "Image unavailable · Dialogue continues";
      }
    };

    preloader.src = character.image;

    if (preloader.complete && preloader.naturalWidth > 0) {
      image.style.backgroundImage = 'url("' + character.image + '")';
      image.classList.remove("is-changing");
    }
  }

  function typeLine(line, token) {
    typing = true;
    text.textContent = "";
    hint.textContent = "TAP TO REVEAL";

    let position = 0;

    function typeNextCharacter() {
      if (token !== typeToken || paused || finished) return;

      if (position >= line.length) {
        typing = false;
        hint.textContent = "PLAYING AUTOMATICALLY";
        scheduleNext(line);
        return;
      }

      text.textContent += line.charAt(position);
      position += 1;

      // Keep punctuation readable by allowing natural little pauses.
      const previous = line.charAt(position - 1);
      let delay = CHARACTER_DELAY;

      if (".!?".includes(previous)) delay = 240;
      else if (",;:".includes(previous)) delay = 120;

      typingTimer = setTimeout(typeNextCharacter, delay);
    }

    typeNextCharacter();
  }

  function scheduleNext(line) {
    clearTimeout(advanceTimer);

    const token = sceneToken;
    const beat = story[index];

    advanceTimer = setTimeout(function () {
      if (token !== sceneToken || paused || finished) return;
      render(index + 1);
    }, readingPause(line) + (beat.reaction ? 500 : 0));
  }

  function render(nextIndex) {
    clearTimers();
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

    if (lastSpeaker !== beat.speaker) {
      showCharacter(beat.speaker);
      lastSpeaker = beat.speaker;
    }

    speaker.textContent = character.name;
    counter.textContent =
      String(index + 1).padStart(2, "0") +
      " / " +
      String(story.length).padStart(2, "0");

    status.textContent = "Automatic dialogue · Progressive typing";
    typeLine(beat.text, typeToken);

    if (beat.reaction && characters[beat.reaction]) {
      status.textContent = "A silent reaction · Then the conversation continues";
      // This version keeps reactions understated; the next refinement can
      // add a dedicated portrait without changing the narration theatre.
      reactionTimer = setTimeout(function () {
        if (!paused && !finished) {
          status.textContent = "Automatic dialogue · Progressive typing";
        }
      }, 900);
    }
  }

  function revealOrContinue() {
    const now = Date.now();

    // Prevent a double event from advancing two lines on touch devices.
    if (now - lastTap < 250) return;
    lastTap = now;

    if (finished) {
      restart();
      return;
    }

    if (typing) {
      typeToken += 1;
      clearTimeout(typingTimer);
      typingTimer = null;
      typing = false;

      text.textContent = story[index].text;
      hint.textContent = "TAP TO CONTINUE";
      scheduleNext(story[index].text);
      return;
    }

    clearTimeout(advanceTimer);
    advanceTimer = null;
    render(index + 1);
  }

  function finish() {
    clearTimers();
    sceneToken += 1;
    typeToken += 1;
    typing = false;
    finished = true;

    speaker.textContent = "THE END";
    text.textContent =
      "And that was only the beginning. Tap to watch the conversation again.";
    counter.textContent = "COMPLETE";
    hint.textContent = "TAP TO REPLAY";
    status.textContent = "CEEQWINN Dialogue Theatre · Scene complete";
  }

  function restart() {
    clearTimers();
    index = 0;
    lastSpeaker = null;
    finished = false;
    paused = false;
    render(0);
  }

  advance.addEventListener("click", revealOrContinue);

  $("autoplayStage").addEventListener("click", function (event) {
    if (event.target.closest("button")) return;
    revealOrContinue();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      paused = true;
      clearTimers();
      typeToken += 1;
    } else if (paused && !finished) {
      paused = false;

      // Resume the current line without skipping text.
      const beat = story[index];
      if (beat) {
        text.textContent = beat.text;
        typing = false;
        hint.textContent = "PLAYING AUTOMATICALLY";
        scheduleNext(beat.text);
      }
    }
  });

  render(0);
})();
