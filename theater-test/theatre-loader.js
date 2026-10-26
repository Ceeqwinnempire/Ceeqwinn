
(function (window) {
  "use strict";

  const registry = Object.create(null);

  function register(type, theatre) {
    const name = String(type || "").toUpperCase();

    if (!name || !theatre || typeof theatre.render !== "function") {
      throw new Error("Invalid CEEQWINN theatre registration.");
    }

    registry[name] = theatre;
  }

  function render(options) {
    const settings = options || {};
    const type = String(settings.type || "NARRATION").toUpperCase();
    const theatre = registry[type];

    if (!settings.container) {
      throw new Error("A theatre container is required.");
    }

    if (!theatre) {
      settings.container.textContent =
        "Theatre not registered: " + type;
      return null;
    }

    return theatre.render({
      contractVersion: 1,
      type: type,
      sceneId: settings.sceneId || "",
      markdown: String(settings.markdown || ""),
      container: settings.container,
      context: settings.context || {}
    }) || null;
  }

  window.CEEQWINNTheatres = {
    contractVersion: 1,
    register: register,
    render: render,
    has: function (type) {
      return Boolean(registry[String(type || "").toUpperCase()]);
    }
  };
})(window);
