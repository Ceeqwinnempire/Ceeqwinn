
(function () {
    "use strict";

    window.CEEQWINNNarrationTheatre = {
        render: function (options) {
            var container = options.container;
            var text = String(options.text || "");

            if (!container) {
                throw new Error("Theatre container is missing.");
            }

            container.innerHTML = "";

            var heading = document.createElement("div");
            heading.className = "story-theatre-heading";
            heading.textContent = "SCENE";

            var body = document.createElement("div");
            body.className = "story-theatre-body";

            if (typeof window.marked === "function") {
                body.innerHTML = window.marked(text);
            } else {
                body.textContent = text;
            }

            container.appendChild(heading);
            container.appendChild(body);
        }
    };
})();
