/* ============================================================
   CEEQWINN THEATRE MVP
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
       TEMPORARY FATHER TEST STATES
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
       GENERAL VISUALS
    -------------------------------------------------------- */

    house:
        githubImage(
            "content/images/Luxurious_royal_theatre_curtai (1).jpeg"
        ),

    silence:
        githubImage(
            "content/images/rainy_atmosphere_cinematic_rai.jpeg"
        ),

    discovery:
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

    Object.values(IMAGES).forEach(
        src => {

            const image =
                new Image();

            image.src =
                src;
        }
    );
}


/* ============================================================
   PROSE VISUAL DATA
============================================================ */

const PROSE_VISUALS = {

    house: {

        image: IMAGES.house,

        alt:
            "Cinematic environment",

        label:
            "THE HOUSE"
    },


    silence: {

        image: IMAGES.silence,

        alt:
            "Atmospheric cinematic scene",

        label:
            "THE SILENCE"
    },


    discovery: {

        image: IMAGES.discovery,

        alt:
            "Fashion discovery",

        label:
            "THE DISCOVERY"
    },


    detail: {

        image: IMAGES.detail,

        alt:
            "Story detail",

        label:
            "THE DETAIL"
    }
};


/* ============================================================
   PROSE ELEMENTS
============================================================ */

const proseImageStage =
    document.getElementById(
        "proseImageStage"
    );

const proseImage =
    document.getElementById(
        "proseImage"
    );

const proseKicker =
    document.getElementById(
        "proseKicker"
    );

const proseCounter =
    document.getElementById(
        "proseCounter"
    );

const proseReadingGlass =
    document.getElementById(
        "proseReadingGlass"
    );

const proseGlassLabel =
    document.getElementById(
        "proseGlassLabel"
    );

const proseGlassText =
    document.getElementById(
        "proseGlassText"
    );

const proseDots =
    document.getElementById(
        "proseDots"
    );

const proseBeats =
    [
        ...document.querySelectorAll(
            ".prose-beat"
        )
    ];


/* ============================================================
   PROSE DOTS
============================================================ */

proseBeats.forEach(
    (_, index) => {

        const dot =
            document.createElement(
                "span"
            );

        dot.className =
            "prose-dot";

        if (index === 0) {

            dot.classList.add(
                "is-active"
            );
        }

        proseDots.appendChild(
            dot
        );
    }
);


const proseDotElements =
    [
        ...proseDots.querySelectorAll(
            ".prose-dot"
        )
    ];


/* ============================================================
   PROSE STATE
============================================================ */

let currentProseKey =
    null;

let proseToken =
    0;


/* ============================================================
   SHOW PROSE VISUAL
============================================================ */

async function showProseVisual(
    key,
    beat
) {

    const visual =
        PROSE_VISUALS[key];

    if (!visual) {
        return;
    }


    const token =
        ++proseToken;


    /* --------------------------------------------------------
       FIRST: TEXT DISAPPEARS
    -------------------------------------------------------- */

    hideProseGlass();


    proseImageStage.classList.add(
        "is-changing"
    );


    proseImage.classList.add(
        "is-hidden"
    );


    await wait(240);


    if (token !== proseToken) {
        return;
    }


    /* --------------------------------------------------------
       NOW CHANGE IMAGE
    -------------------------------------------------------- */

    proseImage.src =
        visual.image;

    proseImage.alt =
        visual.alt;

    proseKicker.textContent =
        visual.label;


    const index =
        proseBeats.indexOf(
            beat
        );


    proseCounter.textContent =
        String(index + 1).padStart(2, "0") +
        " / " +
        String(proseBeats.length).padStart(2, "0");


    proseDotElements.forEach(
        (dot, dotIndex) => {

            dot.classList.toggle(
                "is-active",
                dotIndex === index
            );
        }
    );


    proseBeats.forEach(
        item =>
            item.classList.remove(
                "is-active"
            )
    );


    beat.classList.add(
        "is-active"
    );


    await wait(100);


    if (token !== proseToken) {
        return;
    }


    proseImage.classList.remove(
        "is-hidden"
    );

    proseImageStage.classList.remove(
        "is-changing"
    );


    /* --------------------------------------------------------
       TEXT RETURNS ONLY IF THIS BEAT NEEDS IT
    -------------------------------------------------------- */

    if (
        beat.dataset.noGlass !== "true"
    ) {

        proseGlassLabel.textContent =
            beat.dataset.label ||
            "THE MOMENT";

        proseGlassText.textContent =
            beat.textContent.trim();


        showProseGlass();
    }
}


/* ============================================================
   GLASS
============================================================ */

function showProseGlass() {

    proseReadingGlass.classList.remove(
        "is-fading"
    );

    proseReadingGlass.classList.add(
        "is-visible"
    );
}


function hideProseGlass() {

    proseReadingGlass.classList.remove(
        "is-visible"
    );

    proseReadingGlass.classList.add(
        "is-fading"
    );
}


/* ============================================================
   PROSE OBSERVER
============================================================ */

const proseObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        !entry.isIntersecting
                    ) {
                        return;
                    }


                    const beat =
                        entry.target;

                    const key =
                        beat.dataset.visual;


                    if (
                        key !== currentProseKey
                    ) {

                        currentProseKey =
                            key;

                        showProseVisual(
                            key,
                            beat
                        );
                    }

                }
            );
        },
        {
            threshold: 0.35,

            rootMargin:
                "-25% 0px -45% 0px"
        }
    );


proseBeats.forEach(
    beat =>
        proseObserver.observe(
            beat
        )
);


/* ============================================================
   HARD MIDPOINT RULE
============================================================ */

/*
    THIS is deliberately strict.

    The prose glass is allowed to exist only while the image
    is in its upper half.

    As the stage approaches its midpoint in the viewport,
    the text fades away.

    At / beyond the midpoint:

        NO TEXT.

        NO GLASS.

        IMAGE ONLY.
*/

function enforceProseMidpoint() {

    if (
        !proseImageStage ||
        !proseReadingGlass.classList.contains(
            "is-visible"
        )
    ) {
        return;
    }


    const rect =
        proseImageStage.getBoundingClientRect();


    const midpoint =
        rect.top +
        rect.height * 0.50;


    const viewportTop =
        window.innerHeight * 0.18;


    /*
       Calculate how close the visual is to the point where
       the reader reaches the middle of the image.

       Once the midpoint enters the upper 18% of the
       viewport, the text is already leaving.
    */

    const fadeStart =
        window.innerHeight * 0.38;


    const distance =
        midpoint - fadeStart;


    if (
        distance <= 0
    ) {

        hideProseGlass();

        proseReadingGlass.style.opacity =
            "0";

        return;
    }


    const fadeDistance =
        Math.max(
            1,
            rect.height * 0.25
        );


    const opacity =
        Math.min(
            1,
            distance / fadeDistance
        );


    proseReadingGlass.style.opacity =
        opacity.toFixed(3);


    /*
       Once the midpoint is reached, enforce zero.
    */

    if (
        midpoint <= viewportTop
    ) {

        hideProseGlass();

        proseReadingGlass.style.opacity =
            "0";
    }
}


window.addEventListener(
    "scroll",
    enforceProseMidpoint,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    enforceProseMidpoint
);


/* ============================================================
   DIALOGUE DATA
============================================================ */

const DIALOGUE = [

    {
        speaker: "lexis",

        text:
            "You knew I was coming.",

        lexis:
            0,

        father:
            0
    },


    {
        speaker: "father",

        text:
            "I knew you would eventually ask.",

        lexis:
            1,

        father:
            1
    },


    {
        speaker: "lexis",

        text:
            "That isn't what I asked.",

        lexis:
            2,

        father:
            2
    },


    {
        speaker: "father",

        text:
            "No. It isn't.",

        lexis:
            3,

        father:
            3
    },


    {
        speaker: "lexis",

        text:
            "Then tell me the truth.",

        lexis:
            4,

        father:
            4
    },


    {
        speaker: "father",

        text:
            "The truth is usually less comforting than the story we tell ourselves.",

        lexis:
            1,

        father:
            5
    }

];


/* ============================================================
   CHARACTER IMAGE STATES
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


const lexisDialogueText =
    document.getElementById(
        "lexisDialogueText"
    );


const fatherDialogueText =
    document.getElementById(
        "fatherDialogueText"
    );


const dialogueCounter =
    document.getElementById(
        "dialogueCounter"
    );


const dialogueProgress =
    document.getElementById(
        "dialogueProgress"
    );


const lexisExpressionDots =
    document.getElementById(
        "lexisExpressionDots"
    );


const fatherExpressionDots =
    document.getElementById(
        "fatherExpressionDots"
    );


/* ============================================================
   EXPRESSION DOTS
============================================================ */

function createDots(
    container,
    count
) {

    container.innerHTML = "";

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const dot =
            document.createElement(
                "span"
            );

        dot.className =
            "expression-dot";

        container.appendChild(
            dot
        );
    }
}


createDots(
    lexisExpressionDots,
    LEXIS_STATES.length
);


createDots(
    fatherExpressionDots,
    FATHER_STATES.length
);


const lexisExpressionDotElements =
    [
        ...lexisExpressionDots.querySelectorAll(
            ".expression-dot"
        )
    ];


const fatherExpressionDotElements =
    [
        ...fatherExpressionDots.querySelectorAll(
            ".expression-dot"
        )
    ];


/* ============================================================
   DIALOGUE PROGRESS DOTS
============================================================ */

DIALOGUE.forEach(
    (_, index) => {

        const dot =
            document.createElement(
                "span"
            );

        dot.className =
            "dialogue-progress-dot";

        if (index === 0) {

            dot.classList.add(
                "is-active"
            );
        }

        dialogueProgress.appendChild(
            dot
        );
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

let dialogueStarted =
    false;

let dialoguePlaying =
    false;

let dialogueIndex =
    -1;

let dialogueToken =
    0;

let typingInProgress =
    false;

let skipTyping =
    false;


/* ============================================================
   ENTER DIALOGUE
============================================================ */

function startDialogue() {

    if (dialogueStarted) {
        return;
    }

    dialogueStarted =
        true;

    dialoguePlaying =
        true;

    dialogueIndex =
        -1;

    playDialogueBeat(0);
}


/* ============================================================
   PLAY DIALOGUE BEAT
============================================================ */

async function playDialogueBeat(
    index
) {

    if (
        index >= DIALOGUE.length
    ) {

        finishDialogue();

        return;
    }


    const token =
        ++dialogueToken;


    const beat =
        DIALOGUE[index];


    dialogueIndex =
        index;


    dialogueCounter.textContent =
        String(index + 1).padStart(2, "0") +
        " / " +
        String(DIALOGUE.length).padStart(2, "0");


    /* --------------------------------------------------------
       ACTIVE SPEAKER
    -------------------------------------------------------- */

    const lexisSpeaking =
        beat.speaker === "lexis";


    lexisPanel.classList.toggle(
        "is-speaking",
        lexisSpeaking
    );


    lexisPanel.classList.toggle(
        "is-listening",
        !lexisSpeaking
    );


    fatherPanel.classList.toggle(
        "is-speaking",
        !lexisSpeaking
    );


    fatherPanel.classList.toggle(
        "is-listening",
        lexisSpeaking
    );


    /* --------------------------------------------------------
       HIDE OLD DIALOGUE
    -------------------------------------------------------- */

    lexisDialogue.classList.remove(
        "is-visible"
    );

    fatherDialogue.classList.remove(
        "is-visible"
    );


    await wait(160);


    if (
        token !== dialogueToken
    ) {
        return;
    }


    /* --------------------------------------------------------
       CHANGE BOTH VISUAL STATES
    -------------------------------------------------------- */

    await changeImage(
        lexisImage,
        LEXIS_STATES[beat.lexis],
        token
    );


    await changeImage(
        fatherImage,
        FATHER_STATES[beat.father],
        token
    );


    updateDots(
        lexisExpressionDotElements,
        beat.lexis
    );


    updateDots(
        fatherExpressionDotElements,
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


    /* --------------------------------------------------------
       CLEAR BOTH LINES
    -------------------------------------------------------- */

    lexisDialogueText.textContent =
        "";

    fatherDialogueText.textContent =
        "";


    /* --------------------------------------------------------
       PUT THE CURRENT SPEAKER'S GLASS ON THEIR IMAGE
    -------------------------------------------------------- */

    const activeDialogue =
        lexisSpeaking
            ? lexisDialogue
            : fatherDialogue;


    const activeText =
        lexisSpeaking
            ? lexisDialogueText
            : fatherDialogueText;


    activeDialogue.classList.add(
        "is-visible"
    );


    /*
       TYPE SLOWLY.

       This is intentionally NOT 38ms.

       65ms gives a much more human rhythm.
    */

    skipTyping =
        false;

    typingInProgress =
        true;


    await typeDialogue(
        activeText,
        beat.text,
        token
    );


    typingInProgress =
        false;


    if (
        token !== dialogueToken ||
        !dialoguePlaying
    ) {
        return;
    }


    /* --------------------------------------------------------
       NATURAL PAUSE

       Gives the reader time to actually read the completed
       sentence before the next person speaks.
    -------------------------------------------------------- */

    await wait(1200);


    if (
        token !== dialogueToken ||
        !dialoguePlaying
    ) {
        return;
    }


    playDialogueBeat(
        index + 1
    );
}


/* ============================================================
   CHANGE CHARACTER IMAGE
============================================================ */

async function changeImage(
    imageElement,
    source,
    token
) {

    imageElement.classList.add(
        "is-changing"
    );


    await wait(130);


    if (
        token !== dialogueToken
    ) {
        return;
    }


    imageElement.src =
        source;


    await wait(170);


    if (
        token !== dialogueToken
    ) {
        return;
    }


    imageElement.classList.remove(
        "is-changing"
    );
}


/* ============================================================
   TYPE DIALOGUE
============================================================ */

/*
    THIS is the behavior you asked for.

    Normal:
        text appears character-by-character.

    If reader taps/clicks:
        current sentence instantly completes.

    The tap does NOT advance the conversation.

    It simply tells the theatre:

        "I'm done waiting for this sentence."
*/

async function typeDialogue(
    element,
    text,
    token
) {

    element.textContent =
        "";


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        if (
            token !== dialogueToken
        ) {
            return;
        }


        /*
           Reader asked us to finish it.
        */

        if (skipTyping) {

            element.textContent =
                text;

            skipTyping =
                false;

            return;
        }


        element.textContent =
            text.slice(
                0,
                i + 1
            );


        let delay =
            68;


        /*
           Natural punctuation pauses.
        */

        const character =
            text[i];


        if (
            character === "," ||
            character === ";" ||
            character === ":"
        ) {

            delay =
                150;
        }


        if (
            character === "." ||
            character === "!" ||
            character === "?"
        ) {

            delay =
                300;
        }


        await wait(delay);
    }
}


/* ============================================================
   TAP / CLICK = FINISH CURRENT LINE
============================================================ */

function handleDialogueInteraction(
    event
) {

    if (
        !dialoguePlaying ||
        !typingInProgress
    ) {
        return;
    }


    /*
       IMPORTANT:

       We do NOT change the beat.

       We do NOT advance the story.

       We only finish the sentence currently typing.
    */

    skipTyping =
        true;
}


dialogueTheatre.addEventListener(
    "click",
    handleDialogueInteraction
);


dialogueTheatre.addEventListener(
    "pointerdown",
    handleDialogueInteraction
);


dialogueTheatre.addEventListener(
    "touchstart",
    handleDialogueInteraction,
    {
        passive: true
    }
);


/* ============================================================
   UPDATE EXPRESSION DOTS
============================================================ */

function updateDots(
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
   FINISH DIALOGUE
============================================================ */

function finishDialogue() {

    dialoguePlaying =
        false;

    typingInProgress =
        false;

    dialogueCounter.textContent =
        "DONE";

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


    /*
       Leave the final dialogue visible briefly.

       Then the theatre becomes quiet.
    */

    setTimeout(
        () => {

            lexisDialogue.classList.remove(
                "is-visible"
            );

            fatherDialogue.classList.remove(
                "is-visible"
            );

        },

        1800
    );
}


/* ============================================================
   DIALOGUE OBSERVER
============================================================ */

const dialogueBeats =
    [
        ...document.querySelectorAll(
            ".dialogue-beat"
        )
    ];


const dialogueObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        !entry.isIntersecting
                    ) {
                        return;
                    }


                    const index =
                        Number(
                            entry.target.dataset.dialogue
                        );


                    /*
                       Only entering the dialogue starts
                       the self-running theatre.

                       We do NOT use every scroll beat
                       to change every sentence.
                    */

                    if (
                        index === 0 &&
                        !dialogueStarted
                    ) {

                        startDialogue();
                    }

                }
            );
        },
        {
            threshold: .55
        }
    );


dialogueBeats.forEach(
    beat =>
        dialogueObserver.observe(
            beat
        )
);


/* ============================================================
   CHOICE TEST
============================================================ */

const choiceResult =
    document.getElementById(
        "choiceResult"
    );


const choiceResponses = {

    listen:
        "Lexis stays quiet. Sometimes silence reveals more than a question.",

    question:
        "She asks the question anyway. The room suddenly feels smaller.",

    leave:
        "She turns toward the door. Whatever happens next will happen outside this room."
};


document
    .querySelectorAll(
        ".choice-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const choice =
                        button.dataset.choice;

                    choiceResult.textContent =
                        choiceResponses[choice];

                }
            );

        }
    );


/* ============================================================
   UTILITY
============================================================ */

function wait(
    milliseconds
) {

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

function initialize() {

    preloadImages();


    /* --------------------------------------------------------
       First prose image
    -------------------------------------------------------- */

    if (
        proseBeats[0]
    ) {

        currentProseKey =
            proseBeats[0].dataset.visual;

        showProseVisual(
            currentProseKey,
            proseBeats[0]
        );
    }


    /* --------------------------------------------------------
       Initial character images
    -------------------------------------------------------- */

    lexisImage.src =
        LEXIS_STATES[0];

    fatherImage.src =
        FATHER_STATES[0];


    /* --------------------------------------------------------
       Standalone image
    -------------------------------------------------------- */

    const standaloneImage =
        document.getElementById(
            "standaloneImage"
        );


    standaloneImage.src =
        IMAGES.standalone;


    /* --------------------------------------------------------
       Initial expression indicators
    -------------------------------------------------------- */

    updateDots(
        lexisExpressionDotElements,
        0
    );

    updateDots(
        fatherExpressionDotElements,
        0
    );
}


initialize();
