# CEEQWINN Story & Theatre Studio — Prototype 0.1

This is an isolated, browser-based prototype. It does not replace or modify the existing CEEQWINN website, `studio.html`, `studio.css`, `admin/article.html`, or any theatre folder.

## Files

- `index.html` — Studio layout and preview window.
- `css/studio.css` — responsive styling.
- `js/studio.js` — story/chapter/scene editing, local save, import/export.
- `js/theatre-engine.js` — reusable scene preview engine.
- `data/sample-project.json` — editable sample project you can import.

## Test it on Windows

1. Download and extract the ZIP file.
2. Open the `ceeqwinn-story-studio` folder.
3. Double-click `index.html` to open it in Chrome or Edge.
4. The sample story should load automatically.
5. Click a chapter, then click a scene to edit it.
6. Change the text, then click **Apply scene changes**.
7. Click **Preview theatre** and step through the scenes. At the choice scene, test both options.
8. Click **Save**. Close and reopen the page; the draft should remain in that browser.
9. Click **Export project** to download a JSON backup.
10. To test importing the included sample, click **Import project JSON** and choose `data/sample-project.json`.

If opening as a local file causes a browser-specific issue, use a simple local static server. If Python is already installed, open Command Prompt in the extracted folder and run:

    python -m http.server 8000

Then visit:

    http://localhost:8000

Stop the server with `Ctrl+C`.

## What works in this prototype

- Edit story title, description, genre, and draft status.
- Add chapters and scenes.
- Edit scene type, title, text, speaker, portrait URL, background URL, fallback background colour, and direct audio URL.
- Reorder scenes.
- Add choice options in the format `Button label | Target scene title`.
- Preview narration, dialogue, revelation, choice branches, game placeholders, and chapter endings.
- Save the active project to browser localStorage.
- Export and import project JSON.
- Set release metadata for planning.
- Responsive layout for smaller screens and reduced-motion preferences.

## Important prototype limits

- **No live website publishing:** release status and date are saved as metadata only.
- **No cloud sync:** browser localStorage is local to this browser/profile. Export backups regularly.
- **No live analytics:** this prototype does not collect audience data.
- **No real game launch yet:** game scenes are placeholders. We will connect the appropriate existing game engine after testing this foundation.
- **Branch preview is basic:** choices jump to a matching scene in the current chapter. This is a first test, not a replacement for the existing Reader's complete branching logic.
- **Media uses URLs:** use direct URLs to images/audio for now. Files are not uploaded to the website by this prototype.
- **Choice targets:** target scene titles must match exactly, and the target must be in the same chapter. Use unique scene titles for reliable routing.
- **Do not enter secrets or access tokens:** the prototype has no secure server component.

## Before integrating with CEEQWINN

Test the prototype locally first. Then compare it against the existing theatre experiments and decide which visuals or behaviours should be reused. Do not overwrite production files until a separate integration plan is tested.
