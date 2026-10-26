
(function (window, document) {
  "use strict";

  let sceneNumber = 0;

  window.CEEQWINNTheatreBridge = {
    show: function (options) {
      const settings = options || {};
      const parent = settings.parent;

      if (!parent) {
        throw new Error("The reader must provide a parent container.");
      }

      const slot = document.createElement("section");
      slot.className = "ceeqwinn-theatre-slot";
      slot.setAttribute("data-ceeqwinn-theatre", "true");

      parent.appendChild(slot);
      sceneNumber += 1;

      return window.CEEQWINNTheatres.render({
        type: settings.type || "NARRATION",
        sceneId: settings.sceneId || "scene-" + sceneNumber,
        markdown: settings.markdown || "",
        container: slot,
        context: settings.context || {}
      });
    }
  };
})(window, document);
