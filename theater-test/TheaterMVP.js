/* =========================================================
   CEEQWINN THEATER MVP
   VERSION 2
========================================================= */


/* =========================================================
   VISUAL STORY DATA
========================================================= */

/*
   Each visual is manually assigned.

   The browser does NOT interpret the image.

   We tell the theatre:

       image
       dialogue

   Then the theatre plays them together.
*/


const scenes = {

    morning: {

        beats: [

            {
                image:
                    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_soft.jpg.jpeg",

                dialogue:
                    "Lexis had barely slept."
            },

            {
                image:
                    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/lexis_default.png.jpeg",

                dialogue:
                    "Her father's silence from the night before had followed her into the morning."
            },

            {
                image:
                    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_street.jpg.jpeg",

                dialogue:
                    "Somewhere beyond the walls of the house, preparations for the gathering were already beginning."
            }

        ]

    },


    gathering: {

        beats: [

            {
                image:
                    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/lexis_black_dress.png.jpeg",

                dialogue:
                    "By nightfall, the Okoye residence was glowing."
            },

            {
                image:
                    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/Lexis_Azunna_ministry.jpg.jpeg",

                dialogue:
                    "Cars arrived one after another. Golden light spilled across the entrance."
            },

            {
                image:
                    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/characters/lexis/outfits/lexis_red_dress.png.jpeg",

                dialogue:
                    "Then an elderly man stepped forward. The room became quiet."
            }

        ]

    }

};


/* =========================================================
   THEATRE STATE
========================================================= */

const theatreState = {};


/* =========================================================
   INITIALISE SCENES
========================================================= */

document
    .querySelectorAll(".theater-scene")
    .forEach(sceneElement => {

        const sceneName =
            sceneElement.dataset.scene;

        const sceneData =
            scenes[sceneName];

        if (!sceneData) {
            return;
        }


        const image =
            sceneElement.querySelector(
                ".scene-image"
            );


        const dialogue =
            sceneElement.querySelector(
                ".dialogue-line"
            );


        const current =
            sceneElement.querySelector(
                ".progress-current"
            );


        const total =
            sceneElement.querySelector(
                ".progress-total"
            );


        theatreState[sceneName] = {

            element:
                sceneElement,

            image:
                image,

            dialogue:
                dialogue,

            current:
                current,

            total:
                total,

            beats:
                sceneData.beats,

            index:
                0,

            active:
                false,

            finished:
                false,

            wheelDistance:
                0,

            touchStartY:
                null,

            changing:
                false

        };


        total.textContent =
            sceneData.beats.length;


        /*
           Make sure the first image is
           exactly the manually assigned image.
        */

        image.src =
            sceneData.beats[0].image;

        dialogue.textContent =
            sceneData.beats[0].dialogue;

    });


/* =========================================================
   CHANGE VISUAL BEAT
========================================================= */

function changeBeat(
    scene
) {

    if (
        scene.changing ||
        scene.finished
    ) {
        return;
    }


    const nextIndex =
        scene.index + 1;


    /*
       Last beat reached.
       Release the theatre.
    */

    if (
        nextIndex >= scene.beats.length
    ) {

        finishScene(scene);

        return;

    }


    scene.changing =
        true;


    /*
       Fade the current image away.
    */

    scene.image.classList.add(
        "fade-out"
    );

    scene.dialogue.classList.add(
        "fade"
    );


    setTimeout(() => {

        const beat =
            scene.beats[nextIndex];


        scene.image.src =
            beat.image;

        scene.dialogue.textContent =
            beat.dialogue;


        scene.index =
            nextIndex;


        scene.current.textContent =
            nextIndex + 1;


        /*
           Let the new visual settle.
        */

        requestAnimationFrame(() => {

            scene.image.classList.remove(
                "fade-out"
            );

            scene.dialogue.classList.remove(
                "fade"
            );

        });


        scene.changing =
            false;

    }, 300);

}


/* =========================================================
   PREVIOUS BEAT
========================================================= */

function previousBeat(
    scene
) {

    if (
        scene.changing ||
        scene.finished ||
        scene.index <= 0
    ) {

        return;

    }


    scene.changing =
        true;


    scene.image.classList.add(
        "fade-out"
    );

    scene.dialogue.classList.add(
        "fade"
    );


    setTimeout(() => {

        const previousIndex =
            scene.index - 1;


        const beat =
            scene.beats[
                previousIndex
            ];


        scene.image.src =
            beat.image;

        scene.dialogue.textContent =
            beat.dialogue;


        scene.index =
            previousIndex;


        scene.current.textContent =
            previousIndex + 1;


        requestAnimationFrame(() => {

            scene.image.classList.remove(
                "fade-out"
            );

            scene.dialogue.classList.remove(
                "fade"
            );

        });


        scene.changing =
            false;

    }, 300);

}


/* =========================================================
   FINISH SCENE
========================================================= */

function finishScene(
    scene
) {

    scene.finished =
        true;

    scene.active =
        false;


    scene.element.classList.add(
        "scene-finished"
    );


    /*
       Once finished, the sticky stage naturally
       reaches the end of its scene container.

       The next prose section can now move into
       view normally.
    */

}


/* =========================================================
   WHEEL
========================================================= */

function handleWheel(
    event,
    scene
) {

    if (
        !scene.active ||
        scene.finished
    ) {
        return;
    }


    event.preventDefault();


    scene.wheelDistance +=
        event.deltaY;


    const threshold =
        55;


    if (
        scene.wheelDistance >=
        threshold
    ) {

        scene.wheelDistance =
            0;

        changeBeat(scene);

    }


    if (
        scene.wheelDistance <=
        -threshold
    ) {

        scene.wheelDistance =
            0;

        previousBeat(scene);

    }

}


/* =========================================================
   TOUCH START
========================================================= */

function handleTouchStart(
    event,
    scene
) {

    if (
        !scene.active ||
        scene.finished
    ) {
        return;
    }


    scene.touchStartY =
        event.touches[0].clientY;

}


/* =========================================================
   TOUCH MOVE
========================================================= */

function handleTouchMove(
    event,
    scene
) {

    if (
        !scene.active ||
        scene.finished
    ) {
        return;
    }


    /*
       Hold the page in the current visual
       sequence while the scene is playing.
    */

    event.preventDefault();

}


/* =========================================================
   TOUCH END
========================================================= */

function handleTouchEnd(
    event,
    scene
) {

    if (
        !scene.active ||
        scene.finished
    ) {
        return;
    }


    if (
        scene.touchStartY === null
    ) {
        return;
    }


    const endY =
        event.changedTouches[0].clientY;


    const distance =
        scene.touchStartY - endY;


    const threshold =
        45;


    if (
        Math.abs(distance) >=
        threshold
    ) {

        if (distance > 0) {

            changeBeat(scene);

        } else {

            previousBeat(scene);

        }

    }


    scene.touchStartY =
        null;

}


/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(
    event,
    scene
) {

    if (
        !scene.active ||
        scene.finished
    ) {
        return;
    }


    if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === " "
    ) {

        event.preventDefault();

        changeBeat(scene);

    }


    if (
        event.key === "ArrowUp" ||
        event.key === "PageUp"
    ) {

        event.preventDefault();

        previousBeat(scene);

    }

}


/* =========================================================
   CONNECT INPUT EVENTS
========================================================= */

Object
    .values(theatreState)
    .forEach(scene => {


        scene.element.addEventListener(
            "wheel",
            event => {

                handleWheel(
                    event,
                    scene
                );

            },
            {
                passive: false
            }
        );


        scene.element.addEventListener(
            "touchstart",
            event => {

                handleTouchStart(
                    event,
                    scene
                );

            },
            {
                passive: true
            }
        );


        scene.element.addEventListener(
            "touchmove",
            event => {

                handleTouchMove(
                    event,
                    scene
                );

            },
            {
                passive: false
            }
        );


        scene.element.addEventListener(
            "touchend",
            event => {

                handleTouchEnd(
                    event,
                    scene
                );

            },
            {
                passive: true
            }
        );


        window.addEventListener(
            "keydown",
            event => {

                handleKeyboard(
                    event,
                    scene
                );

            }
        );

    });


/* =========================================================
   SCENE ACTIVATION
========================================================= */

/*
   The scene becomes active when the stage reaches
   the central viewing position.

   This is what gives us:

       TOP BAR
          ↓
       IMAGE
          ↓
       DIALOGUE

   and keeps that little theatre moment in view.
*/

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                const scene =
                    Object
                        .values(theatreState)
                        .find(
                            item =>
                                item.element ===
                                entry.target
                        );


                if (!scene) {
                    return;
                }


                if (
                    entry.isIntersecting &&
                    entry.intersectionRatio >= 0.55 &&
                    !scene.finished
                ) {

                    scene.active =
                        true;

                }

            });

        },
        {
            threshold:
                [0.55]
        }
    );


Object
    .values(theatreState)
    .forEach(scene => {

        observer.observe(
            scene.element
        );

    });


/* =========================================================
   CHOICES
========================================================= */

const consequence =
    document.getElementById(
        "consequence"
    );


document
    .querySelectorAll(".choice-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const choice =
                    button.dataset.choice;


                let text;


                if (
                    choice ===
                    "forward"
                ) {

                    text =
                        "Lexis took one step forward. The room seemed to hold its breath. Whatever her family had hidden, she was finally close enough to see it.";

                }


                if (
                    choice ===
                    "leave"
                ) {

                    text =
                        "Lexis turned away. Before she reached the door, her phone vibrated. One message waited for her: “You chose correctly.”";

                }


                consequence.innerHTML = `

                    <div class="consequence-card">

                        <p>
                            ${text}
                        </p>

                    </div>

                `;


                consequence.classList.add(
                    "visible"
                );


                consequence.scrollIntoView({
                    behavior:
                        "smooth",
                    block:
                        "center"
                });

            }
        );

    });


/* =========================================================
   RESTART
========================================================= */

document
    .getElementById(
        "restartButton"
    )
    .addEventListener(
        "click",
        () => {

            window.location.reload();

        }
    );


/* =========================================================
   IMAGE FALLBACK
========================================================= */

document
    .querySelectorAll(
        ".scene-image"
    )
    .forEach(image => {

        image.addEventListener(
            "error",
            () => {

                console.warn(
                    "Theatre image could not be loaded:",
                    image.src
                );

            }
        );

    });


/* =========================================================
   READY
========================================================= */

console.log(
    "CEEQWINN Theater MVP v2 ready."
);
