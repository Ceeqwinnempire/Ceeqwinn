/* =========================================================
   CEEQWINN THEATRE MVP
   Living Scroll Theatre
   ========================================================= */


/* =========================
   IMAGE LIBRARY
   ========================= */

const IMAGES = {

  prose: {
    house:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_soft.jpg.jpeg",

    silence:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/rainy_atmosphere_cinematic_rai.jpeg",

    discovery:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/young_woman_rainy_atmosphere_c.jpeg"
  },

  lexis: {
    soft:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_soft.jpg.jpeg",

    street:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_street.jpg.jpeg",

    ministry:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_ministry.jpg.jpeg",

    black:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/lexis_black_dress.png.jpeg",

    red:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/lexis_red_dress.png.jpeg"
  },

  father: {
    father1:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/cinematic_character_portrait_p.jpeg",

    father2:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/cinematic_character_portrait_p-1.jpeg",

    father3:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/cinematic_character_portrait_p%20(1).jpeg",

    father4:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/cinematic_character_portrait_p%20(2).jpeg",

    father5:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/cinematic_character_portrait_p%20(1)-1.jpeg",

    father6:
      "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/cinematic_character_portrait_p%20(2)-1.jpeg"
  }

};


/* =========================
   ELEMENTS
   ========================= */

const proseImage =
  document.getElementById("proseImage");

const proseGlass =
  document.getElementById("proseReadingGlass");

const proseGlassLabel =
  document.getElementById("proseGlassLabel");

const proseGlassText =
  document.getElementById("proseGlassText");

const proseBeats =
  [...document.querySelectorAll(".prose-beat")];

const dialogueTheatre =
  document.getElementById("dialogueTheatre");

const dialogueBeats =
  [...document.querySelectorAll(".dialogue-beat")];

const lexisPanel =
  document.getElementById("lexisPanel");

const fatherPanel =
  document.getElementById("fatherPanel");

const lexisImage =
  document.getElementById("lexisImage");

const fatherImage =
  document.getElementById("fatherImage");

const lexisDialogue =
  document.getElementById("lexisDialogue");

const fatherDialogue =
  document.getElementById("fatherDialogue");

const lexisText =
  document.getElementById("lexisText");

const fatherText =
  document.getElementById("fatherText");

const lexisExpressions =
  [...document.querySelectorAll("#lexisExpressions span")];

const fatherExpressions =
  [...document.querySelectorAll("#fatherExpressions span")];

const dialogueProgress =
  [...document.querySelectorAll("#dialogueProgress span")];


/* =========================
   PRELOAD
   ========================= */

function preloadImages() {

  Object.values(IMAGES).forEach(group => {

    Object.values(group).forEach(src => {

      const image = new Image();

      image.src = src;

    });

  });

}

preloadImages();


/* =========================
   PROSE THEATRE
   ========================= */

let activeProseBeat = -1;


/*
  Start with the image present,
  but NO reading glass.

  The glass appears when the
  reader actually reaches the beat.
*/

proseGlass.classList.remove("is-visible");


function showProseVisual(index) {

  if (index === activeProseBeat) {
    return;
  }

  activeProseBeat = index;

  const beat = proseBeats[index];

  if (!beat) {
    return;
  }

  const imageKey =
    beat.dataset.image;

  const imageSrc =
    IMAGES.prose[imageKey];

  const label =
    beat.dataset.label;

  const text =
    beat.dataset.text;


  proseGlass.classList.remove("is-visible");
  proseGlass.classList.add("is-fading");


  setTimeout(() => {

    proseImage.style.opacity = "0.25";

    setTimeout(() => {

      proseImage.src = imageSrc;

      proseGlassLabel.textContent = label;
      proseGlassText.textContent = text;

      proseImage.onload = () => {

        proseImage.style.opacity = "1";

        proseGlass.classList.remove("is-fading");

        proseGlass.classList.add("is-visible");

      };

    }, 220);

  }, 220);

}


const proseObserver =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          const index =
            proseBeats.indexOf(entry.target);

          showProseVisual(index);

        }

      });

    },

    {
      threshold: 0.45
    }

  );


proseBeats.forEach(beat => {

  proseObserver.observe(beat);

});


/*
  HARD RULE:

  The Reading Glass must disappear
  before the image reaches its midpoint.
*/

function enforceProseGlassPosition() {

  const stage =
    document.querySelector(".prose-image-stage");

  if (!stage) {
    return;
  }

  const rect =
    stage.getBoundingClientRect();

  const midpoint =
    rect.top + rect.height * 0.46;


  /*
    Once the reader has moved far enough
    into the image, remove the glass.

    The image remains.
    Only the words disappear.
  */

  if (rect.top <= 0 && midpoint <= window.innerHeight * 0.62) {

    proseGlass.classList.remove("is-visible");

    proseGlass.classList.add("is-fading");

  }

}


window.addEventListener(
  "scroll",
  enforceProseGlassPosition,
  { passive: true }
);


/* =========================
   DIALOGUE DATA
   ========================= */

const dialogue = [

  {
    speaker: "lexis",

    text:
      "You knew I was coming.",

    expression: 0,

    lexisImage: "soft",
    fatherImage: "father1"
  },

  {
    speaker: "father",

    text:
      "I knew you would eventually ask.",

    expression: 0,

    lexisImage: "street",
    fatherImage: "father2"
  },

  {
    speaker: "lexis",

    text:
      "That isn't what I asked.",

    expression: 1,

    lexisImage: "ministry",
    fatherImage: "father3"
  },

  {
    speaker: "father",

    text:
      "No. It isn't.",

    expression: 1,

    lexisImage: "black",
    fatherImage: "father4"
  },

  {
    speaker: "lexis",

    text:
      "Then tell me the truth.",

    expression: 2,

    lexisImage: "red",
    fatherImage: "father5"
  },

  {
    speaker: "father",

    text:
      "The truth is usually less comforting than the story we tell ourselves.",

    expression: 2,

    lexisImage: "soft",
    fatherImage: "father6"
  }

];


/* =========================
   DIALOGUE STATE
   ========================= */

let dialogueStarted = false;
let currentDialogueIndex = -1;

let typingTimer = null;
let skipTyping = false;
let dialoguePlaying = false;


/* =========================
   DIALOGUE VISIBILITY
   ========================= */

function hideDialogue() {

  lexisDialogue.classList.remove("is-visible");
  fatherDialogue.classList.remove("is-visible");

}


function setSpeaker(speaker) {

  if (speaker === "lexis") {

    lexisPanel.classList.add("is-speaking");
    lexisPanel.classList.remove("is-listening");

    fatherPanel.classList.remove("is-speaking");
    fatherPanel.classList.add("is-listening");

  } else {

    fatherPanel.classList.add("is-speaking");
    fatherPanel.classList.remove("is-listening");

    lexisPanel.classList.remove("is-speaking");
    lexisPanel.classList.add("is-listening");

  }

}


/* =========================
   EXPRESSION DOTS
   ========================= */

function setExpressions(index) {

  lexisExpressions.forEach((dot, i) => {

    dot.classList.toggle(
      "active",
      i === index
    );

  });

  fatherExpressions.forEach((dot, i) => {

    dot.classList.toggle(
      "active",
      i === index
    );

  });

}


/* =========================
   PROGRESS DOTS
   ========================= */

function setDialogueProgress(index) {

  dialogueProgress.forEach((dot, i) => {

    dot.classList.toggle(
      "active",
      i === index
    );

  });

}


/* =========================
   IMAGE CHANGE
   ========================= */

function changeCharacterImages(beat) {

  lexisImage.style.opacity = "0.2";
  fatherImage.style.opacity = "0.2";

  setTimeout(() => {

    lexisImage.src =
      IMAGES.lexis[beat.lexisImage];

    fatherImage.src =
      IMAGES.father[beat.fatherImage];

    lexisImage.onload = () => {

      lexisImage.style.opacity = "1";

    };

    fatherImage.onload = () => {

      fatherImage.style.opacity = "1";

    };

  }, 180);

}


/* =========================
   SLOW TYPING
   ========================= */

function typeDialogue(text, element) {

  return new Promise(resolve => {

    clearInterval(typingTimer);

    skipTyping = false;

    element.textContent = "";

    let index = 0;

    typingTimer = setInterval(() => {

      if (skipTyping) {

        clearInterval(typingTimer);

        element.textContent = text;

        resolve();

        return;
      }


      if (index >= text.length) {

        clearInterval(typingTimer);

        resolve();

        return;
      }


      element.textContent += text[index];

      index++;


    }, 72);

  });

}


/* =========================
   PLAY ONE BEAT
   ========================= */

async function playDialogueBeat(index) {

  if (index >= dialogue.length) {

    finishDialogue();

    return;
  }


  currentDialogueIndex = index;

  const beat =
    dialogue[index];


  dialoguePlaying = true;

  setDialogueProgress(index);

  setSpeaker(beat.speaker);

  setExpressions(beat.expression);

  changeCharacterImages(beat);


  hideDialogue();


  await new Promise(resolve => {

    setTimeout(resolve, 450);

  });


  let textElement;

  let dialogueElement;


  if (beat.speaker === "lexis") {

    textElement = lexisText;
    dialogueElement = lexisDialogue;

  } else {

    textElement = fatherText;
    dialogueElement = fatherDialogue;

  }


  dialogueElement.classList.add("is-visible");


  await typeDialogue(
    beat.text,
    textElement
  );


  /*
    Give the sentence room to breathe.
  */

  await new Promise(resolve => {

    setTimeout(resolve, 1400);

  });


  if (index < dialogue.length - 1) {

    await playDialogueBeat(index + 1);

  } else {

    finishDialogue();

  }

}


/* =========================
   START DIALOGUE
   ========================= */

function startDialogue() {

  if (dialogueStarted) {
    return;
  }

  dialogueStarted = true;

  playDialogueBeat(0);

}


/* =========================
   FINISH DIALOGUE
   ========================= */

function finishDialogue() {

  dialoguePlaying = false;

  setTimeout(() => {

    hideDialogue();

    lexisPanel.classList.remove("is-speaking");
    fatherPanel.classList.remove("is-speaking");

    lexisPanel.classList.remove("is-listening");
    fatherPanel.classList.remove("is-listening");

  }, 1800);

}


/* =========================
   START WHEN DIALOGUE
   ENTERS VIEW
   ========================= */

const dialogueStarter =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (
          entry.isIntersecting &&
          !dialogueStarted
        ) {

          startDialogue();

        }

      });

    },

    {
      threshold: 0.35
    }

  );


if (dialogueTheatre) {

  dialogueStarter.observe(dialogueTheatre);

}


/* =========================
   TAP ACTIVE CHARACTER
   ========================= */

function handleDialogueTap(event) {

  if (!dialoguePlaying) {
    return;
  }


  const clickedLexis =
    event.target.closest("#lexisPanel");

  const clickedFather =
    event.target.closest("#fatherPanel");


  const current =
    dialogue[currentDialogueIndex];


  if (
    current.speaker === "lexis" &&
    clickedLexis
  ) {

    skipTyping = true;

  }


  if (
    current.speaker === "father" &&
    clickedFather
  ) {

    skipTyping = true;

  }

}


dialogueTheatre.addEventListener(
  "pointerdown",
  handleDialogueTap
);


/* =========================
   DEBUG-FRIENDLY START
   ========================= */

console.log(
  "CEEQWINN Theatre MVP loaded."
);

console.log(
  "Prose beats:",
  proseBeats.length
);

console.log(
  "Dialogue beats:",
  dialogue.length
);
