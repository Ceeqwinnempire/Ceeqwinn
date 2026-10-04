/* =========================================================
   CEEQWINN THEATER MVP
   Version 2
========================================================= */


/* =========================================================
   MANUAL VISUAL SEQUENCES
========================================================= */

/*
   IMPORTANT:

   These images are deliberately assigned by us.

   The theatre does NOT inspect images.
   The theatre does NOT guess what an image contains.
   The theatre does NOT search for images.

   We tell the theatre exactly which image comes next.
*/

const sequences = {

    morning: [

        "images/morning-01.jpg",

        "images/morning-02.jpg",

        "images/morning-03.jpg"

    ],

    gathering: [

        "images/gathering-01.jpg",

        "images/gathering-02.jpg",

        "images/gathering-03.jpg"

    ]

};


/* =========================================================
   THEATRE STATE
========================================================= */

const theatreState = {

    sequences: {},

    choiceMade: false

};


/* =========================================================
   FIND VISUAL SEQUENCES
========================================================= */

const visualSequences =
    document.querySelectorAll(".visual-sequence");


/* =========================================================
   CREATE SEQUENCE STATE
========================================================= */

visualSequences.forEach(sequenceElement => {

    const name =
        sequenceElement.dataset.sequence;

    const images =
        sequences[name] || [];

    theatreState.sequences[name] = {

        element: sequenceElement,

        images: images,

        currentIndex: 0,

        locked: false,

        finished: false,

        touchStartY: null,

        wheelAccumulator: 0

    };

});


/* =========================================================
   GET IMAGE ELEMENT
========================================================= */

function getImageElement(sequence) {

    return sequence.element.querySelector(
        ".sequence-image"
    );

}


/* =========================================================
   CHANGE IMAGE
========================================================= */

function showSequenceImage(
    sequence,
    newIndex
) {

    if (
        newIndex < 0 ||
        newIndex >= sequence.images.length
    ) {

        return;

    }

    const image =
        getImageElement(sequence);

    if (!image) {
        return;
    }

    image.classList.add("is-changing");


    setTimeout(() => {

        image.src =
            sequence.images[newIndex];

        image.classList.remove(
            "is-changing"
        );

    }, 220);


    sequence.currentIndex =
        newIndex;

}


/* =========================================================
   START SEQUENCE
========================================================= */

function startSequence(sequence) {

    if (
        sequence.finished ||
        sequence.images.length <= 1
    ) {

        return;

    }

    sequence.locked = true;

    sequence.element.classList.add(
        "sequence-active"
    );

}


/* =========================================================
   FINISH SEQUENCE
========================================================= */

function finishSequence(sequence) {

    sequence.locked = false;

    sequence.finished = true;

    sequence.element.classList.remove(
        "sequence-active"
    );

    /*
       Give the browser a tiny moment to settle
       before normal scrolling continues.
    */

    setTimeout(() => {

        sequence.element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, 80);

}


/* =========================================================
   ADVANCE SEQUENCE
========================================================= */

function advanceSequence(sequence) {

    if (!sequence.locked) {
        return;
    }

    const nextIndex =
        sequence.currentIndex + 1;


    if (
        nextIndex >= sequence.images.length
    ) {

        finishSequence(sequence);

        return;

    }


    showSequenceImage(
        sequence,
        nextIndex
    );

}


/* =========================================================
   GO BACK ONE VISUAL
========================================================= */

function previousSequenceImage(sequence) {

    if (!sequence.locked) {
        return;
    }

    const previousIndex =
        sequence.currentIndex - 1;


    if (previousIndex < 0) {
        return;
    }


    showSequenceImage(
        sequence,
        previousIndex
    );

}


/* =========================================================
   WHEEL CONTROL
========================================================= */

function handleWheel(event, sequence) {

    if (!sequence.locked) {
        return;
    }


    event.preventDefault();


    sequence.wheelAccumulator +=
        event.deltaY;


    const threshold = 45;


    if (
        sequence.wheelAccumulator >=
        threshold
    ) {

        sequence.wheelAccumulator = 0;

        advanceSequence(sequence);

    }


    if (
        sequence.wheelAccumulator <=
        -threshold
    ) {

        sequence.wheelAccumulator = 0;

        previousSequenceImage(sequence);

    }

}


/* =========================================================
   TOUCH START
========================================================= */

function handleTouchStart(
    event,
    sequence
) {

    if (!sequence.locked) {
        return;
    }

    sequence.touchStartY =
        event.touches[0].clientY;

}


/* =========================================================
   TOUCH MOVE
========================================================= */

function handleTouchMove(
    event,
    sequence
) {

    if (!sequence.locked) {
        return;
    }

    /*
       While the visual sequence is active,
       don't let the page move away from the
       current visual.
    */

    event.preventDefault();

}


/* =========================================================
   TOUCH END
========================================================= */

function handleTouchEnd(
    event,
    sequence
) {

    if (!sequence.locked) {
        return;
    }


    if (
        sequence.touchStartY === null
    ) {

        return;

    }


    const endY =
        event.changedTouches[0].clientY;


    const distance =
        sequence.touchStartY - endY;


    const threshold = 45;


    if (Math.abs(distance) >= threshold) {

        if (distance > 0) {

            advanceSequence(sequence);

        } else {

            previousSequenceImage(sequence);

        }

    }


    sequence.touchStartY = null;

}


/* =========================================================
   KEYBOARD CONTROL
========================================================= */

function handleKeyboard(
    event,
    sequence
) {

    if (!sequence.locked) {
        return;
    }


    if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === " "
    ) {

        event.preventDefault();

        advanceSequence(sequence);

    }


    if (
        event.key === "ArrowUp" ||
        event.key === "PageUp"
    ) {

        event.preventDefault();

        previousSequenceImage(sequence);

    }

}


/* =========================================================
   CONNECT EVENTS
========================================================= */

visualSequences.forEach(sequenceElement => {

    const name =
        sequenceElement.dataset.sequence;

    const sequence =
        theatreState.sequences[name];


    sequenceElement.addEventListener(
        "wheel",
        event => {

            handleWheel(
                event,
                sequence
            );

        },
        {
            passive: false
        }
    );


    sequenceElement.addEventListener(
        "touchstart",
        event => {

            handleTouchStart(
                event,
                sequence
            );

        },
        {
            passive: true
        }
    );


    sequenceElement.addEventListener(
        "touchmove",
        event => {

            handleTouchMove(
                event,
                sequence
            );

        },
        {
            passive: false
        }
    );


    sequenceElement.addEventListener(
        "touchend",
        event => {

            handleTouchEnd(
                event,
                sequence
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
                sequence
            );

        }
    );

});


/* =========================================================
   OBSERVER
========================================================= */

/*
   The slideshow becomes active when its visual card
   reaches the main viewing area.

   This means the user doesn't immediately get trapped
   when opening the page.
*/

const sequenceObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                const sequenceElement =
                    entry.target;

                const name =
                    sequenceElement.dataset.sequence;

                const sequence =
                    theatreState.sequences[name];


                if (
                    entry.isIntersecting &&
                    entry.intersectionRatio >= 0.65 &&
                    !sequence.finished
                ) {

                    startSequence(sequence);

                }

            });

        },
        {
            threshold: [0.65]
        }
    );


visualSequences.forEach(
    sequenceElement => {

        sequenceObserver.observe(
            sequenceElement
        );

    }
);


/* =========================================================
   CHOICES
========================================================= */

const choiceButtons =
    document.querySelectorAll(
        ".choice-button"
    );

const consequence =
    document.getElementById(
        "consequence"
    );


function showConsequence(choice) {

    let text = "";


    if (choice === "forward") {

        text =
            "Lexis took one step forward. The room seemed to hold its breath. Whatever her family had hidden, she was finally close enough to see it.";

    }


    if (choice === "leave") {

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
        behavior: "smooth",
        block: "center"
    });


    theatreState.choiceMade = true;

}


/* =========================================================
   CHOICE EVENTS
========================================================= */

choiceButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const choice =
                button.dataset.choice;

            showConsequence(choice);

        }
    );

});


/* =========================================================
   RESTART
========================================================= */

const restartButton =
    document.getElementById(
        "restartButton"
    );


restartButton.addEventListener(
    "click",
    () => {

        window.location.reload();

    }
);


/* =========================================================
   IMAGE ERROR FALLBACK
========================================================= */

document
    .querySelectorAll(".sequence-image")
    .forEach(image => {

        image.addEventListener(
            "error",
            () => {

                image.style.objectFit =
                    "contain";

                image.style.padding =
                    "30px";

                image.style.background =
                    "#f1e8ee";

            }
        );

    });


/* =========================================================
   READY
========================================================= */

console.log(
    "CEEQWINN Theater MVP loaded."
);
