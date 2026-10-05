/* =========================================================
   CEEQWINN LIVING SCROLL MVP
   ========================================================= */


/* =========================================
   IMAGE LIBRARY
   ========================================= */

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


/* =========================================
   PROSE ELEMENTS
   ========================================= */

const livingImage =
  document.getElementById("livingImage");

const livingGlass =
  document.getElementById("livingReadingGlass");

const livingGlassLabel =
  document.getElementById("livingGlassLabel");

const livingGlassText =
  document.getElementById("livingGlassText");

const livingBeats =
  [
    ...document.querySelectorAll(".living-beat")
  ];


/* =========================================
   PRELOAD IMAGES
   ========================================= */

function preloadImages() {

  Object.values(IMAGES).forEach(group => {

    Object.values(group).forEach(src => {

      const image =
        new Image();

      image.src = src;

    });

  });

}

preloadImages();


/* =========================================
   LIVING SCROLL
   ========================================= */

let activeLivingBeat = -1;


function changeLivingScene(index) {

  if (
    index === activeLivingBeat
  ) {
    return;
  }

  const beat =
    livingBeats[index];

  if (!beat) {
    return;
  }

  activeLivingBeat = index;


  const imageKey =
    beat.dataset.image;

  const imageSrc =
    IMAGES.prose[imageKey];

  const label =
    beat.dataset.label;

  const text =
    beat.dataset.text;


  /*
    The glass does NOT disappear.

    Only the image changes behind it.
  */

  livingImage.style.opacity = "0.25";


  setTimeout(() => {

    livingImage.src =
      imageSrc;

    livingGlassLabel.textContent =
      label;

    livingGlassText.textContent =
      text;


    livingImage.onload = () => {

      livingImage.style.opacity =
        "1";

    };

  }, 180);

}


/* =========================================
   OBSERVE SCROLL BEATS
   ========================================= */

const livingObserver =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (
          entry.isIntersecting
        ) {

          const index =
            livingBeats.indexOf(
              entry.target
            );

          changeLivingScene(index);

        }

      });

    },

    {
      threshold: 0.45
    }

  );


livingBeats.forEach(
  beat =>
    livingObserver.observe(beat)
);


/* =========================================
   DIALOGUE ELEMENTS
   ========================================= */

const dialogueTheatre =
  document.getElementById(
    "dialogueTheatre"
  );

const lexisPanel =
  document.getElementById(
    "lexisPanel"
  );

const fatherPanel =
  document.getElementById(
    "fatherPanel"
  );

const lexisImage =
  document.getElementById(
    "lexisImage"
  );

const fatherImage =
  document.getElementById(
    "fatherImage"
  );

const lexisDialogue =
  document.getElementById(
    "lexisDialogue"
  );

const fatherDialogue =
  document.getElementById(
    "fatherDialogue"
  );

const lexisText =
  document.getElementById(
    "lexisText"
  );

const fatherText =
  document.getElementById(
    "fatherText"
  );

const lexisExpressions =
  [
    ...document.querySelectorAll(
      "#lexisExpressions span"
    )
  ];

const fatherExpressions =
  [
    ...document.querySelectorAll(
      "#fatherExpressions span"
    )
  ];

const dialogueProgress =
  [
    ...document.querySelectorAll(
      "#dialogueProgress span"
    )
  ];


/* =========================================
   DIALOGUE
   ========================================= */

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


let dialogueStarted = false;

let currentDialogueIndex = -1;

let typingTimer = null;

let skipTyping = false;

let dialoguePlaying = false;


/* =========================================
   DIALOGUE DISPLAY
   ========================================= */

function hideDialogue() {

  lexisDialogue.classList.remove(
    "is-visible"
  );

  fatherDialogue.classList.remove(
    "is-visible"
  );

}


function setSpeaker(speaker) {

  if (
    speaker === "lexis"
  ) {

    lexisPanel.classList.add(
      "is-speaking"
    );

    lexisPanel.classList.remove(
      "is-listening"
    );

    fatherPanel.classList.remove(
      "is-speaking"
    );

    fatherPanel.classList.add(
      "is-listening"
    );

  } else {

    fatherPanel.classList.add(
      "is-speaking"
    );

    fatherPanel.classList.remove(
      "is-listening"
    );

    lexisPanel.classList.remove(
      "is-speaking"
    );

    lexisPanel.classList.add(
      "is-listening"
    );

  }

}


/* =========================================
   EXPRESSIONS
   ========================================= */

function setExpressions(index) {

  lexisExpressions.forEach(
    (dot, i) => {

      dot.classList.toggle(
        "active",
        i === index
      );

    }
  );


  fatherExpressions.forEach(
    (dot, i) => {

      dot.classList.toggle(
        "active",
        i === index
      );

    }
  );

}


/* =========================================
   DIALOGUE PROGRESS
   ========================================= */

function setDialogueProgress(index) {

  dialogueProgress.forEach(
    (dot, i) => {

      dot.classList.toggle(
        "active",
        i === index
      );

    }
  );

}


/* =========================================
   CHANGE CHARACTER IMAGES
   ========================================= */

function changeCharacterImages(
  beat
) {

  lexisImage.style.opacity =
    "0.2";

  fatherImage.style.opacity =
    "0.2";


  setTimeout(() => {

    lexisImage.src =
      IMAGES.lexis[
        beat.lexisImage
      ];

    fatherImage.src =
      IMAGES.father[
        beat.fatherImage
      ];


    lexisImage.onload =
      () => {

        lexisImage.style.opacity =
          "1";

      };


    fatherImage.onload =
      () => {

        fatherImage.style.opacity =
          "1";

      };

  }, 180);

}


/* =========================================
   SLOW TYPING
   ========================================= */

function typeDialogue(
  text,
  element
) {

  return new Promise(
    resolve => {

      clearInterval(
        typingTimer
      );

      skipTyping = false;

      element.textContent = "";

      let index = 0;


      typingTimer =
        setInterval(
          () => {

            if (
              skipTyping
            ) {

              clearInterval(
                typingTimer
              );

              element.textContent =
                text;

              resolve();

              return;
            }


            if (
              index >=
              text.length
            ) {

              clearInterval(
                typingTimer
              );

              resolve();

              return;
            }


            element.textContent +=
              text[index];

            index++;

          },
          72
        );

    }
  );

}


/* =========================================
   PLAY DIALOGUE BEAT
   ========================================= */

async function playDialogueBeat(
  index
) {

  if (
    index >=
    dialogue.length
  ) {

    finishDialogue();

    return;
  }


  currentDialogueIndex =
    index;

  const beat =
    dialogue[index];


  dialoguePlaying =
    true;


  setDialogueProgress(
    index
  );

  setSpeaker(
    beat.speaker
  );

  setExpressions(
    beat.expression
  );

  changeCharacterImages(
    beat
  );


  hideDialogue();


  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        450
      )
  );


  let textElement;
  let dialogueElement;


  if (
    beat.speaker ===
    "lexis"
  ) {

    textElement =
      lexisText;

    dialogueElement =
      lexisDialogue;

  } else {

    textElement =
      fatherText;

    dialogueElement =
      fatherDialogue;

  }


  dialogueElement.classList.add(
    "is-visible"
  );


  await typeDialogue(
    beat.text,
    textElement
  );


  /*
    Natural pause.
  */

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        1400
      )
  );


  if (
    index <
    dialogue.length - 1
  ) {

    await playDialogueBeat(
      index + 1
    );

  } else {

    finishDialogue();

  }

}


/* =========================================
   START DIALOGUE
   ========================================= */

function startDialogue() {

  if (
    dialogueStarted
  ) {

    return;
  }


  dialogueStarted =
    true;


  playDialogueBeat(0);

}


/* =========================================
   FINISH DIALOGUE
   ========================================= */

function finishDialogue() {

  dialoguePlaying =
    false;


  setTimeout(
    () => {

      hideDialogue();


      lexisPanel.classList.remove(
        "is-speaking"
      );

      fatherPanel.classList.remove(
        "is-speaking"
      );

      lexisPanel.classList.remove(
        "is-listening"
      );

      fatherPanel.classList.remove(
        "is-listening"
      );

    },
    1800
  );

}


/* =========================================
   ENTER DIALOGUE THEATRE
   ========================================= */

const dialogueStarter =
  new IntersectionObserver(

    entries => {

      entries.forEach(
        entry => {

          if (
            entry.isIntersecting &&
            !dialogueStarted
          ) {

            startDialogue();

          }

        }
      );

    },

    {
      threshold: 0.35
    }

  );


if (
  dialogueTheatre
) {

  dialogueStarter.observe(
    dialogueTheatre
  );

}


/* =========================================
   TAP SPEAKING CHARACTER
   ========================================= */

function handleDialogueTap(
  event
) {

  if (
    !dialoguePlaying
  ) {

    return;
  }


  const clickedLexis =
    event.target.closest(
      "#lexisPanel"
    );

  const clickedFather =
    event.target.closest(
      "#fatherPanel"
    );


  const current =
    dialogue[
      currentDialogueIndex
    ];


  if (
    current.speaker ===
      "lexis" &&
    clickedLexis
  ) {

    skipTyping =
      true;

  }


  if (
    current.speaker ===
      "father" &&
    clickedFather
  ) {

    skipTyping =
      true;

  }

}


dialogueTheatre.addEventListener(
  "pointerdown",
  handleDialogueTap
);


/* =========================================
   READY
   ========================================= */

console.log(
  "CEEQWINN Living Scroll MVP loaded."
);
