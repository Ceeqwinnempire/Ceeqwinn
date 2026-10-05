/* ============================================================
   CEEQWINN LIVING SCROLL THEATRE
   POLISHED MVP JAVASCRIPT
============================================================ */


/* ============================================================
   IMAGE BASE
============================================================ */

const RAW_BASE =
  "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/";

const LEXIS_BASE =
  RAW_BASE +
  "characters/lexis/outfits/";


function rawImage(path) {

  return RAW_BASE +
    path
      .split("/")
      .map(function(part) {
        return encodeURIComponent(part);
      })
      .join("/");

}


/* ============================================================
   IMAGE LIBRARY
============================================================ */

const IMAGE_LIBRARY = {

  house:
    rawImage(
      "Luxurious_royal_theatre_curtai (1).jpeg"
    ),

  gate:
    rawImage(
      "Luxurious_royal_theatre_curtai (4).jpeg"
    ),

  garden:
    rawImage(
      "rainy_atmosphere_cinematic_rai.jpeg"
    ),

  detail:
    rawImage(
      "image-1.png"
    ),

  arrivalEnd:
    rawImage(
      "Full-body_cinematic_portrait_o - 2025-10-30T110920.194.jpeg"
    ),


  /* ========================================================
     VISUAL SEQUENCE
  ======================================================== */

  sequence0:
    rawImage(
      "adorable_cute_kawaii_A_beautif (1).jpeg"
    ),

  sequence1:
    rawImage(
      "young_woman_rainy_atmosphere_c.jpeg"
    ),

  sequence2:
    rawImage(
      "cinematic_character_portrait_p (1).jpeg"
    ),

  sequence3:
    rawImage(
      "image-2.png"
    ),

  sequence4:
    rawImage(
      "editorial_fashion_portrait_pri.jpeg"
    ),


  /* ========================================================
     WARDROBE
  ======================================================== */

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


  /* ========================================================
     LEXIS EXPRESSIONS
  ======================================================== */

  lexisNeutral:
    LEXIS_BASE +
    encodeURIComponent(
      "lexis_default.png.jpeg"
    ),

  lexisCurious:
    LEXIS_BASE +
    encodeURIComponent(
      "Lexis_Azunna_soft.jpg.jpeg"
    ),

  lexisSuspicious:
    LEXIS_BASE +
    encodeURIComponent(
      "Lexis_Azunna_street.jpg.jpeg"
    ),

  lexisDetermined:
    LEXIS_BASE +
    encodeURIComponent(
      "Lexis_Azunna_militarily.jpg.jpeg"
    ),


  /* ========================================================
     FATHER EXPRESSION PLACEHOLDERS
     
     IMPORTANT:
     These are temporary test assets.
     Replace them later with actual Father expression
     images when you add them to GitHub.
  ======================================================== */

  fatherCalm:
    rawImage(
      "cinematic_character_portrait_p-1.jpeg"
    ),

  fatherGuarded:
    rawImage(
      "cinematic_character_portrait_p.jpeg"
    ),

  fatherConcerned:
    rawImage(
      "cinematic_character_portrait_p (2).jpeg"
    ),

  fatherResigned:
    rawImage(
      "Full-body_cinematic_portrait_o - 2025-10-30T110920.194.jpeg"
    )

};


/* ============================================================
   CHARACTER EXPRESSION MAPS
============================================================ */

const CHARACTER_EXPRESSIONS = {

  lexis: {

    neutral:
      IMAGE_LIBRARY.lexisNeutral,

    curious:
      IMAGE_LIBRARY.lexisCurious,

    suspicious:
      IMAGE_LIBRARY.lexisSuspicious,

    determined:
      IMAGE_LIBRARY.lexisDetermined

  },


  father: {

    calm:
      IMAGE_LIBRARY.fatherCalm,

    guarded:
      IMAGE_LIBRARY.fatherGuarded,

    concerned:
      IMAGE_LIBRARY.fatherConcerned,

    resigned:
      IMAGE_LIBRARY.fatherResigned

  }

};


/* ============================================================
   PRELOAD
============================================================ */

function preloadImage(src) {

  return new Promise(
    function(resolve) {

      const image =
        new Image();

      image.onload =
        function() {
          resolve(true);
        };

      image.onerror =
        function() {
          resolve(false);
        };

      image.src =
        src;

    }
  );

}


/* ============================================================
   VISUAL CHANGE
============================================================ */

function changeVisual(options) {

  const image =
    options.image;

  const imageElement =
    options.imageElement;

  const frameElement =
    options.frameElement;

  const glassElement =
    options.glassElement;

  const glassTextElement =
    options.glassTextElement;

  const glassText =
    options.glassText || "";

  const mode =
    options.mode;

  const alt =
    options.alt || "";

  const statusElement =
    options.statusElement;

  const status =
    options.status || "";


  if (!imageElement) {
    return;
  }


  if (
    imageElement.dataset.currentSrc === image
  ) {

    updateReadingGlass(
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

    if (mode) {

      frameElement.dataset.mode =
        mode;

    }

  }


  imageElement.classList.remove(
    "loaded"
  );


  if (statusElement) {

    statusElement.textContent =
      status;

  }


  preloadImage(image)
    .then(
      function(success) {

        if (!success) {
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
          alt;

        imageElement.dataset.currentSrc =
          image;

      }
    );


  updateReadingGlass(
    glassElement,
    glassTextElement,
    glassText
  );

}


/* ============================================================
   READING GLASS
============================================================ */

function updateReadingGlass(
  glassElement,
  glassTextElement,
  text
) {

  if (!glassElement) {
    return;
  }


  if (
    text &&
    text.trim() !== ""
  ) {

    glassTextElement.textContent =
      text;

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
   BEAT OBSERVER
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

        entries.forEach(
          function(entry) {

            if (
              entry.isIntersecting
            ) {

              callback(
                entry.target
              );

            }

          }
        );

      },
      {

        root:
          null,

        /*
           This is important.

           We are NOT triggering the visual
           as soon as the text touches the
           bottom of the screen.

           We wait until the reading beat
           reaches the central reading zone.
        */

        rootMargin:
          "-40% 0px -42% 0px",

        threshold:
          0

      }
    );


  beats.forEach(
    function(beat) {

      observer.observe(
        beat
      );

    }
  );

}


/* ============================================================
   ARRIVAL
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


  const visuals = {

    house: {
      image:
        IMAGE_LIBRARY.house,

      mode:
        "cinematic"
    },

    gate: {
      image:
        IMAGE_LIBRARY.gate,

      mode:
        "cinematic"
    },

    garden: {
      image:
        IMAGE_LIBRARY.garden,

      mode:
        "cinematic"
    },

    detail: {
      image:
        IMAGE_LIBRARY.detail,

      mode:
        "detail"
    },

    "arrival-end": {
      image:
        IMAGE_LIBRARY.arrivalEnd,

      mode:
        "cinematic"
    }

  };


  function activate(
    beat
  ) {

    beats.forEach(
      function(item) {

        item.classList.remove(
          "active"
        );

      }
    );


    beat.classList.add(
      "active"
    );


    const visual =
      visuals[
        beat.dataset.visual
      ];


    if (!visual) {
      return;
    }


    changeVisual({

      image:
        visual.image,

      mode:
        beat.dataset.mode ||
        visual.mode,

      alt:
        beat.dataset.visual,

      imageElement,

      frameElement,

      statusElement,

      status:
        beat.dataset.status

    });

  }


  observeBeats(
    beats,
    activate
  );


  activate(
    beats[0]
  );

}


/* ============================================================
   GARDEN SEQUENCE
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
        "cinematic"
    },

    {
      image:
        IMAGE_LIBRARY.sequence1,

      mode:
        "cinematic"
    },

    {
      image:
        IMAGE_LIBRARY.sequence2,

      mode:
        "portrait"
    },

    {
      image:
        IMAGE_LIBRARY.sequence3,

      mode:
        "detail"
    },

    {
      image:
        IMAGE_LIBRARY.sequence4,

      mode:
        "cinematic"
    }

  ];


  /*
     Create optional navigation dots.
  */

  sequence.forEach(
    function(_, index) {

      const dot =
        document.createElement(
          "button"
        );

      dot.type =
        "button";

      dot.className =
        "sequence-dot";

      dot.setAttribute(
        "aria-label",
        "Visual " +
        (index + 1)
      );


      dot.addEventListener(
        "click",
        function() {

          if (beats[index]) {

            beats[index].scrollIntoView({
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


  function activate(
    beat
  ) {

    beats.forEach(
      function(item) {

        item.classList.remove(
          "active"
        );

      }
    );


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


    dots.forEach(
      function(dot, i) {

        dot.classList.toggle(
          "active",
          i === index
        );

      }
    );


    changeVisual({

      image:
        visual.image,

      mode:
        beat.dataset.mode ||
        visual.mode,

      alt:
        "Visual sequence",

      imageElement,

      frameElement,

      glassElement,

      glassTextElement,

      glassText:
        beat.dataset.glass || "",

      statusElement,

      status:
        beat.dataset.status

    });

  }


  observeBeats(
    beats,
    activate
  );


  activate(
    beats[0]
  );

}


/* ============================================================
   CHARACTER EXPRESSION CHANGE
============================================================ */

function changeCharacterExpression(
  character,
  expression
) {

  const imageElement =
    document.getElementById(
      character === "lexis"
        ? "lexisCharacterImage"
        : "fatherCharacterImage"
    );


  const labelElement =
    document.getElementById(
      character === "lexis"
        ? "lexisExpression"
        : "fatherExpression"
    );


  if (!imageElement) {
    return;
  }


  const map =
    CHARACTER_EXPRESSIONS[
      character
    ];


  if (!map) {
    return;
  }


  const image =
    map[expression];


  if (!image) {
    return;
  }


  if (
    imageElement.dataset.currentExpression ===
    expression
  ) {
    return;
  }


  imageElement.classList.add(
    "expression-changing"
  );


  preloadImage(image)
    .then(
      function(success) {

        if (!success) {
          return;
        }


        imageElement.onload =
          function() {

            imageElement.classList.remove(
              "expression-changing"
            );

          };


        imageElement.src =
          image;

        imageElement.dataset.currentExpression =
          expression;


        if (labelElement) {

          labelElement.textContent =
            expression;

        }

      }
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


  const beats =
    Array.from(
      scene.querySelectorAll(
        ".dialogue-beat"
      )
    );


  function activate(
    beat
  ) {

    beats.forEach(
      function(item) {

        item.classList.remove(
          "active"
        );

      }
    );


    beat.classList.add(
      "active"
    );


    const speaker =
      beat.dataset.speaker;

    const expression =
      beat.dataset.expression;

    const dialogue =
      beat.dataset.dialogue;


    /*
       Speaker focus.
    */

    lexisCharacter.classList.toggle(
      "speaking",
      speaker === "lexis"
    );

    fatherCharacter.classList.toggle(
      "speaking",
      speaker === "father"
    );


    /*
       Expression carousel.

       Each scroll beat can independently
       select an expression.
    */

    changeCharacterExpression(
      speaker,
      expression
    );


    /*
       Dialogue text.
    */

    speakerLabel.textContent =
      speaker === "lexis"
        ? "LEXIS"
        : "FATHER";


    dialogueText.textContent =
      dialogue;


    statusElement.textContent =
      beat.dataset.status;


    /*
       Give the dialogue panel
       a very small entrance movement.
    */

    const panel =
      document.getElementById(
        "dialoguePanel"
      );


    panel.style.transform =
      "translateY(5px)";


    requestAnimationFrame(
      function() {

        panel.style.transform =
          "translateY(0)";

      }
    );

  }


  observeBeats(
    beats,
    activate
  );


  activate(
    beats[0]
  );

}


/* ============================================================
   WARDROBE
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


  const visuals = {

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


  function activate(
    beat
  ) {

    beats.forEach(
      function(item) {

        item.classList.remove(
          "active"
        );

      }
    );


    beat.classList.add(
      "active"
    );


    const visual =
      visuals[
        beat.dataset.visual
      ];


    if (!visual) {
      return;
    }


    changeVisual({

      image:
        visual.image,

      mode:
        beat.dataset.mode ||
        visual.mode,

      alt:
        "Lexis wardrobe moment",

      imageElement,

      frameElement,

      glassElement,

      glassTextElement,

      glassText:
        beat.dataset.glass || "",

      statusElement,

      status:
        beat.dataset.status

    });

  }


  observeBeats(
    beats,
    activate
  );


  activate(
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
        "Her father closes his eyes. When he opens them, he finally admits that the family has been hiding a second line."

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
                "0.4";

            }
          );


          button.style.opacity =
            "1";


          const outcome =
            outcomes[
              button.dataset.choice
            ];


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
        450
      );

    }
  );

}


/* ============================================================
   PROGRESS BAR
============================================================ */

function setupProgressBar() {

  const bar =
    document.getElementById(
      "progressBar"
    );


  function update() {

    const maximum =
      document.documentElement.scrollHeight -
      window.innerHeight;


    if (maximum <= 0) {

      bar.style.width =
        "0%";

      return;

    }


    const progress =
      (
        window.scrollY /
        maximum
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
   IMAGE PRELOADING
============================================================ */

function preloadTheatreImages() {

  const sources =
    Object.values(
      IMAGE_LIBRARY
    );


  sources.forEach(
    function(src) {

      const image =
        new Image();

      image.src =
        src;

    }
  );

}


/* ============================================================
   INIT
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
