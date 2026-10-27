# CEEQWINN Story & Theatre Studio

A visual story-writing and theatre-authoring prototype built with vanilla
HTML, CSS and JavaScript.

## Files

- `index.html` — the Studio interface
- `studio.css` — styling and responsive layout
- `studio.js` — writing, chapters, editing, saving and project export
- `theatre-engine.js` — story preview and experience rendering
- `sample-project.json` — sample story to import and edit

## How to open it

The Studio is available through the website at:

https://ceeqwinn.netlify.app/story-studio-prototype/index.html

You can also test it locally:

1. Download or clone the project.
2. Keep all files in the same folder.
3. Open `index.html` in a modern browser.

If the browser restricts local file access, open a terminal in this
folder and run:

    python -m http.server 8000

Then open:

    http://localhost:8000

## Basic workflow

1. Open Story overview and enter your story details.
2. Open the writing room.
3. Edit paragraphs directly in the manuscript.
4. Select a block and choose "Insert experience" to add theatre, dialogue,
   narration, a reveal, a choice, a game link, audio, an image or a transition.
5. Select an inserted experience to edit its settings.
6. Use Preview story to see the current chapter.
7. Use Save to save the draft in this browser.
8. Use Export to download a JSON backup.
9. Use Import to restore a project JSON file.

## Important limitations

- Drafts are saved in this browser's local storage, not in a server database.
- Export a backup before clearing browser data or moving to another device.
- Game experiences link to existing game URLs; this prototype does not
  embed or control the game engine.
- Choice targets are stored but do not yet drive complete branching playback.
- Chapter transitions are represented in the project but do not yet
  automatically navigate between chapters.
- Audio and images use URLs; there is no file-upload manager yet.
- Release settings are saved as metadata only.
- This prototype does not publish stories to the live Reader.
- The existing Reader has not been modified by this prototype.

## Compatibility

Use a modern browser for the best experience. The interface adapts to
narrow screens, but older devices and browsers still need testing.

## Next integration stage

After the writing workflow has been tested, connect the Studio project
format to the existing CEEQWINN Reader without replacing its working
story progression, saved choices, or game integrations.
