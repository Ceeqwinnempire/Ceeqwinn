
(function () {
    "use strict";

    window.CQWInlineTheatreBridge01 = {
        render: function (options) {
            options = options || {};

            var container = options.container;
            var type = String(
                options.type || "NARRATION"
            ).toUpperCase();

            if (!container) {
                return false;
            }

            if (
                type === "NARRATION" &&
                window.CQWInlineNarration01
            ) {
                window.CQWInlineNarration01.render({
                    container: container,
                    text: options.text || "",
                    storyId: options.storyId || ""
                });

                return true;
            }

            container.textContent =
                "The requested theatre module is not available: " +
                type;

            return false;
        }
    };
})();
