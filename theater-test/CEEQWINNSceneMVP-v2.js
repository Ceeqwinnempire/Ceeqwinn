/* =========================================================
   CEEQWINN SCENE MVP v2
   CEEQWINNSceneMVP-v2.js

   Same theatrical experience.
   More defensive loading and browser compatibility.
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
        text:
          "The curtain was already open when she arrived.",
        image: IMAGES.curtain
      },

      {
        speaker: "THE THEATRE",
        text:
          "That was strange. The theatre was never supposed to be open this late.",
        image: IMAGES.curtain
      },

      {
        speaker: "THE THEATRE",
        text:
          "Rain whispered against the glass doors behind her.",
        image: IMAGES.rain
      },

      {
        speaker: "THE THEATRE",
        text:
          "She stopped beneath the doorway.",
        image: IMAGES.rain
      }

    ]

  },


  {
    scene: "scene-02",

    beats: [

      {
        speaker: "THE THEATRE",
        text:
          "Lexis stepped inside.",
        image: IMAGES.lexis
      },

      {
        speaker: "THE THEATRE",
        text:
          "The silence seemed to notice her before anyone else did.",
        image: IMAGES.lexis
      },

      {
        speaker: "LEXIS",
        text:
          "Hello?",
        image: IMAGES.lexis
      },

      {
        speaker: "LEXIS",
        text:
          "Is anyone here?",
        image: IMAGES.lexisRed
      },

      {
        speaker: "THE THEATRE",
        text:
          "The red fabric at her sleeve caught the faint light.",
        image: IMAGES.lexisRed
      }

    ]

  },


  {
    scene: "scene-03",

    beats: [

      {
        speaker: "THE THEATRE",
        text:
          "Somewhere beyond the curtain, something shifted.",
        image: IMAGES.curtain
      },

      {
        speaker: "LEXIS",
        text:
          "I know somebody is here.",
        image: IMAGES.lexisRed
      },

      {
        speaker: "LEXIS",
        text:
          "Then don't hide it from me.",
        image: IMAGES.lexis
      },

      {
        speaker: "THE THEATRE",
        text:
          "For a moment, neither of them moved.",
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
   SCENE STATE
   ========================================================= */

const sceneStates =
  new WeakMap();


/* =========================================================
   IMAGE LOADING
   ========================================================= */

function loadImage(
  src,
  callback
) {

  if (!src) {
    return;
  }

  const image =
    new Image();

  let finished =
    false;

  function done() {

    if (finished) {
      return;
    }

    finished = true;

    if (callback) {
      callback();
    }

  }

  image.onload =
    done;

  image.onerror =
    done;

  image.src =
    src;

}


/*
  Load only the images needed by the current
  and immediately upcoming story beat.

  We deliberately do NOT preload the entire
  story at startup.
*/
function prepareNearbyImage(
  state
) {

  const current =
    state.beats[
      state.beatIndex
    ];

  const next =
    state.beats[
      state.beatIndex + 1
    ];

  if (current) {
    loadImage(
      current.image
    );
  }

  if (next) {
    loadImage(
      next.image
    );
  }

}


/* =========================================================
   SCENE INITIALISATION
   ========================================================= */

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


  /*
    Completion signal.
  */

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
    function () {

      handleSceneTap(
        state
      );

    }
  );


  /*
    Prepare the first visual.
  */

  prepareNearbyImage(
    state
  );

}


/* =========================================================
   BUILD SCENES
   ========================================================= */

const sceneElements =
  document.querySelectorAll(
    ".story-scene"
  );


for (
  let i = 0;
  i < sceneElements.length;
  i++
) {

  const sceneElement =
    sceneElements[i];

  const storyData =
    STORY.find(
      function (item) {

        return (
          item.scene ===
          sceneElement.id
        );

      }
    );

  if (!storyData) {
    continue;
  }

  initialiseScene(
    sceneElement,
    storyData
  );

}


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
      ? state.imageB
      : state.imageA;

  const outgoing =
    state.imageLayer === "a"
      ? state.imageA
      : state.imageB;


  /*
    Make sure the incoming layer is ready
    before showing it.
  */

  incoming.style.opacity =
    "0";


  let completed =
    false;


  function revealIncoming() {

    if (completed) {
      return;
    }

    completed =
      true;


    incoming.style.opacity =
      "1";


    window.setTimeout(
      function () {

        outgoing.style.opacity =
          "0";

      },
      30
    );

  }


  incoming.onload =
    revealIncoming;

  incoming.onerror =
    function () {

      /*
        If an image fails, don't leave the
        entire theatre stuck waiting for it.
      */

      completed =
        true;

      incoming.style.opacity =
        "0";

    };


  incoming.src =
    nextImage;


  /*
    Some browsers report the image as complete
    immediately after the source is already cached.
  */

  if (
    incoming.complete &&
    incoming.naturalWidth
  ) {

    revealIncoming();

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


  if (
    lineCount <= 2
  ) {

    state.stream.style.transform =
      "translateY(" +
      preferredTop +
      "px)";

    return;

  }


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


  state.stream.appendChild(
    line
  );


  const allLines =
    state.stream.querySelectorAll(
      ".narration-line"
    );


  for (
    let i = 0;
    i < allLines.length;
    i++
  ) {

    if (
      i <
      allLines.length - 2
    ) {

      allLines[i].classList.add(
        "is-old"
      );

    }

  }


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


  prepareNearbyImage(
    state
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
    Position once before typing.
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
      IMPORTANT:
      We no longer force a layout measurement
      after every single character.

      The text itself still types exactly as before.
    */

    if (
      state.currentCharacter ===
      1 ||
      state.currentCharacter %
      4 === 0
    ) {

      updateTextPosition(
        state
      );

    }


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
      function () {

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
    function () {

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

  if (!state) {
    return;
  }


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
   INTERSECTION OBSERVER
   =========================================================

   Modern browsers use it.

   Older browsers use the fallback below.
   ========================================================= */

if (
  "IntersectionObserver" in window
) {

  const observer =
    new IntersectionObserver(
      function (entries) {

        for (
          let i = 0;
          i < entries.length;
          i++
        ) {

          const entry =
            entries[i];


          if (
            !entry.isIntersecting
          ) {
            continue;
          }


          const state =
            sceneStates.get(
              entry.target
            );


          if (!state) {
            continue;
          }


          activateScene(
            state
          );

        }

      },
      {
        threshold: 0.35
      }
    );


  for (
    let i = 0;
    i < sceneElements.length;
    i++
  ) {

    observer.observe(
      sceneElements[i]
    );

  }

}


/* =========================================================
   OLD-BROWSER / SIMPLE ACTIVATION FALLBACK
   ========================================================= */

function activateVisibleScenes() {

  const viewportHeight =
    window.innerHeight ||
    document.documentElement.clientHeight;


  for (
    let i = 0;
    i < sceneElements.length;
    i++
  ) {

    const scene =
      sceneElements[i];

    const state =
      sceneStates.get(
        scene
      );


    if (!state || state.active) {
      continue;
    }


    const rect =
      scene.getBoundingClientRect();


    const visibleHeight =
      Math.min(
        rect.bottom,
        viewportHeight
      ) -
      Math.max(
        rect.top,
        0
      );


    const sceneHeight =
      rect.height ||
      viewportHeight;


    if (
      visibleHeight /
      sceneHeight >=
      0.35
    ) {

      activateScene(
        state
      );

    }

  }

}


/*
  If IntersectionObserver doesn't exist,
  activate scenes using the fallback.
*/

if (
  !(
    "IntersectionObserver"
    in window
  )
) {

  window.addEventListener(
    "scroll",
    activateVisibleScenes
  );

  window.addEventListener(
    "resize",
    activateVisibleScenes
  );

}


/* =========================================================
   FIRST SCENE
   ========================================================= */

window.addEventListener(
  "load",
  function () {

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
        function () {

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
  function () {

    for (
      let i = 0;
      i < sceneElements.length;
      i++
    ) {

      const state =
        sceneStates.get(
          sceneElements[i]
        );


      if (state) {

        updateTextPosition(
          state
        );

      }

    }


    if (
      !(
        "IntersectionObserver"
        in window
      )
    ) {

      activateVisibleScenes();

    }

  }
);
