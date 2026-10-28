
# CEEQWINN Story & Theatre Studio

## Purpose

A lightweight, vanilla HTML/CSS/JavaScript authoring environment for CEEQWINN stories and theatre experiences.

The Studio is separate from the existing article Reader and does not replace `article.html` or `admin/article.html`.

## Files

- `index.html` — Studio interface
- `studio.css` — Studio appearance and responsive layouts
- `studio.js` — Story editing, chapter organization, local saving, assets, import/export, theme and preview controls
- `theatre-engine.js` — Shared content renderer for Studio preview and the public Reader
- `sample-project.json` — Example project

At the repository root:

- `read.html` — Public story-reading page
- `reader.css` — Public Reader styling
- `reader.js` — Loads a story JSON file and handles chapter navigation
- `stories/` — Published story JSON files

## Open the Studio

Visit:

`https://ceeqwinn.netlify.app/story-studio-prototype/index.html`

The Studio saves drafts in the browser's local storage. It does not upload drafts automatically.

## Open a sample story in the Studio

Use the Studio's **Open project backup** button and select `sample-project.json`.

Importing replaces the current project in the browser, so export a backup first if you need to preserve your current work.

## Publishing a story

1. Open the story in Studio.
2. Set its Reader story slug in the Reader & publishing panel.
3. Choose **Export story**.
4. In the GitHub repository, create a root-level `stories` folder if necessary.
5. Upload the exported JSON to `stories/<slug>.json`.
6. Commit the file and wait for Netlify to deploy.
7. Share `https://ceeqwinn.netlify.app/read.html?story=<slug>`.

Replace `<slug>` with the actual slug. The JSON filename and URL slug must match.

## Images and other assets

Remote images must use accessible HTTPS or HTTP URLs.

Device-uploaded images are stored as data URLs in the project and may increase JSON size. Exported JSON contains these embedded images, but a large project may become difficult to store, upload, or load. Prefer appropriately sized images and externally hosted assets for large projects.

## Important limits

- Browser autosave is local to that browser and device.
- Exported JSON is a portable project backup.
- Publishing requires uploading the JSON and deploying the site.
- The public Reader does not edit stories or upload assets.
- Reader choices are recorded locally in the reader's browser. Full story-state synchronization and complex conditional branches are not implemented here.
- External game links open separately; game progress is not connected to the story.
- This renderer is not the animated Scene MVP or Dialogue MVP engine.
- No live browser, GitHub or Netlify deployment test is claimed by this handoff.
