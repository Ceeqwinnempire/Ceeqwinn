/* =========================================================
   CEEQWINN SCENE STREAM
   MOBILE THEATRE MVP
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
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/lexis_red_dress.png.jpeg",

  father:
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/cinematic_character_portrait_p.jpeg"

};


/* =========================================================
   THE STORY
   ========================================================= */

/*
  This is intentionally small.

  Every beat says:

  WHO is speaking
  WHAT they say
  WHICH visual owns the moment

  The engine does the rest.
*/

const SCENE = [

  {
    speaker: "NARRATOR",

    text:
      "The curtain was already open when she arrived.",

    visual:
      "curtain"
  },


  {
    speaker: "NARRATOR",

    text:
      "That was strange. The theatre was never supposed to be open this late.",

    visual:
      "curtain"
  },


  {
    speaker: "NARRATOR",

    text:
      "Rain whispered against the glass doors behind her.",

    visual:
      "rain"
  },


  {
    speaker: "LEXIS",

    text:
      "Hello?",

    visual:
      "lexis"
  },


  {
    speaker: "LEXIS",

    text:
      "Is anyone here?",

    visual:
      "lexis"
  },


  {
    speaker: "NARRATOR",

    text:
      "She took one step forward. The red fabric at her sleeve caught the faint light.",

    visual:
      "lexisRed"
  },


  {
    speaker: "LEXIS",

    text:
      "I know somebody is here.",

    visual:
      "lexisRed"
  },


  {
    speaker: "FATHER",

    text:
      "You always were very good at finding what people wanted hidden.",

    visual:
      "father"
  },


  {
    speaker: "LEXIS",

    text:
      "Then don't hide it from me.",

    visual:
      "lexis"
  },


  {
    speaker: "NARRATOR",

    text:
      "For a moment, neither of them moved.",

    visual:
      "rain"
  },


  {
    speaker: "NARRATOR",

    text:
      "And somewhere beyond the curtain, something shifted.",

    visual:
      "curtain"
  }

];


/* =========================================================
   ELEMENTS
   ========================================================= */

const sceneImage =
  document.getElementById(
    "sceneImage"
  );

const sceneSpeaker =
  document.getElementById(
    "sceneSpeaker"
  );

const sceneTextStream =
  document.getElementById(
    "sceneTextStream"
  );

const sceneTimeline =
  document.getElementById(
    "sceneTimeline"
  );

const sceneTapHint =
  document.getElementById(
    "sceneTapHint"
  );


/* =========================================================
   STATE
   ========================================================= */

let currentBeat =
  -1;

let typingTimer =
  null;

let isTyping =
  false;

let currentText =
  "";

let sceneFinished =
  false;


/* =========================================================
   PRELOAD
   ========================================================= */

function preloadImages() {

  Object.values(IMAGES).forEach(
    src => {

      const image =
        new Image();

      image.src =
        src;

    }
  );

}

preloadImages();


/* =========================================================
   CREATE INVISIBLE SCROLL BEATS
   ========================================================= */

function buildTimeline() {

  SCENE.forEach(
    () => {

      const beat =
        document.createElement(
          "div"
        );

      beat.className =
        "scene-beat";

      sceneTimeline.appendChild(
        beat
      );

    }
  );

}

buildTimeline();


const sceneBeats =
  [
    ...document.querySelectorAll(
      ".scene-beat"
    )
  ];


/* =========================================================
   IMAGE CHANGE
   ========================================================= */

function changeVisual(
  imageKey
) {

  const nextImage =
    IMAGES[imageKey];

  if (
    !nextImage ||
    sceneImage.src === nextImage
  ) {

    return;

  }


  sceneImage.classList.add(
    "is-changing"
  );


  setTimeout(
    () => {

      sceneImage.onload =
        () => {

          sceneImage.classList.remove(
            "is-changing"
          );

        };


      sceneImage.src =
        nextImage;

    },
    260
  );

}


/* =========================================================
   SPEAKER
   ========================================================= */

function setSpeaker(
  speaker
) {

  sceneSpeaker.textContent =
    speaker;


  if (
    speaker === "NARRATOR"
  ) {

    sceneSpeaker.style.color =
      "#d7b66a";

  } else {

    sceneSpeaker.style.color =
      "#f2d39a";

  }

}


/* =========================================================
   ROLLING TEXT WINDOW
   ========================================================= */

/*
  THIS is the experiment.

  We never make the box taller.

  New lines are appended.

  Once there are too many lines,
  the oldest line is pushed upward
  and fades away.
*/

function addTextLine(
  text
) {

  const line =
    document.createElement(
      "div"
    );

  line.className =
    "scene-line";

  line.textContent =
    text;

  sceneTextStream.appendChild(
    line
  );


  requestAnimationFrame(
    () => {

      const lines =
        [
          ...sceneTextStream.children
        ];


      lines.forEach(
        (item, index) => {

          if (
            index <
            lines.length - 3
          ) {

            item.classList.add(
              "is-old"
            );

          }

        }
      );


      const windowHeight =
        document
          .getElementById(
            "sceneTextWindow"
          )
          .clientHeight;


      const streamHeight =
        sceneTextStream.scrollHeight;


      const overflow =
        Math.max(
          0,
          streamHeight -
          windowHeight
        );


      sceneTextStream.style.transform =
        `translateY(-${overflow}px)`;

    }
  );

}


/* =========================================================
   TYPEWRITER
   ========================================================= */

function typeText(
  text
) {

  return new Promise(
    resolve => {

      clearInterval(
        typingTimer
      );

      currentText =
        text;

      isTyping =
        true;


      /*
        We temporarily create the line
        and fill it character by character.
      */

      const line =
        document.createElement(
          "div"
        );

      line.className =
        "scene-line";

      sceneTextStream.appendChild(
        line
      );


      let index =
        0;


      typingTimer =
        setInterval(
          () => {

            if (
              index >=
              text.length
            ) {

              clearInterval(
                typingTimer
              );

              isTyping =
                false;

              currentText =
                "";

              resolve();

              return;
            }


            line.textContent +=
              text[index];

            index++;


            /*
              Keep the newest text visible
              while it is being written.
            */

            const windowElement =
              document.getElementById(
                "sceneTextWindow"
              );

            const overflow =
              Math.max(
                0,
                sceneTextStream.scrollHeight -
                windowElement.clientHeight
              );


            sceneTextStream.style.transform =
              `translateY(-${overflow}px)`;


          },
          38
        );

    }
  );

}


/* =========================================================
   PLAY ONE BEAT
   ========================================================= */

async function playBeat(
  index
) {

  if (
    sceneFinished
  ) {

    return;

  }


  if (
    index >=
    SCENE.length
  ) {

    finishScene();

    return;

  }


  currentBeat =
    index;


  const beat =
    SCENE[index];


  setSpeaker(
    beat.speaker
  );


  /*
    Visual and text belong
    to the same story beat.
  */

  changeVisual(
    beat.visual
  );


  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        350
      )
  );


  await typeText(
    beat.text
  );


  /*
    Small breathing space
    before the next thought.
  */

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        1000
      )
  );


  await playBeat(
    index + 1
  );

}


/* =========================================================
   START
   ========================================================= */

function startScene() {

  if (
    currentBeat !== -1
  ) {

    return;

  }


  playBeat(0);

}


/* =========================================================
   FINISH
   ========================================================= */

function finishScene() {

  sceneFinished =
    true;


  sceneTapHint.classList.remove(
    "is-visible"
  );


  sceneSpeaker.textContent =
    "SCENE COMPLETE";

}


/* =========================================================
   TAP TO FINISH CURRENT LINE
   ========================================================= */

function handleTap() {

  if (
    !isTyping
  ) {

    return;

  }


  clearInterval(
    typingTimer
  );


  /*
    Find the newest line.
  */

  const lines =
    sceneTextStream.children;


  const newestLine =
    lines[
      lines.length - 1
    ];


  if (
    newestLine
  ) {

    newestLine.textContent =
      currentText;

  }


  isTyping =
    false;

  currentText =
    "";

}


/* =========================================================
   START WHEN THE THEATRE ENTERS VIEW
   ========================================================= */

const sceneObserver =
  new IntersectionObserver(

    entries => {

      entries.forEach(
        entry => {

          if (
            entry.isIntersecting &&
            currentBeat === -1
          ) {

            startScene();

          }

        }
      );

    },

    {
      threshold: 0.35
    }

  );


sceneObserver.observe(
  document.getElementById(
    "sceneStream"
  )
);


/* =========================================================
   TAP
   ========================================================= */

document
  .getElementById("sceneStream")
  .addEventListener(
    "pointerdown",
    handleTap
  );


/* =========================================================
   READY
   ========================================================= */

console.log(
  "CEEQWINN Scene Stream Mobile MVP loaded."
);
