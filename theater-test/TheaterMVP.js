/* ============================================================
   CEEQWINN THEATRE MVP
   Visual Story Theatre
============================================================ */


/* ============================================================
   GITHUB IMAGE HELPER
============================================================ */

const GITHUB_ROOT =
    "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/";

function githubImage(path) {

    return GITHUB_ROOT +
        path
            .split("/")
            .map(part => encodeURIComponent(part))
            .join("/");
}


/* ============================================================
   IMAGE LIBRARY
============================================================ */

const IMAGES = {

    /* --------------------------------------------------------
       LEXIS
    -------------------------------------------------------- */

    lexisSoft:
        githubImage(
            "content/images/characters/lexis/outfits/Lexis_Azunna_soft.jpg.jpeg"
        ),

    lexisStreet:
        githubImage(
            "content/images/characters/lexis/outfits/Lexis_Azunna_street.jpg.jpeg"
        ),

    lexisMinistry:
        githubImage(
            "content/images/characters/lexis/outfits/Lexis_Azunna_ministry.jpg.jpeg"
        ),

    lexisBlack:
        githubImage(
            "content/images/characters/lexis/outfits/lexis_black_dress.png.jpeg"
        ),

    lexisRed:
        githubImage(
            "content/images/characters/lexis/outfits/lexis_red_dress.png.jpeg"
        ),


    /* --------------------------------------------------------
       TEMPORARY FATHER TEST PORTRAITS

       These come from the generic image pool you supplied.

       They are intentionally just mechanical test assets.

       When you have dedicated Father expression images,
       replace these URLs only.
    -------------------------------------------------------- */

    father01:
        githubImage(
            "content/images/cinematic_character_portrait_p.jpeg"
        ),

    father02:
        githubImage(
            "content/images/cinematic_character_portrait_p-1.jpeg"
        ),

    father03:
        githubImage(
            "content/images/cinematic_character_portrait_p (1).jpeg"
        ),

    father04:
        githubImage(
            "content/images/cinematic_character_portrait_p (1)-1.jpeg"
        ),

    father05:
        githubImage(
            "content/images/cinematic_character_portrait_p (2).jpeg"
        ),

    father06:
        githubImage(
            "content/images/cinematic_character_portrait_p (2)-1.jpeg"
        ),


    /* --------------------------------------------------------
       CINEMATIC / GENERAL VISUAL TEST ASSETS
    -------------------------------------------------------- */

    theatre:
        githubImage(
            "content/images/Luxurious_royal_theatre_curtai (1).jpeg"
        ),

    atmosphere:
        githubImage(
            "content/images/rainy_atmosphere_cinematic_rai.jpeg"
        ),

    fashion:
        githubImage(
            "content/images/editorial_fashion_portrait_pri.jpeg"
        ),

    detail:
        githubImage(
            "content/images/image-1.png"
        ),

    standalone:
        githubImage(
            "content/images/breathtaking_alla_prima_oil_pa.jpg.jpeg"
        )
};


/* ============================================================
   PRELOAD
============================================================ */

function preloadImages() {

    Object.values(IMAGES).forEach(src => {

        const image = new Image();

        image.src = src;

    });
}


/* ============================================================
   VISUAL THEATRE
============================================================ */

const VISUALS = {

    entry: {
        kicker: "THE HOUSE",
        image: IMAGES.theatre,
        alt: "Cinematic opening environment",
        glass: true,
        glassKicker: "THE MOMENT"
    },

    atmosphere: {
        kicker: "THE SILENCE",
        image: IMAGES.atmosphere,
        alt: "Atmospheric cinematic scene",
        glass: true,
        glassKicker: "THE SILENCE"
    },

    fashion: {
        kicker: "WHAT WAS LEFT",
        image: IMAGES.fashion,
        alt: "Fashion portrait",
        glass: true,
        glassKicker: "THE DISCOVERY"
    },

    detail: {
        kicker: "THE DETAIL",
        image: IMAGES.detail,
        alt: "Story detail",
        glass: false,
        glassKicker: ""
    }
};


const visualStage =
    document.getElementById("visualStage");

const visualImage =
    document.getElementById("visualImage");

const visualKicker =
    document.getElementById("visualKicker");

const visualCounter =
    document.getElementById("visualCounter");

const visualDots =
    document.getElementById("visualDots");

const readingGlass =
    document.getElementById("readingGlass");

const glassText =
    document.getElementById("glassText");

const glassKicker =
    document.getElementById("glassKicker");

const visualTriggers =
    [...document.querySelectorAll(".visual-trigger")];


let currentVisual = null;
let visualChangeToken = 0;


/* ============================================================
   VISUAL DOTS
============================================================ */

visualTriggers.forEach((trigger, index) => {

    const dot = document.createElement("span");

    dot.className = "visual-dot";

    if (index === 0) {
        dot.classList.add("is-active");
    }

    visualDots.appendChild(dot);

});


const visualDotElements =
    [...visualDots.querySelectorAll(".visual-dot")];


/* ============================================================
   SHOW VISUAL
============================================================ */

async function showVisual(key, trigger) {

    if (!VISUALS[key]) {
        return;
    }

    const visual = VISUALS[key];

    if (currentVisual === key) {

        updateGlass(
            trigger,
            visual
        );

        return;
    }

    currentVisual = key;

    visualChangeToken += 1;

    const token = visualChangeToken;


    /* --------------------------------------------------------
       FIRST: REMOVE TEXT

       This happens BEFORE the picture changes.

       This is deliberate.
    -------------------------------------------------------- */

    hideReadingGlass();


    visualStage.classList.add("is-swapping");

    visualImage.classList.add("is-fading");


    await wait(230);


    if (token !== visualChangeToken) {
        return;
    }


    /* --------------------------------------------------------
       CHANGE IMAGE
    -------------------------------------------------------- */

    visualImage.src = visual.image;
    visualImage.alt = visual.alt;

    visualKicker.textContent =
        visual.kicker;

    const activeIndex =
        visualTriggers.indexOf(trigger);

    visualCounter.textContent =
        String(activeIndex + 1).padStart(2, "0") +
        " / " +
        String(visualTriggers.length).padStart(2, "0");


    visualDotElements.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "is-active",
                index === activeIndex
            );

        }
    );


    visualTriggers.forEach(
        item => item.classList.remove("is-active")
    );

    trigger.classList.add("is-active");


    await wait(90);


    visualImage.classList.remove("is-fading");

    visualStage.classList.remove("is-swapping");


    /* --------------------------------------------------------
       READING GLASS
    -------------------------------------------------------- */

    if (
        trigger.dataset.glass === "true" &&
        trigger.querySelector("p")
    ) {

        glassKicker.textContent =
            visual.glassKicker;

        glassText.textContent =
            trigger.querySelector("p").textContent.trim();


        await wait(80);

        if (token !== visualChangeToken) {
            return;
        }

        showReadingGlass();
    }
}


/* ============================================================
   READING GLASS HELPERS
============================================================ */

function showReadingGlass() {

    readingGlass.classList.remove("is-fading");

    readingGlass.classList.add("is-visible");
}


function hideReadingGlass() {

    readingGlass.classList.remove("is-visible");

    readingGlass.classList.add("is-fading");
}


function updateGlass(trigger, visual) {

    if (
        trigger.dataset.glass === "true" &&
        trigger.querySelector("p")
    ) {

        glassKicker.textContent =
            visual.glassKicker;

        glassText.textContent =
            trigger.querySelector("p").textContent.trim();

        showReadingGlass();

    } else {

        hideReadingGlass();

    }
}


/* ============================================================
   VISUAL INTERSECTION OBSERVER
============================================================ */

/*
    IMPORTANT:

    The observer activates a visual while the reader is
    approaching it.

    The actual Reading Glass itself is not allowed to survive
    indefinitely.

    A separate scroll calculation below forces the glass to
    disappear as the reader reaches the midpoint of the image.
*/

const visualObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                const trigger =
                    entry.target;

                const key =
                    trigger.dataset.visual;

                showVisual(
                    key,
                    trigger
                );

            });

        },
        {
            root: null,

            threshold: 0.42,

            rootMargin:
                "-20% 0px -38% 0px"
        }
    );


visualTriggers.forEach(
    trigger => visualObserver.observe(trigger)
);


/* ============================================================
   HARD 50% READING GLASS RULE
============================================================ */

/*
    This is the important part.

    The glass is tied to the VISUAL STAGE itself.

    Once the reader reaches roughly the midpoint of the
    currently visible image stage, the glass disappears.

    This means text can never comfortably sit over the
    face/chest/lower half of the image.
*/

function enforceHalfwayTextExit() {

    if (!currentVisual) {
        return;
    }

    const rect =
        visualStage.getBoundingClientRect();

    const imageHeight =
        rect.height;

    if (imageHeight <= 0) {
        return;
    }


    const midpoint =
        rect.top +
        imageHeight * 0.50;


    /*
       As the image approaches the midpoint of the viewport,
       the glass starts disappearing.

       The glass is therefore gone before the reader reaches
       the middle region of the image.
    */

    const viewportMid =
        window.innerHeight * 0.50;


    const distance =
        midpoint - viewportMid;


    if (distance < 0) {

        hideReadingGlass();

        return;
    }


    /*
       Begin fading slightly before the midpoint.
    */

    if (distance < imageHeight * 0.18) {

        const opacity =
            Math.max(
                0,
                distance / (imageHeight * 0.18)
            );

        readingGlass.style.opacity =
            opacity.toFixed(3);

    } else {

        readingGlass.style.opacity = "";
    }
}


window.addEventListener(
    "scroll",
    enforceHalfwayTextExit,
    {
        passive: true
    }
);

window.addEventListener(
    "resize",
    enforceHalfwayTextExit
);


/* ============================================================
   DIALOGUE DATA
============================================================ */

/*
    Each dialogue beat controls BOTH character carousels.

    The theatre decides which expression/state is visible.

    There is no need for the reader to operate either carousel.
*/

const DIALOGUE = [

    {
        speaker: "lexis",

        line:
            "You knew I was coming.",

        lexis: 0,
        father: 0
    },

    {
        speaker: "father",

        line:
            "I knew you would eventually ask.",

        lexis: 1,
        father: 1
    },

    {
        speaker: "lexis",

        line:
            "That isn't what I asked.",

        lexis: 2,
        father: 2
    },

    {
        speaker: "father",

        line:
            "No. It isn't.",

        lexis: 3,
        father: 3
    },

    {
        speaker: "lexis",

        line:
            "Then tell me the truth.",

        lexis: 4,
        father: 4
    },

    {
        speaker: "father",

        line:
            "The truth is usually less comforting than the story we tell ourselves.",

        lexis: 1,
        father: 5
    }

];


/* ============================================================
   DIALOGUE IMAGE ARRAYS
============================================================ */

const LEXIS_STATES = [

    IMAGES.lexisSoft,
    IMAGES.lexisStreet,
    IMAGES.lexisMinistry,
    IMAGES.lexisBlack,
    IMAGES.lexisRed
];


const FATHER_STATES = [

    IMAGES.father01,
    IMAGES.father02,
    IMAGES.father03,
    IMAGES.father04,
    IMAGES.father05,
    IMAGES.father06
];


/* ============================================================
   DIALOGUE ELEMENTS
============================================================ */

const dialogueTheatre =
    document.getElementById("dialogueTheatre");

const lexisPanel =
    document.getElementById("lexisPanel");

const fatherPanel =
    document.getElementById("fatherPanel");

const lexisImage =
    document.getElementById("lexisImage");

const fatherImage =
    document.getElementById("fatherImage");

const dialogueSpeaker =
    document.getElementById("dialogueSpeaker");

const dialogueLine =
    document.getElementById("dialogueLine");

const dialogueProgress =
    document.getElementById("dialogueProgress");

const lexisDots =
    document.getElementById("lexisDots");

const fatherDots =
    document.getElementById("fatherDots");

const dialogueTriggers =
    [...document.querySelectorAll(".dialogue-trigger")];


/* ============================================================
   EXPRESSION DOTS
============================================================ */

function buildExpressionDots(container, count) {

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {

        const dot =
            document.createElement("span");

        dot.className =
            "expression-dot";

        container.appendChild(dot);
    }
}


buildExpressionDots(
    lexisDots,
    LEXIS_STATES.length
);

buildExpressionDots(
    fatherDots,
    FATHER_STATES.length
);


const lexisDotElements =
    [...lexisDots.querySelectorAll(".expression-dot")];

const fatherDotElements =
    [...fatherDots.querySelectorAll(".expression-dot")];


/* ============================================================
   DIALOGUE PROGRESS DOTS
============================================================ */

DIALOGUE.forEach(
    (beat, index) => {

        const dot =
            document.createElement("span");

        dot.className =
            "dialogue-progress-dot";

        if (index === 0) {
            dot.classList.add("is-active");
        }

        dialogueProgress.appendChild(dot);
    }
);


const dialogueProgressDots =
    [
        ...dialogueProgress.querySelectorAll(
            ".dialogue-progress-dot"
        )
    ];


/* ============================================================
   DIALOGUE STATE
============================================================ */

let currentDialogue =
    -1;

let dialoguePlaying =
    false;

let dialogueTimer =
    null;

let dialogueToken =
    0;

let userInterruptedDialogue =
    false;


/* ============================================================
   ENTER DIALOGUE
============================================================ */

function enterDialogue() {

    if (dialoguePlaying) {
        return;
    }

    dialoguePlaying = true;

    userInterruptedDialogue = false;

    dialogueToken += 1;

    playDialogueBeat(0);
}


/* ============================================================
   PLAY DIALOGUE BEAT
============================================================ */

async function playDialogueBeat(index) {

    if (index < 0 || index >= DIALOGUE.length) {

        finishDialogue();

        return;
    }


    const token =
        dialogueToken;

    const beat =
        DIALOGUE[index];

    currentDialogue =
        index;


    /* --------------------------------------------------------
       ACTIVE SPEAKER
    -------------------------------------------------------- */

    lexisPanel.classList.toggle(
        "is-speaking",
        beat.speaker === "lexis"
    );

    lexisPanel.classList.toggle(
        "is-listening",
        beat.speaker !== "lexis"
    );


    fatherPanel.classList.toggle(
        "is-speaking",
        beat.speaker === "father"
    );

    fatherPanel.classList.toggle(
        "is-listening",
        beat.speaker !== "father"
    );


    /* --------------------------------------------------------
       UPDATE EXPRESSIONS
    -------------------------------------------------------- */

    await changeCharacterImage(
        lexisImage,
        beat.lexis,
        LEXIS_STATES,
        token
    );


    await changeCharacterImage(
        fatherImage,
        beat.father,
        FATHER_STATES,
        token
    );


    if (token !== dialogueToken) {
        return;
    }


    updateExpressionDots(
        lexisDotElements,
        beat.lexis
    );

    updateExpressionDots(
        fatherDotElements,
        beat.father
    );


    dialogueProgressDots.forEach(
        (dot, dotIndex) => {

            dot.classList.toggle(
                "is-active",
                dotIndex === index
            );

        }
    );


    dialogueSpeaker.textContent =
        beat.speaker.toUpperCase();


    dialogueLine.textContent =
        "";


    /* --------------------------------------------------------
       TYPE THE LINE
    -------------------------------------------------------- */

    const finishedNaturally =
        await typeDialogue(
            beat.line,
            token
        );


    if (
        token !== dialogueToken ||
        !dialoguePlaying
    ) {
        return;
    }


    /*
       If the user interrupted the typing,
       don't force an unnecessary delay.
    */

    if (finishedNaturally) {

        await wait(850);

    } else {

        await wait(220);

    }


    if (
        token !== dialogueToken ||
        !dialoguePlaying
    ) {
        return;
    }


    playDialogueBeat(index + 1);
}


/* ============================================================
   CHARACTER IMAGE CHANGE
============================================================ */

async function changeCharacterImage(
    imageElement,
    index,
    states,
    token
) {

    const src =
        states[
            Math.max(
                0,
                Math.min(
                    index,
                    states.length - 1
                )
            )
        ];


    imageElement.classList.add(
        "is-changing"
    );


    await wait(120);


    if (token !== dialogueToken) {
        return;
    }


    imageElement.src =
        src;


    await wait(100);


    if (token !== dialogueToken) {
        return;
    }


    imageElement.classList.remove(
        "is-changing"
    );
}


/* ============================================================
   EXPRESSION DOT UPDATE
============================================================ */

function updateExpressionDots(
    dots,
    activeIndex
) {

    dots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "is-active",
                index === activeIndex
            );

        }
    );
}


/* ============================================================
   TYPEWRITER
============================================================ */

/*
    40ms is intentionally moderate.

    It should feel like speech appearing,
    not like waiting for a computer to type.

    If the user scrolls/taps during typing,
    the current sentence immediately completes.
*/

async function typeDialogue(
    text,
    token
) {

    let interrupted =
        userInterruptedDialogue;

    if (interrupted) {

        dialogueLine.textContent =
            text;

        return false;
    }


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        if (
            token !== dialogueToken ||
            !dialoguePlaying
        ) {
            return false;
        }


        if (userInterruptedDialogue) {

            dialogueLine.textContent =
                text;

            return false;
        }


        dialogueLine.textContent =
            text.slice(0, i + 1);


        /*
           Slightly longer pause after punctuation.
        */

        let delay = 38;

        const character =
            text[i];

        if (
            character === "," ||
            character === ";" ||
            character === ":"
        ) {

            delay = 90;

        }

        if (
            character === "." ||
            character === "!" ||
            character === "?"
        ) {

            delay = 180;

        }


        await wait(delay);
    }


    return true;
}


/* ============================================================
   FINISH DIALOGUE
============================================================ */

function finishDialogue() {

    dialoguePlaying = false;

    currentDialogue =
        DIALOGUE.length - 1;

    dialogueStatusText(
        "CONVERSATION COMPLETE"
    );


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
}


function dialogueStatusText(text) {

    const element =
        document.getElementById(
            "dialogueStatus"
        );

    if (element) {
        element.textContent = text;
    }
}


/* ============================================================
   DIALOGUE AUTO ACTIVATION
============================================================ */

const dialogueObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                const trigger =
                    entry.target;

                const index =
                    Number(
                        trigger.dataset.dialogue
                    );


                /*
                   The first trigger enters the theatre.

                   Later triggers are mainly there to give the
                   browser enough scroll rhythm.

                   The actual dialogue plays itself.
                */

                if (
                    index === 0 &&
                    !dialoguePlaying
                ) {

                    enterDialogue();
                }

            });

        },
        {
            threshold: 0.65
        }
    );


dialogueTriggers.forEach(
    trigger => dialogueObserver.observe(trigger)
);


/* ============================================================
   USER INTERRUPTION
============================================================ */

/*
    If the reader deliberately interacts while dialogue is
    typing, finish the current sentence rather than forcing
    them to wait.
*/

function interruptDialogueTyping() {

    if (!dialoguePlaying) {
        return;
    }

    userInterruptedDialogue = true;
}


window.addEventListener(
    "wheel",
    interruptDialogueTyping,
    {
        passive: true
    }
);

window.addEventListener(
    "touchstart",
    interruptDialogueTyping,
    {
        passive: true
    }
);

window.addEventListener(
    "pointerdown",
    interruptDialogueTyping,
    {
        passive: true
    }
);


/* ============================================================
   DIALOGUE PROGRESS DOT CLICK
============================================================ */

dialogueProgressDots.forEach(
    (dot, index) => {

        dot.style.cursor = "pointer";

        dot.addEventListener(
            "click",
            () => {

                dialogueToken += 1;

                clearTimeout(
                    dialogueTimer
                );

                dialoguePlaying = true;

                userInterruptedDialogue = true;

                playDialogueBeat(index);

            }
        );

    }
);


/* ============================================================
   STANDALONE IMAGE
============================================================ */

const standaloneImage =
    document.getElementById(
        "standaloneImage"
    );

standaloneImage.src =
    IMAGES.standalone;


/* ============================================================
   CHOICES
============================================================ */

const choiceResult =
    document.getElementById(
        "choiceResult"
    );


const choiceResponses = {

    listen:
        "Lexis says nothing. Sometimes silence reveals more than a question.",

    question:
        "She asks the question anyway. The room seems to become smaller.",

    leave:
        "She turns toward the door. Whatever happens next will happen outside this room."
};


document
    .querySelectorAll(".choice-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const choice =
                    button.dataset.choice;

                choiceResult.textContent =
                    choiceResponses[choice];

                document
                    .querySelectorAll(".choice-button")
                    .forEach(
                        other =>
                            other.disabled = true
                    );

                button.style.background =
                    "rgba(177,138,66,0.09)";

                button.style.borderColor =
                    "rgba(177,138,66,0.45)";
            }
        );

    });


/* ============================================================
   SECOND TEST
============================================================ */

const toneResult =
    document.getElementById(
        "toneResult"
    );


const toneResponses = {

    calm:
        "The theatre settles. Longer visual holds. Softer transitions. More breathing room.",

    tension:
        "The theatre tightens. Dialogue becomes more immediate. Visual changes happen closer together.",

    mystery:
        "The theatre withholds information. Images linger longer than the explanations.",

    wonder:
        "The theatre opens up. Larger visuals. More silence. More time to simply look."
};


document
    .querySelectorAll(".tone-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const tone =
                    button.dataset.tone;

                toneResult.textContent =
                    toneResponses[tone];

            }
        );

    });


/* ============================================================
   UTILITY
============================================================ */

function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


/* ============================================================
   INITIALIZE
============================================================ */

function initializeTheatre() {

    preloadImages();


    /*
       Start first visual.
    */

    if (visualTriggers[0]) {

        showVisual(
            visualTriggers[0].dataset.visual,
            visualTriggers[0]
        );
    }


    /*
       Initial dialogue portraits.
    */

    lexisImage.src =
        LEXIS_STATES[0];

    fatherImage.src =
        FATHER_STATES[0];


    /*
       First dialogue progress state.
    */

    updateExpressionDots(
        lexisDotElements,
        0
    );

    updateExpressionDots(
        fatherDotElements,
        0
    );


    dialogueSpeaker.textContent =
        "LEXIS";

    dialogueLine.textContent =
        "";


    /*
       Initial standalone image.
    */

    standaloneImage.src =
        IMAGES.standalone;
}


initializeTheatre();
