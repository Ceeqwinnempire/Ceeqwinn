/* =========================================================
   CEEQWINN VISUAL STORY THEATRE — MVP

   This is a PRESENTATION LAYER.

   The existing article.html story engine remains
   responsible for:

   - Markdown loading
   - choices
   - consequences
   - conditionals
   - games
   - progress
   - localStorage
   - sessionStorage
   - chapter navigation

   Theatre only controls visual presentation.
   ========================================================= */

(function(){

    "use strict";


    var content =
        document.getElementById("content");


    if(!content){

        return;
    }


    var stage = null;

    var currentScene = "";

    var sceneLayerA = null;

    var sceneLayerB = null;

    var activeLayer = 0;

    var sceneData = [];

    var observer = null;

    var lastContentHTML = "";


    /* =====================================================
       CREATE ELEMENT
       ===================================================== */

    function make(tag,className){

        var el =
            document.createElement(tag);


        if(className){

            el.className =
                className;
        }


        return el;
    }


    /* =====================================================
       CLEAN TEXT
       ===================================================== */

    function clean(value){

        return String(value || "")
            .trim();
    }


    /* =====================================================
       DECODE HTML
       ===================================================== */

    function decode(value){

        var textarea =
            document.createElement("textarea");

        textarea.innerHTML =
            value || "";

        return textarea.value;
    }


    /* =====================================================
       CREATE THE THEATRE STAGE
       ===================================================== */

    function createStage(){

        if(
            document.getElementById(
                "ceeqwinn-theatre-stage"
            )
        ){

            stage =
                document.getElementById(
                    "ceeqwinn-theatre-stage"
                );

            return;
        }


        stage =
            make("section");


        stage.id =
            "ceeqwinn-theatre-stage";


        stage.setAttribute(
            "aria-label",
            "Story scene"
        );


        sceneLayerA =
            make(
                "div",
                "ceeqwinn-theatre-scene"
            );


        sceneLayerB =
            make(
                "div",
                "ceeqwinn-theatre-scene"
            );


        var veil =
            make("div");


        veil.id =
            "ceeqwinn-theatre-veil";


        var reading =
            make("div");


        reading.id =
            "ceeqwinn-theatre-reading";


        var label =
            make("div");


        label.id =
            "ceeqwinn-theatre-label";


        label.textContent =
            "CEEQWINN";


        var beat =
            make("div");


        beat.id =
            "ceeqwinn-theatre-beat";


        reading.appendChild(label);

        reading.appendChild(beat);


        stage.appendChild(
            sceneLayerA
        );

        stage.appendChild(
            sceneLayerB
        );

        stage.appendChild(
            veil
        );

        stage.appendChild(
            reading
        );


        var title =
            document.getElementById("title");


        if(
            title &&
            title.parentNode
        ){

            title.parentNode.insertBefore(
                stage,
                title.nextSibling
            );

        }else{

            document.body.insertBefore(
                stage,
                document.body.firstChild
            );
        }


        document.body.classList.add(
            "ceeqwinn-theatre-active"
        );


        content.classList.add(
            "theatre-enhanced"
        );
    }


    /* =====================================================
       READ THEATRE COMMENTS FROM MARKDOWN
       ===================================================== */

    function parseCommentMarkers(){

        sceneData = [];


        var walker =
            document.createTreeWalker(
                content,
                NodeFilter.SHOW_COMMENT,
                null,
                false
            );


        var comments = [];

        var node;


        while(
            (node = walker.nextNode())
        ){

            comments.push(node);
        }


        for(
            var i = 0;
            i < comments.length;
            i++
        ){

            var value =
                clean(
                    comments[i].nodeValue
                );


            /* ---------------------------------------------
               SCENE
               --------------------------------------------- */

            var scene =
                value.match(
                    /^THEATRE:SCENE\|([^|]+)\|(.+)$/i
                );


            if(scene){

                var marker =
                    make(
                        "span",
                        "theatre-scene-marker"
                    );


                marker.setAttribute(
                    "aria-hidden",
                    "true"
                );


                marker.setAttribute(
                    "data-scene-id",
                    clean(scene[1])
                );


                marker.setAttribute(
                    "data-scene-src",
                    decode(clean(scene[2]))
                );


                comments[i]
                    .parentNode
                    .replaceChild(
                        marker,
                        comments[i]
                    );


                sceneData.push({

                    marker:marker,

                    id:clean(scene[1]),

                    src:
                        decode(
                            clean(scene[2])
                        ),

                    beat:false

                });


                continue;
            }


            /* ---------------------------------------------
               VISUAL BEAT
               --------------------------------------------- */

            var beat =
                value.match(
                    /^THEATRE:BEAT\|([^|]+)\|(.+)$/i
                );


            if(beat){

                var beatMarker =
                    make(
                        "span",
                        "theatre-beat-marker"
                    );


                beatMarker.setAttribute(
                    "aria-hidden",
                    "true"
                );


                beatMarker.setAttribute(
                    "data-beat-id",
                    clean(beat[1])
                );


                beatMarker.setAttribute(
                    "data-beat-src",
                    decode(clean(beat[2]))
                );


                comments[i]
                    .parentNode
                    .replaceChild(
                        beatMarker,
                        comments[i]
                    );


                sceneData.push({

                    marker:beatMarker,

                    id:clean(beat[1]),

                    src:
                        decode(
                            clean(beat[2])
                        ),

                    beat:true

                });


                continue;
            }


            /* ---------------------------------------------
               DIALOGUE
               --------------------------------------------- */

            var dialogue =
                value.match(
                    /^THEATRE:DIALOGUE\|([^|]+)\|(.+)$/i
                );


            if(dialogue){

                var dialogueMarker =
                    make(
                        "div",
                        "theatre-dialogue"
                    );


                dialogueMarker.setAttribute(
                    "data-speaker",
                    clean(dialogue[1])
                );


                var speaker =
                    make("strong");


                speaker.textContent =
                    clean(dialogue[1]);


                var text =
                    document.createElement(
                        "div"
                    );


                text.textContent =
                    decode(
                        dialogue[2]
                    );


                dialogueMarker.appendChild(
                    speaker
                );


                dialogueMarker.appendChild(
                    text
                );


                comments[i]
                    .parentNode
                    .replaceChild(
                        dialogueMarker,
                        comments[i]
                    );
            }
        }
    }


    /* =====================================================
       PICK A READING GLASS
       ===================================================== */

    function sceneMode(id){

        var lower =
            String(id || "")
                .toLowerCase();


        if(
            lower.indexOf("gather") !== -1 ||
            lower.indexOf("night") !== -1
        ){

            return "theatre-glass-wine";
        }


        if(
            lower.indexOf("key") !== -1 ||
            lower.indexOf("archive") !== -1
        ){

            return "theatre-glass-sapphire";
        }


        if(
            lower.indexOf("green") !== -1
        ){

            return "theatre-glass-emerald";
        }


        return "theatre-glass-neutral";
    }


    /* =====================================================
       SHOW A SCENE
       ===================================================== */

    function showScene(data){

        if(
            !data ||
            !data.src ||
            !stage
        ){

            return;
        }


        if(
            currentScene === data.id
        ){

            return;
        }


        currentScene =
            data.id;


        var nextLayer =
            activeLayer === 0
            ? sceneLayerB
            : sceneLayerA;


        var oldLayer =
            activeLayer === 0
            ? sceneLayerA
            : sceneLayerB;


        nextLayer.style.backgroundImage =
            'url("' +
            data.src.replace(
                /"/g,
                "%22"
            ) +
            '")';


        nextLayer.classList.add(
            "is-active"
        );


        oldLayer.classList.remove(
            "is-active"
        );


        activeLayer =
            activeLayer === 0
            ? 1
            : 0;


        stage.className =
            sceneMode(data.id);


        stage.id =
            "ceeqwinn-theatre-stage";


        var label =
            document.getElementById(
                "ceeqwinn-theatre-label"
            );


        if(label){

            label.textContent =
                data.beat
                ? "VISUAL BEAT"
                : "CEEQWINN • " +
                  data.id
                    .replace(
                        /[-_]+/g,
                        " "
                    );
        }


        var beatText =
            document.getElementById(
                "ceeqwinn-theatre-beat"
            );


        if(beatText){

            beatText.textContent =
                data.beat
                ? "A meaningful moment."
                : "";
        }
    }


    /* =====================================================
       FIND CURRENT VISUAL MARKER
       ===================================================== */

    function visibleMarker(){

        if(
            !sceneData.length
        ){

            return null;
        }


        var viewportMiddle =
            (
                window.innerHeight ||
                document.documentElement.clientHeight
            ) * .55;


        var best = null;

        var bestDistance =
            Infinity;


        for(
            var i = 0;
            i < sceneData.length;
            i++
        ){

            var rect =
                sceneData[i]
                    .marker
                    .getBoundingClientRect();


            if(
                rect.top <=
                viewportMiddle
            ){

                var distance =
                    Math.abs(
                        viewportMiddle -
                        rect.top
                    );


                if(
                    distance <
                    bestDistance
                ){

                    best =
                        sceneData[i];

                    bestDistance =
                        distance;
                }
            }
        }


        return best;
    }


    /* =====================================================
       REFRESH
       ===================================================== */

    function refreshScene(){

        var data =
            visibleMarker();


        if(data){

            showScene(data);

        }else if(
            sceneData.length
        ){

            showScene(
                sceneData[0]
            );
        }
    }


    /* =====================================================
       WATCH SCENE MARKERS
       ===================================================== */

    function installObserver(){

        if(observer){

            observer.disconnect();

            observer = null;
        }


        if(
            "IntersectionObserver"
            in window
        ){

            observer =
                new IntersectionObserver(
                    function(entries){

                        for(
                            var i = 0;
                            i < entries.length;
                            i++
                        ){

                            if(
                                entries[i]
                                    .isIntersecting
                            ){

                                var marker =
                                    entries[i]
                                        .target;


                                for(
                                    var j = 0;
                                    j < sceneData.length;
                                    j++
                                ){

                                    if(
                                        sceneData[j]
                                            .marker ===
                                        marker
                                    ){

                                        showScene(
                                            sceneData[j]
                                        );

                                        break;
                                    }
                                }
                            }
                        }

                    },
                    {
                        root:null,
                        threshold:0.05
                    }
                );


            for(
                var i = 0;
                i < sceneData.length;
                i++
            ){

                observer.observe(
                    sceneData[i].marker
                );
            }

        }else{

            window.addEventListener(
                "scroll",
                refreshScene,
                false
            );
        }
    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function init(){

        createStage();

        parseCommentMarkers();


        if(
            !sceneData.length
        ){

            return;
        }


        installObserver();

        refreshScene();
    }


    /* =====================================================
       NOTICE WHEN EXISTING STORY ENGINE RERENDERS
       ===================================================== */

    function watchForStoryRender(){

        var current =
            content.innerHTML;


        if(
            current ===
            lastContentHTML
        ){

            return;
        }


        lastContentHTML =
            current;


        init();
    }


    /* =====================================================
       MUTATION WATCHER

       This is what lets Theatre survive when the
       existing article engine rerenders after:

       - choices
       - consequences
       - game return
       - chapter state changes
       ===================================================== */

    if(
        window.MutationObserver
    ){

        var mutationObserver =
            new MutationObserver(
                function(){

                    watchForStoryRender();
                }
            );


        mutationObserver.observe(
            content,
            {
                childList:true,
                subtree:true
            }
        );
    }


    window.setTimeout(
        watchForStoryRender,
        200
    );


})();
