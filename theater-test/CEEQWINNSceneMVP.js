/* =========================================================
   CEEQWINN SCENE MVP
   CEEQWINNSceneMVP.js

   Scene Stream
   Phone-first theatrical narrative
   ========================================================= */


/* =========================================================
   IMAGE LIBRARY
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


/* =========================================================
   STORY DATA

   The script controls the theatre.

   Each beat may contain:
   - speaker
   - text
   - image

   The image only changes when the script
   explicitly tells it to.
   ========================================================= */

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


/* =========================================================
   SETTINGS
   ========================================================= */

const TYPE_SPEED = 34;

const AUTO_ADVANCE_DELAY = 1500;

const SCENE_END_DELAY = 900;

const IMAGE_CROSSFADE_TIME = 650;


/* =========================================================
   PRELOAD
   ========================================================= */

function preloadImages() {

  Object.values(IMAGES).forEach((src) => {

    const image =
      new Image();

    image.src =
      src;

  });

}

preloadImages();


/* =========================================================
   SCENE STATE
   ========================================================= */

const sceneStates =
  new WeakMap();


/* =========================================================
   INITIALISE ONE SCENE
   ========================================================= */

function initialiseScene(
  sceneElement,
  storyData
) {

  const stage =
    sceneElement.querySelector(".scene-stage");

  const imageA =
    sceneElement.querySelector(".scene-image-a");

  const imageB =
    sceneElement.querySelector(".scene-image-b");

  const label =
    sceneElement.querySelector(".narration-label");

  const stream =
    sceneElement.querySelector(".narration-stream");

  const windowElement =
    sceneElement.querySelector(".narration-window");

  const interaction =
    sceneElement.querySelector(".scene-interaction");

  const hint =
    sceneElement.querySelector(".scene-hint");


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
      imageA.src,

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

      handleSceneTap(state);

    }
  );

}


/* =========================================================
   INITIALISE ALL SCENES
   ========================================================= */

document
  .querySelectorAll(".story-scene")
  .forEach((sceneElement) => {

    const sceneId =
      sceneElement.dataset.scene;

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

  });


/* =========================================================
   CROSSFADE VISUAL
   ========================================================= */

function crossfadeImage(
  state,
  nextImage
) {

  if (!nextImage) {
    return;
  }


  /*
    If the requested image is already
    showing, don't animate anything.
  */

  if (
    state.currentImage ===
    nextImage
  ) {
    return;
  }


  const incoming =
    state.imageLayer === "a"
      ? state.imageB
      : state.imageA;


  const outgoing =
    state.imageLayer === "a"
      ? state.imageA
      : state.imageB;


  /*
    Prepare incoming artwork.
  */

  incoming.onload =
    () => {

      incoming.style.opacity =
        "1";

      window.setTimeout(
        () => {

          outgoing.style.opacity =
            "0";

        },
        30
      );

    };


  incoming.src =
    nextImage;


  /*
    If the browser already has
    the image cached, onload can
    sometimes have already happened.
  */

  if (
    incoming.complete
  ) {

    incoming.style.opacity =
      "1";

    window.setTimeout(
      () => {

        outgoing.style.opacity =
          "0";

      },
      30
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
   TEXT STREAM POSITION
   ========================================================= */

function updateTextPosition(
  state
) {

  const overflow =
    state.stream.scrollHeight -
    state.windowElement.clientHeight;


  if (overflow > 0) {

    state.stream.style.transform =
      `translateY(-${overflow}px)`;

  } else {

    state.stream.style.transform =
      "translateY(0)";

  }

}


/* =========================================================
   ADD NEW LINE
   ========================================================= */

function createLine(
  state
) {

  const line =
    document.createElement("div");

  line.className =
    "narration-line";


  state.stream.appendChild(
    line
  );


  /*
    Keep only the newest few lines
    visually strong.

    Older material is allowed to
    exist in the stream, but the
    finite window clips it away.
  */

  const allLines =
    state.stream.querySelectorAll(
      ".narration-line"
    );


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
   OPEN NARRATION GLASS
   ========================================================= */

function openNarrationGlass(
  state
) {

  state.sceneElement.classList.add(
    "is-active"
  );

}


/* =========================================================
   TYPE A BEAT
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


  /*
    Visual change is explicit.
  */

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


    updateTextPosition(
      state
    );


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
   TAP HANDLER
   ========================================================= */

function handleSceneTap(
  state
) {

  if (state.finished) {
    return;
  }


  /*
    If the sentence is still typing,
    the first tap completes it.
  */

  if (state.typing) {

    finishCurrentLine(
      state
    );

    return;

  }


  /*
    If the sentence has finished,
    tapping advances immediately.
  */

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


  /*
    Give the final line a moment
    before declaring the scene complete.
  */

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
   SCENE ACTIVATION
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


  /*
    Start the first beat.
  */

  typeBeat(
    state
  );

}


/* =========================================================
   OBSERVE SCENES

   A scene begins when the reader
   reaches it.

   We deliberately do not start
   every scene at page load.
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
  .querySelectorAll(".story-scene")
  .forEach(
    scene => {

      observer.observe(
        scene
      );

    }
  );


/* =========================================================
   SAFETY START

   If a browser behaves strangely with
   IntersectionObserver, the first scene
   still starts.
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

   Recalculate the finite text window
   whenever the phone changes size/orientation.
   ========================================================= */

window.addEventListener(
  "resize",
  () => {

    sceneStates.forEach?.(
      () => {}
    );

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
