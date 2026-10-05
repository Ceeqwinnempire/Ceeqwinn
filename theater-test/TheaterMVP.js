/* ============================================================
   CEEQWINN LIVING SCROLL THEATRE
   MVP JAVASCRIPT
============================================================ */


/* ============================================================
   IMAGE LIBRARY
============================================================ */

/*
   We use the GitHub RAW repository directly.

   IMPORTANT:
   The theatre does NOT inspect images.
   It only knows which image belongs to which story beat.

   That keeps the system deterministic.
*/

const RAW_BASE =
  "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/";

const LEXIS_BASE =
  RAW_BASE +
  "characters/lexis/outfits/";


const IMAGE_LIBRARY = {

  house:
    RAW_BASE +
    encodeURIComponent(
      "Luxurious_royal_theatre_curtai (1).jpeg"
    ),

  gate:
    RAW_BASE +
    encodeURIComponent(
      "Luxurious_royal_theatre_curtai (4).jpeg"
    ),

  garden:
    RAW_BASE +
    encodeURIComponent(
      "rainy_atmosphere_cinematic_rai.jpeg"
    ),

  detail:
    RAW_BASE +
    encodeURIComponent(
      "image-1.png"
    ),

  arrivalEnd:
    RAW_BASE +
    encodeURIComponent(
      "Full-body_cinematic_portrait_o - 2025-10-30T110920.194.jpeg"
    ),


  /* Visual sequence */

  sequence0:
    RAW_BASE +
    encodeURIComponent(
      "adorable_cute_kawaii_A_beautif (1).jpeg"
    ),

  sequence1:
    RAW_BASE +
    encodeURIComponent(
      "young_woman_rainy_atmosphere_c.jpeg"
    ),

  sequence2:
    RAW_BASE +
    encodeURIComponent(
      "cinematic_character_portrait_p (1).jpeg"
    ),

  sequence3:
    RAW_BASE +
    encodeURIComponent(
      "image-2.png"
    ),

  sequence4:
    RAW_BASE +
    encodeURIComponent(
      "editorial_fashion_portrait_pri.jpeg"
    ),


  /* Wardrobe */

  wardrobe:
    LEXIS_BASE +
    encodeURIComponent(
      "Lexis_Azunna_soft.jpg.jpeg"
    ),

  blackDress:
    LEXIS_BASE +
    encodeURIComponent(
      "lexis_black_dress.png.jpeg"
    ),

  redDress:
    LEXIS_BASE +
    encodeURIComponent(
      "lexis_red_dress.png.jpeg"
    ),

  street:
    LEXIS_BASE +
    encodeURIComponent(
      "Lexis_Azunna_street.jpg.jpeg"
    ),


  /* Dialogue characters */

  lexis:
    LEXIS_BASE +
    encodeURIComponent(
      "lexis_default.png.jpeg"
    ),

  father:
    RAW_BASE +
    encodeURIComponent(
      "cinematic_character_portrait_p-1.jpeg"
    )

};


/* ============================================================
   UTILITY
============================================================ */

function sleep(ms) {

  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });

}


/* ============================================================
   IMAGE PRELOADER
============================================================ */

function preloadImage(src) {

  return new Promise(function(resolve) {

    const img =
      new Image();

    img.onload =
      function() {
        resolve(true);
      };

    img.onerror =
      function() {
        resolve(false);
      };

    img.src =
      src;

  });

}


/* ============================================================
   VISUAL IMAGE SWITCHER
============================================================ */

function changeVisual(options) {

  const {
    image,
    alt,
    mode,
    imageElement,
    frameElement,
    glassElement,
    glassTextElement,
    glassText,
    statusElement,
    status
  } = options;


  if (!imageElement) {
    return;
  }


  const oldSrc =
    imageElement.dataset.currentSrc || "";


  if (
    oldSrc === image &&
    imageElement.classList.contains("loaded")
  ) {

    updateGlass(
      glassElement,
      glassTextElement,
      glassText
    );

    return;

  }


  if (frameElement) {

    frameElement.classList.add(
      "changing"
    );

  }


  imageElement.classList.remove(
    "loaded"
  );


  if (statusElement && status) {

    statusElement.textContent =
      status;

  }


  if (mode) {

    frameElement.dataset.mode =
      mode;

  }


  preloadImage(image)
    .then(function(success) {

      if (!success) {

        imageElement.alt =
          alt || "Visual unavailable";

        return;

      }


      imageElement.onload =
        function() {

          imageElement.classList.add(
            "loaded"
          );

          if (frameElement) {

            frameElement.classList.remove(
              "changing"
            );

          }

        };


      imageElement.src =
        image;

      imageElement.alt =
        alt || "";

      imageElement.dataset.currentSrc =
        image;

    });


  updateGlass(
    glassElement,
    glassTextElement,
    glassText
  );

}


/* ============================================================
   READING GLASS
============================================================ */

function updateGlass(
  glassElement,
  glassTextElement,
  glassText
) {

  if (!glassElement) {
    return;
  }


  if (
    glassText &&
    glassText.trim() !== ""
  ) {

    if (glassTextElement) {

      glassTextElement.textContent =
        glassText;

    }

    glassElement.classList.add(
      "visible"
    );

  } else {

    glassElement.classList.remove(
      "visible"
    );

  }

}


/* ============================================================
   SCENE STATE
============================================================ */

const sceneStates = {};


/* ============================================================
   ARRIVAL SCENE
============================================================ */

function setupArrivalScene() {

  const scene =
    document.querySelector(
      '[data-scene="arrival"]'
    );

  if (!scene) {
    return;
  }


  const imageElement =
    document.getElementById(
      "arrivalImage"
    );

  const frameElement =
    document.getElementById(
      "arrivalVisual"
    );

  const glassElement =
    document.getElementById(
      "arrivalGlass"
    );

  const glassTextElement =
    document.getElementById(
      "arrivalGlassText"
    );

  const statusElement =
    document.getElementById(
      "arrivalStatus"
    );


  const beats =
    Array.from(
      scene.querySelectorAll(
        ".story-beat"
      )
    );


  const visualMap = {

    house: {
      image: IMAGE_LIBRARY.house,
      mode: "cinematic"
    },

    gate: {
      image: IMAGE_LIBRARY.gate,
      mode: "cinematic"
    },

    garden: {
      image: IMAGE_LIBRARY.garden,
      mode: "cinematic"
    },

    detail: {
      image: IMAGE_LIBRARY.detail,
      mode: "detail"
    },

    "arrival-end": {
      image: IMAGE_LIBRARY.arrivalEnd,
      mode: "cinematic"
    }

  };


  function activateBeat(beat) {

    if (!beat) {
      return;
    }


    beats.forEach(function(item) {

      item.classList.remove(
        "active"
      );

    });


    beat.classList.add(
      "active"
    );


    const key =
      beat.dataset.visual;

    const visual =
      visualMap[key];

    if (!visual) {
      return;
    }


    changeVisual({

      image:
        visual.image,

      alt:
        beat.dataset.alt,

      mode:
        beat.dataset.mode ||
        visual.mode,

      imageElement,
      frameElement,
      glassElement,
      glassTextElement,

      glassText:
        beat.dataset.glass || "",

      statusElement,

      status:
        beat.dataset.status || ""

    });

  }


  sceneStates.arrival = {
    activateBeat
  };


  observeBeats(
    beats,
    activateBeat
  );


  activateBeat(
    beats[0]
  );

}


/* ============================================================
   GENERIC BEAT OBSERVER
============================================================ */

function observeBeats(
  beats,
  callback
) {

  if (
    !("IntersectionObserver" in window)
  ) {

    callback(
      beats[0]
    );

    return;

  }


  const observer =
    new IntersectionObserver(
      function(entries) {

        entries.forEach(function(entry) {

          if (
            entry.isIntersecting
          ) {

            callback(
              entry.target
            );

          }

        });

      },
      {
        root: null,

        /*
          The beat becomes active
          when its reading position
          enters the middle of
          the screen.
        */

        rootMargin:
          "-38% 0px -42% 0px",

        threshold:
          0
      }
    );


  beats.forEach(function(beat) {

    observer.observe(
      beat
    );

  });

}


/* ============================================================
   GARDEN VISUAL SEQUENCE
============================================================ */

function setupGardenSequence() {

  const scene =
    document.querySelector(
      '[data-scene="garden-sequence"]'
    );

  if (!scene) {
    return;
  }


  const imageElement =
    document.getElementById(
      "gardenImage"
    );

  const frameElement =
    document.getElementById(
      "gardenVisual"
    );

  const glassElement =
    document.getElementById(
      "gardenGlass"
    );

  const glassTextElement =
    document.getElementById(
      "gardenGlassText"
    );

  const statusElement =
    document.getElementById(
      "gardenStatus"
    );

  const dotsContainer =
    document.getElementById(
      "gardenDots"
    );


  const beats =
    Array.from(
      scene.querySelectorAll(
        ".sequence-beat"
      )
    );


  const sequence = [

    {
      image:
        IMAGE_LIBRARY.sequence0,

      mode:
        "cinematic",

      alt:
        "A beautiful garden-like scene."
    },

    {
      image:
        IMAGE_LIBRARY.sequence1,

      mode:
        "cinematic",

      alt:
        "A cinematic arrival."
    },

    {
      image:
        IMAGE_LIBRARY.sequence2,

      mode:
        "portrait",

      alt:
        "A mysterious figure."
    },

    {
      image:
        IMAGE_LIBRARY.sequence3,

      mode:
        "detail",

      alt:
        "A small symbolic detail."
    },

    {
      image:
        IMAGE_LIBRARY.sequence4,

      mode:
        "cinematic",

      alt:
        "A fashion-forward cinematic moment."
    }

  ];


  /*
     Create dots.

     The dots are NOT the main interaction.
     They simply let the reader know
     that a visual sequence is happening.
  */

  sequence.forEach(
    function(_, index) {

      const dot =
        document.createElement(
          "button"
        );

      dot.className =
        "sequence-dot";

      dot.type =
        "button";

      dot.setAttribute(
        "aria-label",
        "Show visual " +
        (index + 1)
      );


      dot.addEventListener(
        "click",
        function() {

          const target =
            beats[index];

          if (target) {

            target.scrollIntoView({
              behavior:
                "smooth",

              block:
                "center"
            });

          }

        }
      );


      dotsContainer.appendChild(
        dot
      );

    }
  );


  const dots =
    Array.from(
      dotsContainer.children
    );


  function activateBeat(beat) {

    if (!beat) {
      return;
    }


    beats.forEach(function(item) {

      item.classList.remove(
        "active"
      );

    });


    beat.classList.add(
      "active"
    );


    const index =
      Number(
        beat.dataset.sequence
      );


    const visual =
      sequence[index];


    if (!visual) {
      return;
    }


    dots.forEach(function(dot, i) {

      dot.classList.toggle(
        "active",
        i === index
      );

    });


    changeVisual({

      image:
        visual.image,

      alt:
        beat.dataset.glass
          ? beat.dataset.glass
          : visual.alt,

      mode:
        beat.dataset.mode ||
        visual.mode,

      imageElement,
      frameElement,
      glassElement,
      glassTextElement,

      glassText:
        beat.dataset.glass || "",

      statusElement,

      status:
        beat.dataset.status || ""

    });

  }


  sceneStates.garden = {
    activateBeat
  };


  observeBeats(
    beats,
    activateBeat
  );


  activateBeat(
    beats[0]
  );

}


/* ============================================================
   DIALOGUE THEATRE
============================================================ */

function setupDialogueScene() {

  const scene =
    document.querySelector(
      '[data-scene="father-dialogue"]'
    );

  if (!scene) {
    return;
  }


  const lexisCharacter =
    document.getElementById(
      "lexisCharacter"
    );

  const fatherCharacter =
    document.getElementById(
      "fatherCharacter"
    );

  const lexisImage =
    document.getElementById(
      "lexisCharacterImage"
    );

  const fatherImage =
    document.getElementById(
      "fatherCharacterImage"
    );

  const speakerLabel =
    document.getElementById(
      "speakerLabel"
    );

  const dialogueText =
    document.getElementById(
      "dialogueText"
    );

  const statusElement =
    document.getElementById(
      "dialogueStatus"
    );


  /*
     Character images are loaded once.

     The theatre does NOT replace the whole
     stage every time someone talks.
  */

  lexisImage.src =
    IMAGE_LIBRARY.lexis;

  fatherImage.src =
    IMAGE_LIBRARY.father;


  const beats =
    Array.from(
      scene.querySelectorAll(
        ".dialogue-beat"
      )
    );


  function activateDialogue(
    beat
  ) {

    if (!beat) {
      return;
    }


    beats.forEach(function(item) {

      item.classList.remove(
        "active"
      );

    });


    beat.classList.add(
      "active"
    );


    const speaker =
      beat.dataset.speaker;

    const dialogue =
      beat.dataset.dialogue;

    const status =
      beat.dataset.status;


    lexisCharacter.classList.toggle(
      "speaking",
      speaker === "lexis"
    );

    fatherCharacter.classList.toggle(
      "speaking",
      speaker === "father"
    );


    if (speaker === "lexis") {

      speakerLabel.textContent =
        "LEXIS";

    } else {

      speakerLabel.textContent =
        "FATHER";

    }


    dialogueText.textContent =
      dialogue;


    statusElement.textContent =
      status;


    /*
       Tiny visual movement inside
       the dialogue panel.
    */

    const panel =
      document.getElementById(
        "dialoguePanel"
      );

    panel.style.transform =
      "translateY(4px)";


    requestAnimationFrame(
      function() {

        panel.style.transform =
          "translateY(0)";

      }
    );

  }


  sceneStates.dialogue = {
    activateDialogue
  };


  observeBeats(
    beats,
    activateDialogue
  );


  activateDialogue(
    beats[0]
  );

}


/* ============================================================
   WARDROBE SCENE
============================================================ */

function setupWardrobeScene() {

  const scene =
    document.querySelector(
      '[data-scene="wardrobe"]'
    );

  if (!scene) {
    return;
  }


  const imageElement =
    document.getElementById(
      "wardrobeImage"
    );

  const frameElement =
    document.getElementById(
      "wardrobeVisual"
    );

  const glassElement =
    document.getElementById(
      "wardrobeGlass"
    );

  const glassTextElement =
    document.getElementById(
      "wardrobeGlassText"
    );

  const statusElement =
    document.getElementById(
      "wardrobeStatus"
    );


  const beats =
    Array.from(
      scene.querySelectorAll(
        ".story-beat"
      )
    );


  const visualMap = {

    wardrobe: {
      image:
        IMAGE_LIBRARY.wardrobe,

      mode:
        "portrait"
    },

    "black-dress": {
      image:
        IMAGE_LIBRARY.blackDress,

      mode:
        "portrait"
    },

    "red-dress": {
      image:
        IMAGE_LIBRARY.redDress,

      mode:
        "portrait"
    },

    street: {
      image:
        IMAGE_LIBRARY.street,

      mode:
        "portrait"
    }

  };


  function activateBeat(beat) {

    if (!beat) {
      return;
    }


    beats.forEach(function(item) {

      item.classList.remove(
        "active"
      );

    });


    beat.classList.add(
      "active"
    );


    const visual =
      visualMap[
        beat.dataset.visual
      ];


    if (!visual) {
      return;
    }


    changeVisual({

      image:
        visual.image,

      alt:
        "Lexis visual scene",

      mode:
        beat.dataset.mode ||
        visual.mode,

      imageElement,
      frameElement,
      glassElement,
      glassTextElement,

      glassText:
        beat.dataset.glass || "",

      statusElement,

      status:
        beat.dataset.status || ""

    });

  }


  sceneStates.wardrobe = {
    activateBeat
  };


  observeBeats(
    beats,
    activateBeat
  );


  activateBeat(
    beats[0]
  );

}


/* ============================================================
   CHOICES
============================================================ */

function setupChoices() {

  const buttons =
    Array.from(
      document.querySelectorAll(
        ".story-choice"
      )
    );

  const result =
    document.getElementById(
      "choiceResult"
    );

  const restart =
    document.getElementById(
      "restartButton"
    );


  const outcomes = {

    follow: {
      title:
        "Lexis follows the crest.",

      text:
        "The old hallway seems to grow longer as she walks. Somewhere beyond the final door, something answers with a single metallic click."
    },

    question: {
      title:
        "Lexis asks again.",

      text:
        "Her father closes his eyes. When he opens them, he says one sentence: “Then you deserve to know why the family kept the second line hidden.”"
    },

    leave: {
      title:
        "Lexis leaves the room.",

      text:
        "She steps into the quiet corridor. Behind her, the door closes without being touched. For tonight, the mystery waits."
    }

  };


  buttons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        function() {

          buttons.forEach(
            function(other) {

              other.disabled =
                true;

              other.style.opacity =
                "0.45";

            }
          );


          button.style.opacity =
            "1";


          const choice =
            button.dataset.choice;


          const outcome =
            outcomes[choice];


          if (!outcome) {
            return;
          }


          result.innerHTML =
            "<strong>" +
            outcome.title +
            "</strong><br>" +
            outcome.text;


          result.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center"
          });

        }
      );

    }
  );


  restart.addEventListener(
    "click",
    function() {

      window.scrollTo({
        top:
          0,

        behavior:
          "smooth"
      });


      setTimeout(
        function() {

          window.location.reload();

        },
        500
      );

    }
  );

}


/* ============================================================
   READING PROGRESS
============================================================ */

function setupProgressBar() {

  const bar =
    document.getElementById(
      "progressBar"
    );

  if (!bar) {
    return;
  }


  function update() {

    const scrollTop =
      window.scrollY;

    const scrollHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;


    if (scrollHeight <= 0) {

      bar.style.width =
        "0%";

      return;

    }


    const progress =
      (
        scrollTop /
        scrollHeight
      ) * 100;


    bar.style.width =
      Math.max(
        0,
        Math.min(
          100,
          progress
        )
      ) +
      "%";

  }


  window.addEventListener(
    "scroll",
    update,
    {
      passive:
        true
    }
  );


  update();

}


/* ============================================================
   PRELOAD IMPORTANT IMAGES
============================================================ */

function preloadTheatreImages() {

  const sources =
    Object.values(
      IMAGE_LIBRARY
    );


  /*
     We deliberately don't wait
     for all images before showing
     the page.

     Low-end devices should be
     allowed to start reading.
  */

  sources.forEach(
    function(src) {

      const img =
        new Image();

      img.src =
        src;

    }
  );

}


/* ============================================================
   INITIALISE
============================================================ */

function initTheatre() {

  setupProgressBar();

  setupArrivalScene();

  setupGardenSequence();

  setupDialogueScene();

  setupWardrobeScene();

  setupChoices();

  preloadTheatreImages();

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initTheatre
  );

} else {

  initTheatre();

}
