/* =========================================================
   CEEQWINN SCENE STREAM MVP
   SceneStreamMVP.js
   ========================================================= */


/* ---------------------------------------------------------
   IMAGE LIBRARY
   --------------------------------------------------------- */

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


/* ---------------------------------------------------------
   THE TEST STORY
   --------------------------------------------------------- */

const SCENE = [

  {
    speaker: "THEATRE",
    text: "The curtain was already open when she arrived.",
    image: IMAGES.curtain
  },

  {
    speaker: "THEATRE",
    text: "That was strange. The theatre was never supposed to be open this late.",
    image: IMAGES.curtain
  },

  {
    speaker: "THEATRE",
    text: "Rain whispered against the glass doors behind her.",
    image: IMAGES.rain
  },

  {
    speaker: "LEXIS",
    text: "Hello?",
    image: IMAGES.lexis
  },

  {
    speaker: "LEXIS",
    text: "Is anyone here?",
    image: IMAGES.lexis
  },

  {
    speaker: "THEATRE",
    text: "She took one step forward.",
    image: IMAGES.lexisRed
  },

  {
    speaker: "THEATRE",
    text: "The red fabric at her sleeve caught the faint light.",
    image: IMAGES.lexisRed
  },

  {
    speaker: "LEXIS",
    text: "I know somebody is here.",
    image: IMAGES.lexisRed
  },

  {
    speaker: "FATHER",
    text: "You always were very good at finding what people wanted hidden.",
    image: IMAGES.father
  },

  {
    speaker: "LEXIS",
    text: "Then don't hide it from me.",
    image: IMAGES.lexis
  },

  {
    speaker: "THEATRE",
    text: "For a moment, neither of them moved.",
    image: IMAGES.rain
  },

  {
    speaker: "THEATRE",
    text: "And somewhere beyond the curtain, something shifted.",
    image: IMAGES.curtain
  }

];


/* ---------------------------------------------------------
   ELEMENTS
   --------------------------------------------------------- */

const sceneStage =
  document.getElementById("sceneStage");

const sceneImage =
  document.getElementById("sceneImage");

const sceneSpeaker =
  document.getElementById("sceneSpeaker");

const sceneTextWindow =
  document.getElementById("sceneTextWindow");

const sceneTextStream =
  document.getElementById("sceneTextStream");

const sceneTapArea =
  document.getElementById("sceneTapArea");

const sceneTapHint =
  document.getElementById("sceneTapHint");

const sceneEnding =
  document.getElementById("sceneEnding");


/* ---------------------------------------------------------
   STATE
   --------------------------------------------------------- */

let currentBeat = 0;

let typingTimer = null;

let currentText = "";

let currentCharacter = 0;

let isTyping = false;

let sceneStarted = false;

let sceneFinished = false;

let advanceTimer = null;


/* ---------------------------------------------------------
   IMAGE PRELOAD
   --------------------------------------------------------- */

function preloadImages() {

  Object.values(IMAGES).forEach((src) => {

    const image = new Image();

    image.src = src;

  });

}

preloadImages();


/* ---------------------------------------------------------
   IMAGE CHANGE
   --------------------------------------------------------- */

function changeImage(src) {

  if (!src) {
    return;
  }

  if (sceneImage.src === src) {
    return;
  }

  sceneImage.style.opacity = "0";

  window.setTimeout(() => {

    sceneImage.src = src;

    sceneImage.onload = () => {

      sceneImage.style.opacity = "1";

    };

  }, 300);

}


/* ---------------------------------------------------------
   TEXT WINDOW POSITION
   --------------------------------------------------------- */

function keepTextAtBottom() {

  /*
    We deliberately keep the newest text at the bottom.

    Anything older than the visible window is clipped away.
    This is the core "finite theatre text" behavior.
  */

  const overflow =
    sceneTextStream.scrollHeight -
    sceneTextWindow.clientHeight;

  if (overflow > 0) {

    sceneTextStream.style.transform =
      `translateY(-${overflow}px)`;

  } else {

    sceneTextStream.style.transform =
      "translateY(0)";

  }

}


/* ---------------------------------------------------------
   ADD TEXT LINE
   --------------------------------------------------------- */

function addTextLine(text) {

  const line =
    document.createElement("div");

  line.className =
    "scene-line";

  line.textContent =
    text;

  sceneTextStream.appendChild(line);


  /*
    Older lines remain physically inside the stream,
    but the finite window clips them away.
  */

  const lines =
    sceneTextStream.querySelectorAll(".scene-line");

  lines.forEach((item, index) => {

    if (index < lines.length - 2) {

      item.classList.add("is-old");

    }

  });


  keepTextAtBottom();

  return line;

}


/* ---------------------------------------------------------
   TYPE CURRENT LINE
   --------------------------------------------------------- */

function typeCurrentBeat() {

  clearTimeout(typingTimer);

  const beat =
    SCENE[currentBeat];

  if (!beat) {
    finishScene();
    return;
  }


  sceneSpeaker.textContent =
    beat.speaker;

  changeImage(beat.image);


  const line =
    addTextLine("");


  currentText =
    beat.text;

  currentCharacter =
    0;

  isTyping =
    true;


  function typeNextCharacter() {

    if (!isTyping) {
      return;
    }


    if (currentCharacter >= currentText.length) {

      isTyping =
        false;

      /*
        Give the reader a moment to actually see
        the completed sentence.
      */

      scheduleAutomaticAdvance();

      return;

    }


    line.textContent +=
      currentText[currentCharacter];

    currentCharacter++;

    keepTextAtBottom();


    typingTimer =
      window.setTimeout(
        typeNextCharacter,
        38
      );

  }


  typeNextCharacter();

}


/* ---------------------------------------------------------
   FINISH CURRENT LINE
   --------------------------------------------------------- */

function finishCurrentLine() {

  if (!isTyping) {
    return;
  }

  clearTimeout(typingTimer);

  const beat =
    SCENE[currentBeat];

  const lines =
    sceneTextStream.querySelectorAll(".scene-line");

  const currentLine =
    lines[lines.length - 1];


  if (currentLine && beat) {

    currentLine.textContent =
      beat.text;

  }


  currentCharacter =
    currentText.length;

  isTyping =
    false;

  keepTextAtBottom();

  scheduleAutomaticAdvance();

}


/* ---------------------------------------------------------
   AUTOMATIC ADVANCE
   --------------------------------------------------------- */

function scheduleAutomaticAdvance() {

  clearTimeout(advanceTimer);

  advanceTimer =
    window.setTimeout(() => {

      advanceScene();

    }, 1500);

}


/* ---------------------------------------------------------
   ADVANCE
   --------------------------------------------------------- */

function advanceScene() {

  if (sceneFinished) {
    return;
  }

  clearTimeout(advanceTimer);

  currentBeat++;

  if (currentBeat >= SCENE.length) {

    finishScene();

    return;

  }

  typeCurrentBeat();

}


/* ---------------------------------------------------------
   TAP
   --------------------------------------------------------- */

sceneTapArea.addEventListener(
  "click",
  () => {

    if (sceneFinished) {
      return;
    }


    /*
      First tap:
      finish a line that is still typing.
    */

    if (isTyping) {

      finishCurrentLine();

      return;

    }


    /*
      Second tap:
      move immediately to the next beat.
    */

    advanceScene();

  }
);


/* ---------------------------------------------------------
   START SCENE
   --------------------------------------------------------- */

function startScene() {

  if (sceneStarted) {
    return;
  }

  sceneStarted = true;

  sceneEnding.style.display =
    "none";

  currentBeat =
    0;

  typeCurrentBeat();

}


/* ---------------------------------------------------------
   END SCENE
   --------------------------------------------------------- */

function finishScene() {

  sceneFinished = true;

  isTyping = false;

  clearTimeout(typingTimer);

  clearTimeout(advanceTimer);

  sceneTapHint.style.opacity =
    "0";

  sceneStage.style.transition =
    "opacity 900ms ease";

  window.setTimeout(() => {

    sceneStage.style.opacity =
      "0";

  }, 200);


  window.setTimeout(() => {

    sceneStage.style.display =
      "none";

    sceneEnding.style.display =
      "block";

    sceneEnding.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }, 1100);

}


/* ---------------------------------------------------------
   START WHEN THE THEATRE ENTERS VIEW
   --------------------------------------------------------- */

const sceneObserver =
  new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (
          entry.isIntersecting &&
          !sceneStarted
        ) {

          startScene();

        }

      });

    },
    {
      threshold: 0.25
    }
  );


sceneObserver.observe(sceneStage);


/* ---------------------------------------------------------
   SAFETY START
   --------------------------------------------------------- */

window.addEventListener(
  "load",
  () => {

    /*
      If the browser opens directly on the theatre
      and IntersectionObserver doesn't fire immediately,
      this guarantees the experiment still starts.
    */

    window.setTimeout(() => {

      if (!sceneStarted) {
        startScene();
      }

    }, 500);

  }
);
