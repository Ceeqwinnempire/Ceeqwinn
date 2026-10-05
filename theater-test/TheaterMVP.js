/* =========================================================
   CEEQWINN THEATER MVP
   JavaScript
   ========================================================= */


/* =========================================================
   IMAGE BASE
   ========================================================= */

const IMAGE_BASE =
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/";


/* =========================================================
   VISUAL SEQUENCES
   =========================================================

   IMPORTANT:

   Each scene can contain as many visual beats as we want.

   Every beat has:

   image
   speaker
   dialogue
   alt

   The dots are automatically created from the number
   of beats.

   3 beats = 3 dots.
   5 beats = 5 dots.
   8 beats = 8 dots.

   The browser does NOT inspect the images.
   We manually decide which image belongs to which beat.
   ========================================================= */


const SCENES = {

    morning: {

        beats: [

            {
                image:
                    IMAGE_BASE +
                    "Lexis_Azunna_soft.jpg.jpeg",

                speaker:
                    "Lexis",

                dialogue:
                    "I barely slept.",

                alt:
                    "Lexis in a quiet morning setting."
            },

            {
                image:
                    IMAGE_BASE +
                    "lexis_default.png.jpeg",

                speaker:
                    "Lexis",

                dialogue:
                    "Dad wouldn't even look at me after I asked him.",

                alt:
                    "Lexis during the morning after the difficult question."
            },

            {
                image:
                    IMAGE_BASE +
                    "Lexis_Azunna_street.jpg.jpeg",

                speaker:
                    "Lexis",

                dialogue:
                    "And tonight, apparently, everyone expects me to pretend that nothing is wrong.",

                alt:
                    "Lexis preparing herself for the night ahead."
            }

        ]

    },


    /* =====================================================
       REAL SLIDESHOW DEMONSTRATION
       ===================================================== */

    gathering: {

        beats: [

            {
                image:
                    IMAGE_BASE +
                    "lexis_black_dress.png.jpeg",

                speaker:
                    "Father",

                dialogue:
                    "Stay close to me tonight.",

                alt:
                    "Lexis dressed for the gathering."
            },

            {
                image:
                    IMAGE_BASE +
                    "Lexis_Azunna_ministry.jpg.jpeg",

                speaker:
                    "Lexis",

                dialogue:
                    "Why?",

                alt:
                    "Lexis looking toward her father."
            },

            {
                image:
                    IMAGE_BASE +
                    "Lexis_Azunna_soft.jpg.jpeg",

                speaker:
                    "Father",

                dialogue:
                    "Because there are things about this family that you are not ready to know.",

                alt:
                    "A quiet visual beat before the family gathering."
            },

            {
                image:
                    IMAGE_BASE +
                    "lexis_red_dress.png.jpeg",

                speaker:
                    "Lexis",

                dialogue:
                    "Then maybe tonight is exactly when I need to know them.",

                alt:
                    "Lexis facing what comes next."
            }

        ]

    },


    /* =====================================================
       DIALOGUE DEMONSTRATION
       ===================================================== */

    father: {

        beats: [

            {
                image:
                    IMAGE_BASE +
                    "Lexis_Azunna_soft.jpg.jpeg",

                speaker:
                    "Lexis",

                dialogue:
                    "Then tell me the truth.",

                alt:
                    "Lexis asking for the truth."
            },

            {
                image:
                    IMAGE_BASE +
                    "Lexis_Azunna_ministry.jpg.jpeg",

                speaker:
                    "Father",

                dialogue:
                    "Some truths don't stay quiet once they're spoken.",

                alt:
                    "A tense moment between Lexis and her father."
            },

            {
                image:
                    IMAGE_BASE +
                    "lexis_black_dress.png.jpeg",

                speaker:
                    "Lexis",

                dialogue:
                    "Then maybe it's time somebody finally spoke.",

                alt:
                    "Lexis deciding to face the family secret."
            }

        ]

    }

};


/* =========================================================
   STATE
   ========================================================= */

const theaterState = new WeakMap();


/* =========================================================
   DOM HELPERS
   ========================================================= */

function qs(parent, selector) {

    return parent.querySelector(selector);

}


function qsa(parent, selector) {

    return Array.from(
        parent.querySelectorAll(selector)
    );

}


/* =========================================================
   CREATE DOTS
   ========================================================= */

function createDots(sceneElement, state) {

    const dotsContainer =
        qs(sceneElement, ".slide-dots");

    dotsContainer.innerHTML = "";


    state.beats.forEach(
        (beat, index) => {

            const dot =
                document.createElement("button");


            dot.type = "button";

            dot.className =
                "slide-dot";


            dot.setAttribute(
                "aria-label",
                "Show visual " + (index + 1)
            );


            dot.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    showBeat(
                        sceneElement,
                        index,
                        true
                    );

                }
            );


            dotsContainer.appendChild(dot);

        }
    );

}


/* =========================================================
   UPDATE DOTS
   ========================================================= */

function updateDots(sceneElement, activeIndex) {

    const dots =
        qsa(sceneElement, ".slide-dot");


    dots.forEach(
        (dot, index) => {

            const active =
                index === activeIndex;


            dot.classList.toggle(
                "is-active",
                active
            );


            dot.setAttribute(
                "aria-current",
                active
                    ? "true"
                    : "false"
            );

        }
    );

}


/* =========================================================
   UPDATE SCENE COUNTER
   ========================================================= */

function updateSceneCounter(sceneElement) {

    const counter =
        document.getElementById(
            "sceneCounter"
        );


    if (!counter) {
        return;
    }


    const number =
        sceneElement.dataset.sceneNumber ||
        "01";


    counter.textContent =
        number + " / 03";

}


/* =========================================================
   SHOW BEAT
   ========================================================= */

function showBeat(
    sceneElement,
    index,
    userSelected
) {

    const state =
        theaterState.get(sceneElement);


    if (!state) {
        return;
    }


    if (
        index < 0 ||
        index >= state.beats.length
    ) {
        return;
    }


    const beat =
        state.beats[index];


    const image =
        qs(
            sceneElement,
            ".scene-image"
        );


    const speaker =
        qs(
            sceneElement,
            ".speaker-name"
        );


    const dialogue =
        qs(
            sceneElement,
            ".dialogue-text"
        );


    const frame =
        qs(
            sceneElement,
            ".visual-frame"
        );


    /*
       Fade image out first.
    */

    image.classList.add(
        "is-changing"
    );


    window.setTimeout(
        function() {

            image.onload =
                function() {

                    frame.classList.add(
                        "is-loaded"
                    );

                    image.classList.remove(
                        "is-changing"
                    );

                };


            image.src =
                beat.image;


            image.alt =
                beat.alt;


            speaker.textContent =
                beat.speaker;


            dialogue.textContent =
                beat.dialogue;


            state.index =
                index;


            updateDots(
                sceneElement,
                index
            );


            /*
               If the image is already cached,
               onload may already have happened.
            */

            if (image.complete) {

                frame.classList.add(
                    "is-loaded"
                );

                image.classList.remove(
                    "is-changing"
                );

            }

        },
        180
    );


    /*
       A manually selected dot should not
       accidentally finish the sequence.
    */

    if (userSelected) {

        state.lastInteraction =
            Date.now();

    }

}


/* =========================================================
   NEXT BEAT
   ========================================================= */

function nextBeat(sceneElement) {

    const state =
        theaterState.get(sceneElement);


    if (!state) {
        return;
    }


    if (
        state.index <
        state.beats.length - 1
    ) {

        showBeat(
            sceneElement,
            state.index + 1,
            false
        );

        return;
    }


    /*
       We are already on the final visual.
       The theatre releases control so the
       reader can continue naturally.
    */

    finishScene(
        sceneElement
    );

}


/* =========================================================
   PREVIOUS BEAT
   ========================================================= */

function previousBeat(sceneElement) {

    const state =
        theaterState.get(sceneElement);


    if (!state) {
        return;
    }


    if (state.index > 0) {

        showBeat(
            sceneElement,
            state.index - 1,
            false
        );

    }

}


/* =========================================================
   FINISH SCENE
   ========================================================= */

function finishScene(sceneElement) {

    const state =
        theaterState.get(sceneElement);


    if (!state) {
        return;
    }


    state.active =
        false;


    sceneElement.classList.remove(
        "is-active"
    );


    /*
       Once the visual sequence is finished,
       normal page scrolling is restored.
    */

    document.body.style.overflow =
        "";


    /*
       Put the next prose naturally below
       the completed visual theatre.
    */

    const nextContent =
        sceneElement.nextElementSibling;


    if (
        nextContent &&
        nextContent.classList.contains(
            "story-prose"
        )
    ) {

        window.setTimeout(
            function() {

                const rect =
                    nextContent.getBoundingClientRect();


                if (
                    rect.top <
                    window.innerHeight * 0.2
                ) {

                    window.scrollBy(
                        0,
                        80
                    );

                }

            },
            120
        );

    }

}


/* =========================================================
   START SCENE
   ========================================================= */

function startScene(sceneElement) {

    const state =
        theaterState.get(sceneElement);


    if (!state) {
        return;
    }


    if (state.finished) {
        return;
    }


    state.active =
        true;


    state.finished =
        false;


    sceneElement.classList.add(
        "is-active"
    );


    updateSceneCounter(
        sceneElement
    );


    /*
       We intentionally do NOT lock the entire
       body scroll here.

       The theatre listens for directional gestures
       only while the visual sequence is active.
    */

}


/* =========================================================
   INTERSECTION OBSERVER
   ========================================================= */

const sceneObserver =
    new IntersectionObserver(
        function(entries) {

            entries.forEach(
                function(entry) {

                    if (
                        entry.isIntersecting &&
                        entry.intersectionRatio >= 0.55
                    ) {

                        startScene(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold: [
                0.55
            ]
        }
    );


/* =========================================================
   TOUCH HANDLING
   ========================================================= */

function setupTouchControls(
    sceneElement
) {

    const state =
        theaterState.get(sceneElement);


    let startX = 0;
    let startY = 0;

    let touching =
        false;


    sceneElement.addEventListener(
        "touchstart",
        function(event) {

            if (!state.active) {
                return;
            }


            const touch =
                event.touches[0];


            startX =
                touch.clientX;


            startY =
                touch.clientY;


            touching =
                true;

        },
        {
            passive: true
        }
    );


    sceneElement.addEventListener(
        "touchend",
        function(event) {

            if (!state.active) {
                return;
            }


            if (!touching) {
                return;
            }


            touching =
                false;


            const touch =
                event.changedTouches[0];


            const endX =
                touch.clientX;


            const endY =
                touch.clientY;


            const deltaX =
                endX - startX;


            const deltaY =
                endY - startY;


            /*
               Horizontal swipe:
               definitely a slideshow gesture.
            */

            if (
                Math.abs(deltaX) >
                Math.abs(deltaY) &&
                Math.abs(deltaX) > 45
            ) {

                if (deltaX < 0) {

                    nextBeat(
                        sceneElement
                    );

                } else {

                    previousBeat(
                        sceneElement
                    );

                }

                return;
            }


            /*
               Vertical swipe:
               also controls the visual sequence
               while the theatre is active.
            */

            if (
                Math.abs(deltaY) > 45
            ) {

                if (deltaY < 0) {

                    nextBeat(
                        sceneElement
                    );

                } else {

                    previousBeat(
                        sceneElement
                    );

                }

            }

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   WHEEL CONTROLS
   ========================================================= */

function setupWheelControls(
    sceneElement
) {

    const state =
        theaterState.get(sceneElement);


    let wheelLock =
        false;


    sceneElement.addEventListener(
        "wheel",
        function(event) {

            if (!state.active) {
                return;
            }


            if (wheelLock) {
                return;
            }


            /*
               Only capture meaningful wheel movement.
            */

            if (
                Math.abs(event.deltaY) < 15
            ) {

                return;

            }


            wheelLock =
                true;


            if (
                event.deltaY > 0
            ) {

                nextBeat(
                    sceneElement
                );

            } else {

                previousBeat(
                    sceneElement
                );

            }


            window.setTimeout(
                function() {

                    wheelLock =
                        false;

                },
                500
            );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

function setupKeyboardControls(
    sceneElement
) {

    const state =
        theaterState.get(sceneElement);


    document.addEventListener(
        "keydown",
        function(event) {

            if (!state.active) {
                return;
            }


            /*
               Do not hijack keys while the user
               is typing into an input.
            */

            const tag =
                document.activeElement
                    ?.tagName;


            if (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                tag === "SELECT"
            ) {

                return;

            }


            if (
                event.key === "ArrowRight" ||
                event.key === "ArrowDown"
            ) {

                event.preventDefault();

                nextBeat(
                    sceneElement
                );

            }


            if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowUp"
            ) {

                event.preventDefault();

                previousBeat(
                    sceneElement
                );

            }

        }
    );

}


/* =========================================================
   INITIALIZE SCENES
   ========================================================= */

function initializeScenes() {

    const sceneElements =
        qsa(
            document,
            ".theater-scene"
        );


    sceneElements.forEach(
        function(sceneElement) {

            const sceneName =
                sceneElement.dataset.scene;


            const sceneData =
                SCENES[sceneName];


            if (!sceneData) {
                return;
            }


            const state = {

                beats:
                    sceneData.beats,

                index:
                    0,

                active:
                    false,

                finished:
                    false,

                lastInteraction:
                    0

            };


            theaterState.set(
                sceneElement,
                state
            );


            createDots(
                sceneElement,
                state
            );


            showBeat(
                sceneElement,
                0,
                false
            );


            setupTouchControls(
                sceneElement
            );


            setupWheelControls(
                sceneElement
            );


            setupKeyboardControls(
                sceneElement
            );


            sceneObserver.observe(
                sceneElement
            );

        }
    );

}


/* =========================================================
   CHOICES
   ========================================================= */

function initializeChoices() {

    const buttons =
        qsa(
            document,
            ".choice-button"
        );


    const result =
        document.getElementById(
            "choiceResult"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const choice =
                        button.dataset.choice;


                    if (
                        choice === "forward"
                    ) {

                        result.textContent =
                            "Lexis takes a breath and walks forward. Whatever happens next, she is no longer willing to stand outside the truth.";

                    }


                    if (
                        choice === "leave"
                    ) {

                        result.textContent =
                            "Lexis quietly steps away. But leaving the room does not make the questions disappear.";

                    }


                    result.classList.add(
                        "is-visible"
                    );


                    buttons.forEach(
                        function(otherButton) {

                            otherButton.disabled =
                                true;

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeScenes();

        initializeChoices();

    }
);
