```javascript
/* =========================================================
   CEEQWINN SCENE MVP
   CEEQWINNSceneMVP.js

   Scene Stream
   Phone-first theatrical narrative
   Low-spec / older-browser defensive version
   ========================================================= */

const IMAGES = {

  curtain:
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/Luxurious_royal_theatre_curtai%20(1).jpeg",

  rain:
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/rainy_atmosphere_cinematic_rai.jpeg",

  lexis:
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_soft.jpg.jpeg",

  lexisRed:
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/lexis_red_dress.png.jpeg"

};

const STORY = [

  {
    scene: "scene-01",

    beats: [

      {
        speaker: "THE THEATRE",
        text: "The curtain was already open when she arrived.",
        image: IMAGES.curtain
      },

      {
        speaker: "THE THEATRE",
        text: "That was strange. The theatre was never supposed to be open this late.",
        image: IMAGES.curtain
      },

      {
        speaker: "THE THEATRE",
        text: "Rain whispered against the glass doors behind her.",
        image: IMAGES.rain
      },

      {
        speaker: "THE THEATRE",
        text: "She stopped beneath the doorway.",
        image: IMAGES.rain
      }

    ]

  },

  {
    scene: "scene-02",

    beats: [

      {
        speaker: "THE THEATRE",
        text: "Lexis stepped inside.",
        image: IMAGES.lexis
      },

      {
        speaker: "THE THEATRE",
        text: "The silence seemed to notice her before anyone else did.",
        image: IMAGES.lexis
      },

      {
        speaker: "LEXIS",
        text: "Hello?",
        image: IMAGES.lexis
      },

      {
        speaker: "LEXIS",
        text: "Is anyone here?",
        image: IMAGES.lexisRed
      },

      {
        speaker: "THE THEATRE",
        text: "The red fabric at her sleeve caught the faint light.",
        image: IMAGES.lexisRed
      }

    ]

  },

  {
    scene: "scene-03",

    beats: [

      {
        speaker: "THE THEATRE",
        text: "Somewhere beyond the curtain, something shifted.",
        image: IMAGES.curtain
      },

      {
        speaker: "LEXIS",
        text: "I know somebody is here.",
        image: IMAGES.lexisRed
      },

      {
        speaker: "LEXIS",
        text: "Then don't hide it from me.",
        image: IMAGES.lexis
      },

      {
        speaker: "THE THEATRE",
        text: "For a moment, neither of them moved.",
        image: IMAGES.rain
      }

    ]

  }

];

const TYPE_SPEED =
  34;

const AUTO_ADVANCE_DELAY =
  1500;

const SCENE_END_DELAY =
  900;

const IMAGE_CROSSFADE_TIME =
  650;


/* =========================================================
   IMAGE PRELOADING
   ========================================================= */

function preloadImages() {

  Object.values(IMAGES).forEach(
    (src) => {

      const image =
        new Image();

      image.src =
        src;

    }
  );

}

preloadImages();


/* =========================================================
   STATE
   ========================================================= */

const sceneStates =
  new WeakMap();


function initialiseScene(
  sceneElement,
  storyData
) {

  const stage =
    sceneElement.querySelector(
      ".scene-stage"
    );

  const imageA =
    sceneElement.querySelector(
      ".scene-image-a"
    );

  const imageB =
    sceneElement.querySelector(
      ".scene-image-b"
    );

  const label =
    sceneElement.querySelector(
      ".narration-label"
    );

  const stream =
    sceneElement.querySelector(
      ".narration-stream"
    );

  const windowElement =
    sceneElement.querySelector(
      ".narration-window"
    );

  const interaction =
    sceneElement.querySelector(
      ".scene-interaction"
    );

  const hint =
    sceneElement.querySelector(
      ".scene-hint"
    );

  const completionMark =
    document.createElement(
      "div"
    );

  completionMark.className =
    "scene-complete-mark";

  completionMark.setAttribute(
    "aria-hidden",
    "true"
  );

  const narrationInner =
    sceneElement.querySelector(
      ".narration-inner"
    );

  if (narrationInner) {

    narrationInner.appendChild(
      completionMark
    );

  }


  /*
    Start with both image layers completely hidden.
    The first beat will explicitly load the first image.
  */

  imageA.style.opacity =
    "0";

  imageB.style.opacity =
    "0";


  const state = {

    sceneElement,

    stage,

    imageA,

    imageB,

    label,

    stream,

    windowElement,

    interaction,

    hint,

    completionMark,

    beats:
      storyData.beats,

    beatIndex:
      0,

    currentLine:
      null,

    currentText:
      "",

    currentCharacter:
      0,

    typing:
      false,

    active:
      false,

    finished:
      false,

    autoTimer:
      null,

    typingTimer:
      null,

    currentImage:
      "",

    imageLayer:
      "a"

  };


  sceneStates.set(
    sceneElement,
    state
  );


  interaction.addEventListener(
    "click",
    () => {

      handleSceneTap(
        state
      );

    }
  );

}


/* =========================================================
   INITIALISE ALL SCENES
   ========================================================= */

document
  .querySelectorAll(
    ".story-scene"
  )
  .forEach(
    (sceneElement) => {

      const storyData =
        STORY.find(
          item =>
            item.scene ===
            sceneElement.id
        );

      if (!storyData) {
        return;
      }

      initialiseScene(
        sceneElement,
        storyData
      );

    }
  );


/* =========================================================
   IMAGE CROSSFADE
   ========================================================= */

function crossfadeImage(
  state,
  nextImage
) {

  if (!nextImage) {
    return;
  }

  if (
    state.currentImage ===
    nextImage
  ) {
    return;
  }


  const incoming =
    state.imageLayer === "a"
      ? state.imageA
      : state.imageB;

  const outgoing =
    state.imageLayer === "a"
      ? state.imageB
      : state.imageA;


  /*
    Prepare incoming image before revealing it.
  */

  incoming.style.opacity =
    "0";


  incoming.onload =
    () => {

      incoming.style.opacity =
        "1";

      window.setTimeout(
        () => {

          outgoing.style.opacity =
            "0";

        },
        IMAGE_CROSSFADE_TIME
      );

    };


  incoming.onerror =
    () => {

      /*
        Do not leave the theatre permanently blank
        if an older browser has trouble loading the
        image through the normal event path.
      */

      incoming.style.opacity =
        "1";

    };


  incoming.src =
    nextImage;


  /*
    Older / low-spec browsers may already have the
    image cached before onload is assigned.
  */

  if (
    incoming.complete &&
    incoming.naturalWidth > 0
  ) {

    incoming.style.opacity =
      "1";

    window.setTimeout(
      () => {

        outgoing.style.opacity =
          "0";

      },
      IMAGE_CROSSFADE_TIME
    );

  }


  state.imageLayer =
    state.imageLayer === "a"
      ? "b"
      : "a";

  state.currentImage =
    nextImage;

}


/* =========================================================
   TEXT POSITIONING
   ========================================================= */

function updateTextPosition(
  state
) {

  const lines =
    state.stream.querySelectorAll(
      ".narration-line"
    );

  const lineCount =
    lines.length;

  const streamHeight =
    state.stream.scrollHeight;

  const windowHeight =
    state.windowElement.clientHeight;

  const preferredTop =
    windowHeight * 0.42;


  /*
    FIRST TWO LINES

    They stay together.
    The second line NEVER pushes the first line upward.
  */

  if (lineCount <= 2) {

    state.stream.style.transform =
      "translateY(" +
      preferredTop +
      "px)";

    return;

  }


  /*
    THIRD LINE ONWARD

    Only now is upward movement allowed.
    The newest complete line remains inside
    the visible narration window.
  */

  const maximumSafeTop =
    windowHeight -
    streamHeight;

  const actualTop =
    Math.min(
      preferredTop,
      maximumSafeTop
    );


  state.stream.style.transform =
    "translateY(" +
    actualTop +
    "px)";

}


/* =========================================================
   CREATE NARRATION LINE
   ========================================================= */

function createLine(
  state
) {

  const line =
    document.createElement(
      "div"
    );

  line.className =
    "narration-line";


  /*
    Add the new line first.
    We DO NOT reposition the stream while the
    previous text is still being visually established.
  */

  state.stream.appendChild(
    line
  );


  const allLines =
    state.stream.querySelectorAll(
      ".narration-line"
    );


  /*
    Only older lines fade.
    The newest two remain fully readable.
  */

  allLines.forEach(
    (item, index) => {

      if (
        index <
        allLines.length - 2
      ) {

        item.classList.add(
          "is-old"
        );

      }

    }
  );


  return line;

}


/* =========================================================
   OPEN NARRATION
   ========================================================= */

function openNarrationGlass(
  state
) {

  state.sceneElement.classList.add(
    "is-active"
  );

}


/* =========================================================
   TYPE BEAT
   ========================================================= */

function typeBeat(
  state
) {

  clearTimeout(
    state.typingTimer
  );

  clearTimeout(
    state.autoTimer
  );


  const beat =
    state.beats[
      state.beatIndex
    ];


  if (!beat) {

    finishScene(
      state
    );

    return;

  }


  state.label.textContent =
    beat.speaker;


  crossfadeImage(
    state,
    beat.image
  );


  openNarrationGlass(
    state
  );


  const line =
    createLine(
      state
    );


  state.currentLine =
    line;

  state.currentText =
    beat.text;

  state.currentCharacter =
    0;

  state.typing =
    true;


  /*
    IMPORTANT:

    Position the stream ONCE when the new line
    is created.

    We do NOT call updateTextPosition() for every
    character anymore.

    This prevents the text from physically moving
    halfway through a line while it is typing.
  */

  updateTextPosition(
    state
  );


  function typeNext() {

    if (!state.typing) {
      return;
    }


    if (
      state.currentCharacter >=
      state.currentText.length
    ) {

      state.typing =
        false;


      /*
        Now that the complete sentence exists,
        we can safely make one final position check.
      */

      updateTextPosition(
        state
      );


      scheduleAdvance(
        state
      );

      return;

    }


    line.textContent +=
      state.currentText[
        state.currentCharacter
      ];

    state.currentCharacter++;


    /*
      DELIBERATELY NO updateTextPosition() HERE.

      The stream must not jump or reveal half-lines
      while the sentence is being typed.
    */

    state.typingTimer =
      window.setTimeout(
        typeNext,
        TYPE_SPEED
      );

  }


  typeNext();

}


/* =========================================================
   FINISH CURRENT LINE
   ========================================================= */

function finishCurrentLine(
  state
) {

  if (!state.typing) {
    return;
  }


  clearTimeout(
    state.typingTimer
  );


  if (state.currentLine) {

    state.currentLine.textContent =
      state.currentText;

  }


  state.currentCharacter =
    state.currentText.length;

  state.typing =
    false;


  updateTextPosition(
    state
  );


  scheduleAdvance(
    state
  );

}


/* =========================================================
   AUTO ADVANCE
   ========================================================= */

function scheduleAdvance(
  state
) {

  clearTimeout(
    state.autoTimer
  );


  state.autoTimer =
    window.setTimeout(
      () => {

        nextBeat(
          state
        );

      },
      AUTO_ADVANCE_DELAY
    );

}


/* =========================================================
   NEXT BEAT
   ========================================================= */

function nextBeat(
  state
) {

  if (state.finished) {
    return;
  }


  clearTimeout(
    state.autoTimer
  );


  state.beatIndex++;


  if (
    state.beatIndex >=
    state.beats.length
  ) {

    finishScene(
      state
    );

    return;

  }


  typeBeat(
    state
  );

}


/* =========================================================
   TAP
   ========================================================= */

function handleSceneTap(
  state
) {

  if (state.finished) {
    return;
  }


  if (state.typing) {

    finishCurrentLine(
      state
    );

    return;

  }


  nextBeat(
    state
  );

}


/* =========================================================
   FINISH SCENE
   ========================================================= */

function finishScene(
  state
) {

  if (state.finished) {
    return;
  }


  state.finished =
    true;

  state.typing =
    false;


  clearTimeout(
    state.typingTimer
  );

  clearTimeout(
    state.autoTimer
  );


  window.setTimeout(
    () => {

      state.sceneElement.classList.add(
        "scene-finished"
      );

      state.hint.style.opacity =
        "1";

    },
    SCENE_END_DELAY
  );

}


/* =========================================================
   ACTIVATE SCENE
   ========================================================= */

function activateScene(
  state
) {

  if (state.active) {
    return;
  }

  if (state.finished) {
    return;
  }


  state.active =
    true;


  state.sceneElement.classList.add(
    "is-active"
  );


  typeBeat(
    state
  );

}


/* =========================================================
   SCENE OBSERVER
   ========================================================= */

const observer =
  new IntersectionObserver(
    (entries) => {

      entries.forEach(
        (entry) => {

          if (
            !entry.isIntersecting
          ) {
            return;
          }


          const state =
            sceneStates.get(
              entry.target
            );


          if (!state) {
            return;
          }


          activateScene(
            state
          );

        }
      );

    },
    {
      threshold: 0.35
    }
  );


document
  .querySelectorAll(
    ".story-scene"
  )
  .forEach(
    scene => {

      observer.observe(
        scene
      );

    }
  );


/* =========================================================
   FIRST SCENE FALLBACK
   ========================================================= */

window.addEventListener(
  "load",
  () => {

    const firstScene =
      document.querySelector(
        ".story-scene"
      );


    if (!firstScene) {
      return;
    }


    const firstState =
      sceneStates.get(
        firstScene
      );


    if (
      firstState &&
      !firstState.active
    ) {

      window.setTimeout(
        () => {

          activateScene(
            firstState
          );

        },
        350
      );

    }

  }
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
  "resize",
  () => {

    document
      .querySelectorAll(
        ".story-scene"
      )
      .forEach(
        scene => {

          const state =
            sceneStates.get(
              scene
            );


          if (state) {

            updateTextPosition(
              state
            );

          }

        }
      );

  }
);
```
