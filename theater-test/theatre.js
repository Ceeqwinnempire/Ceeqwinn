/* =========================================================
   CEEQWINN THEATRE
   Chapter 2 Prototype
   ========================================================= */


/* =========================================================
   IMAGE LIBRARY
   =========================================================
   
   These are deliberately MANUAL.

   The theatre does not inspect the pictures.
   The theatre does not guess.
   The theatre does not search.

   We tell it exactly which image belongs
   to each visual beat.
   ========================================================= */

const IMAGES = {

    openingA:
        "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/Lexis_Azunna_soft.jpg.jpeg",

    openingB:
        "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/lexis_default.png.jpeg",

    openingC:
        "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/Lexis_Azunna_street.jpg.jpeg",

    gathering:
        "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/lexis_black_dress.png.jpeg",

    announcement:
        "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/Lexis_Azunna_militarily.jpg.jpeg",

    woman:
        "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/lexis_red_dress.png.jpeg",

    archive:
        "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/Lexis_Azunna_ministry.jpg.jpeg",

    key:
        "https://raw.githubusercontent.com/Ceeqwinnempire/Ceeqwinn/main/content/images/lexis_default.png.jpeg"

};


/* =========================================================
   ELEMENTS
   ========================================================= */

const stageImage =
    document.getElementById("stageImage");

const stageCaption =
    document.getElementById("stageCaption");

const branchLabel =
    document.getElementById("branchLabel");

const resetButton =
    document.getElementById("resetButton");

const openingContent =
    document.getElementById("openingContent");

const choiceOneResult =
    document.getElementById("choiceOneResult");

const choiceTwoResult =
    document.getElementById("choiceTwoResult");

const chapterThreeButton =
    document.getElementById("chapterThreeButton");


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY =
    "ceeqwinn_theatre_test_choice03";


/* =========================================================
   STATE
   ========================================================= */

let state = {

    opening:
        localStorage.getItem(STORAGE_KEY)
        || "A",

    choiceOne:
        null,

    choiceTwo:
        null

};


/* =========================================================
   VISUAL DIRECTOR
   ========================================================= */

function showVisual(
    image,
    caption = ""
) {

    if (!stageImage) {
        return;
    }


    /*
     * Fade out first.
     */

    stageImage.style.opacity = "0";


    setTimeout(function () {

        stageImage.src = image;

        stageImage.alt =
            caption || "Story visual";


        /*
         * Fade back in.
         */

        stageImage.style.opacity = "1";


        if (caption) {

            stageCaption.textContent =
                caption;

            stageCaption.classList.add(
                "visible"
            );

        } else {

            stageCaption.textContent = "";

            stageCaption.classList.remove(
                "visible"
            );

        }

    }, 220);

}


/* =========================================================
   OPENING TEXT
   ========================================================= */

function renderOpening() {

    let html = "";


    if (state.opening === "A") {

        branchLabel.textContent =
            "Opening A — The Question";


        showVisual(
            IMAGES.openingA,
            "The morning after the question"
        );


        html = `

            <h2>
                THE MORNING AFTER THE QUESTION
            </h2>

            <p>
                Lexis barely slept.
            </p>

            <p>
                Her father's silence kept returning
                to her mind.
            </p>

            <p>
                The First Heir.
            </p>

            <p>
                The gathering.
            </p>

            <p>
                Whatever was coming,
                she knew it was bigger than
                anything her family had told her.
            </p>

        `;

    }


    else if (state.opening === "B") {

        branchLabel.textContent =
            "Opening B — The Secret";


        showVisual(
            IMAGES.openingB,
            "The morning after the secret"
        );


        html = `

            <h2>
                THE MORNING AFTER THE SECRET
            </h2>

            <p>
                Lexis had made a decision.
            </p>

            <p>
                She was going to investigate.
            </p>

            <p>
                She would not tell her father
                everything she had discovered.
            </p>

            <p>
                Not yet.
            </p>

            <p>
                Something about the previous night
                had made her realize that silence
                could be just as dangerous as the truth.
            </p>

        `;

    }


    else {

        branchLabel.textContent =
            "Opening C — The Warning";


        showVisual(
            IMAGES.openingC,
            "The morning after the warning"
        );


        html = `

            <h2>
                THE MORNING AFTER THE WARNING
            </h2>

            <p>
                Her father had seen the messages.
            </p>

            <p>
                And for the first time,
                Lexis had seen fear in his face.
            </p>

            <p>
                The gathering was supposed
                to be a family event.
            </p>

            <p>
                But now it felt like a trap.
            </p>

        `;

    }


    openingContent.innerHTML =
        html;

}


/* =========================================================
   SECTION VISUAL DIRECTOR
   ========================================================= */

function setupVisualMarkers() {

    const markers =
        document.querySelectorAll(
            ".section-marker"
        );


    const observer =
        new IntersectionObserver(

            function(entries) {

                entries.forEach(
                    function(entry) {

                        if (!entry.isIntersecting) {
                            return;
                        }


                        const visual =
                            entry.target.dataset.visual;


                        if (
                            visual ===
                            "gathering"
                        ) {

                            showVisual(
                                IMAGES.gathering,
                                "The night of the gathering"
                            );

                        }


                        if (
                            visual ===
                            "announcement"
                        ) {

                            showVisual(
                                IMAGES.announcement,
                                "The announcement"
                            );

                        }


                        if (
                            visual ===
                            "woman"
                        ) {

                            showVisual(
                                IMAGES.woman,
                                "The woman in green"
                            );

                        }


                        if (
                            visual ===
                            "key"
                        ) {

                            showVisual(
                                IMAGES.key,
                                "The key"
                            );

                        }

                    }
                );

            },

            {
                threshold: 0.35
            }

        );


    markers.forEach(
        function(marker) {

            observer.observe(
                marker
            );

        }
    );

}


/* =========================================================
   CHOICE ONE
   ========================================================= */

function setupChoiceOne() {

    const buttons =
        document.querySelectorAll(
            "#choiceOne .choice-button"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const choice =
                        button.dataset.choice;


                    state.choiceOne =
                        choice;


                    if (
                        choice ===
                        "forward"
                    ) {

                        choiceOneResult.innerHTML = `

                            <div class="dialogue">

                                <span class="speaker">
                                    THE ELDERLY MAN
                                </span>

                                <p>
                                    You carry the bloodline
                                    of the First Heir.
                                </p>

                            </div>

                            <p>
                                A photograph was placed
                                in Lexis's hands.
                            </p>

                            <p>
                                The face that had always
                                been obscured was finally visible.
                            </p>

                            <p>
                                Her aunt.
                            </p>

                            <div class="dialogue">

                                <span class="speaker">
                                    SIRENA
                                </span>

                                <p>
                                    She was my sister.
                                </p>

                            </div>

                            <p>
                                Her father had lied.
                            </p>

                        `;

                    }


                    else {

                        choiceOneResult.innerHTML = `

                            <p>
                                Lexis turned away.
                            </p>

                            <p>
                                She left the gathering
                                before anyone could stop her.
                            </p>

                            <p>
                                Her phone vibrated.
                            </p>

                            <div class="dialogue">

                                <span class="speaker">
                                    UNKNOWN
                                </span>

                                <p>
                                    You chose correctly.
                                </p>

                            </div>

                            <div class="dialogue">

                                <span class="speaker">
                                    UNKNOWN
                                </span>

                                <p>
                                    Now go home.
                                </p>

                            </div>

                            <div class="dialogue">

                                <span class="speaker">
                                    UNKNOWN
                                </span>

                                <p>
                                    Don't trust the woman in green.
                                </p>

                            </div>

                            <p>
                                From the mansion doorway,
                                the woman in emerald watched her leave.
                            </p>

                        `;

                    }


                    buttons.forEach(
                        function(item) {

                            item.disabled = true;

                            item.style.opacity =
                                "0.45";

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   CHOICE TWO
   ========================================================= */

function setupChoiceTwo() {

    const buttons =
        document.querySelectorAll(
            "#choiceTwo .choice-button"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const choice =
                        button.dataset.choice;


                    state.choiceTwo =
                        choice;


                    if (
                        choice ===
                        "ask"
                    ) {

                        showVisual(
                            IMAGES.archive,
                            "The family archive"
                        );


                        choiceTwoResult.innerHTML = `

                            <p>
                                Lexis asked her father
                                what he had been hiding.
                            </p>

                            <p>
                                He finally told her
                                about the first chosen heir.
                            </p>

                            <p>
                                Her aunt had once been
                                chosen to inherit the Okoye legacy.
                            </p>

                            <p>
                                But she refused.
                            </p>

                            <p>
                                She had discovered
                                a hidden family secret.
                            </p>

                            <p>
                                Another child.
                            </p>

                            <p>
                                A child erased
                                from the family records.
                            </p>

                            <div class="dialogue">

                                <span class="speaker">
                                    HER FATHER
                                </span>

                                <p>
                                    The second line lives.
                                </p>

                            </div>

                        `;

                    }


                    else {

                        showVisual(
                            IMAGES.archive,
                            "The private archive"
                        );


                        choiceTwoResult.innerHTML = `

                            <p>
                                Lexis entered the private archive.
                            </p>

                            <p>
                                She found a file
                                hidden among the old records.
                            </p>

                            <div class="dialogue">

                                <span class="speaker">
                                    THE FILE
                                </span>

                                <p>
                                    THE FIRST HEIR MUST NEVER
                                    LEARN ABOUT THE SECOND LINE.
                                </p>

                            </div>

                            <p>
                                An unknown number sent
                                another message.
                            </p>

                            <div class="dialogue">

                                <span class="speaker">
                                    UNKNOWN
                                </span>

                                <p>
                                    Third shelf.
                                </p>

                            </div>

                            <p>
                                Lexis found a metal key.
                            </p>

                        `;

                    }


                    buttons.forEach(
                        function(item) {

                            item.disabled = true;

                            item.style.opacity =
                                "0.45";

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   RESET
   ========================================================= */

function resetTheatre() {

    localStorage.removeItem(
        STORAGE_KEY
    );


    state = {

        opening: "A",

        choiceOne: null,

        choiceTwo: null

    };


    choiceOneResult.innerHTML = "";

    choiceTwoResult.innerHTML = "";


    document
        .querySelectorAll(
            ".choice-button"
        )
        .forEach(
            function(button) {

                button.disabled = false;

                button.style.opacity = "1";

            }
        );


    renderOpening();


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


/* =========================================================
   OPENING SELECTION
   =========================================================
   
   This is only for testing the three different
   Chapter 2 openings.

   Change the value below if you want to force
   a different branch during testing.
   ========================================================= */

function chooseTestOpening() {

    /*
     * For now, the prototype remembers the
     * opening selected through the browser.
     *
     * Default:
     * A
     */

    renderOpening();

}


/* =========================================================
   RESET BUTTON
   ========================================================= */

resetButton.addEventListener(
    "click",
    resetTheatre
);


/* =========================================================
   CHAPTER 3 BUTTON
   ========================================================= */

chapterThreeButton.addEventListener(
    "click",
    function() {

        alert(
            "Chapter 3 navigation will be connected later."
        );

    }
);


/* =========================================================
   START
   ========================================================= */

chooseTestOpening();

setupVisualMarkers();

setupChoiceOne();

setupChoiceTwo();
