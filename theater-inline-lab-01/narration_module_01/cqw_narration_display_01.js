
(function () {
    "use strict";

    window.CQWInlineNarration01 = {
        render: function (options) {
            var container = options && options.container;
            var sceneText = String(
                options && options.text || ""
            );

            if (!container) {
                throw new Error(
                    "Inline narration needs a container."
                );
            }

            container.innerHTML = "";

            var heading = document.createElement("div");
            heading.className = "cqw-scene-heading";
            heading.textContent = "SCENE";

            var body = document.createElement("div");
            body.className = "cqw-scene-body";

            if (typeof window.marked === "function") {
                body.innerHTML = window.marked(sceneText);
            } else {
                body.textContent = sceneText;
            }

            container.appendChild(heading);
            container.appendChild(body);
        }
    };
})();
