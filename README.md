# StudySpace — fresh starter build

A simple static web app starter for an Android tablet. Includes subject dashboard, typed notes, local saving, math symbol insertion, paper-like canvas drawing, pen/highlighter/eraser controls, undo, dark mode, and JSON backup/restore.

## Files
- `index.html` — app structure
- `style.css` — responsive design and themes
- `app.js` — note data, drawing tools, local storage, backup/restore
- `manifest.webmanifest` — PWA metadata
- `service-worker.js` — offline cache starter

## Run locally
Open `index.html` in a modern browser. Local storage and canvas work in a browser. PWA/offline caching requires serving over HTTPS or localhost and registering the service worker.

## Publish on GitHub Pages
1. Back up the existing repository and any notes.
2. Upload the contents of this folder to the repository root or the configured Pages publishing folder.
3. Commit the changes to the branch/folder configured in Settings → Pages.
4. Wait for deployment and open the published site.
5. Test on the actual Android tablet.

## Important limitations of this starter
- Language selector currently saves the selected language but does not translate every UI label.
- Notes are stored in this browser's local storage; clearing browser/site data can remove them. Use Export Backup regularly.
- The drawing canvas is a single page per note in this first build.
- This is a starter implementation and has not been verified on the user's device or deployed website yet.

## Install to Android home screen and use offline
This must be published on an HTTPS site (for example GitHub Pages). A local HTML file opened from Downloads cannot reliably install as a PWA or register its offline service worker.

1. Upload the contents of this folder, including the `icons` folder, to the GitHub Pages publishing folder.
2. Wait until the HTTPS website shows the new version.
3. On the Infinix XPad, open the HTTPS website in Chrome while online.
4. Open Chrome's ⋮ menu and choose **Install app** or **Add to Home screen** (the wording depends on Chrome).
5. Launch StudySpace from the new home-screen icon once while online. After the first successful load, the app shell should be cached for offline opening.
6. Create a test note, close the app, enable Airplane mode, reopen StudySpace and check the note. Keep using Export Backup regularly.

Note: offline access depends on the browser's storage not being cleared. Notes are local to the browser/app installation and are not automatically synced across devices. Test offline behavior before relying on it for important study notes.
