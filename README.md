# Iron Logbook

A personal, offline strength-training tracker. One self-contained web app,
no accounts, no server, no tracking. Your data lives only in your phone's
browser storage. It installs to the home screen like a normal app.

This is a personal project. Nothing here touches any employer system.

## What's in here

```
index.html               the whole app (HTML + CSS + JS, no build step)
manifest.webmanifest     makes it installable as a PWA
sw.js                    service worker: offline + update prompt
programme.html           the training write-up (loading tables, reasoning)
training.ics             calendar file: sessions + a monthly backup reminder
icons/                   app icons (generated, plain PNG)
src/logic.js             the pure training maths, as a reference spec
test/logic.test.js       tests for that maths  (node --test)
.nojekyll                tells GitHub Pages to serve files as-is
```

The app in `index.html` is deliberately one file so it can never half-load.
`src/logic.js` is a mirror of the formulas used for testing only; the app
does not load it. If you change a formula in `index.html`, change it in
`src/logic.js` too and re-run the tests.

## Put it online for free (GitHub Pages)

Do this once, on a **personal** GitHub account (personal email, not work).

1. Create a free account at github.com if you don't have a personal one.
2. Create a new **public** repository named `iron-logbook`. Public is fine:
   the repo holds only this code, never your training data.
3. Upload every file and folder here, keeping the structure. On the repo
   page: **Add file -> Upload files**, drag the lot in, **Commit**.
4. **Settings -> Pages**. Under *Build and deployment*, set *Source* to
   **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
5. Wait about a minute. Pages shows your address, like
   `https://YOURNAME.github.io/iron-logbook/`.
6. Open that address in Chrome on your phone, then **menu (three dots) ->
   Add to Home screen -> Install**. You now have a real app icon that
   opens full-screen and works with no signal.

To update later, upload the changed file(s) again and bump `CACHE` in
`sw.js` (e.g. `iron-logbook-v2`). The app shows an "Update ready" note and
picks it up next time you reopen it.

### One thing to edit after you know your address

Open `training.ics` and, if you want the calendar reminders to deep-link
back into the app, you can add your Pages address to the event notes. It
already works without that. Then import `training.ics` into your phone
calendar once (open the file, choose your calendar).

## Run it locally (optional)

Any static server works. With Node installed:

```bash
npx http-server . -p 8080
```

Then open `http://localhost:8080`. A service worker needs `http://` or
`https://`, so opening the file directly (`file://`) disables offline
install and the wake lock, but the app itself still runs.

## Tests

```bash
node --test
```

Six tests cover the number parser (comma decimals, junk rejection), the
daylight-saving-proof week maths, the rest and rep parsers, the ease-in
ramp, and the double-progression rule.

## Your data

- Stored only in this browser, on this device, under one key in
  localStorage. Nothing leaves the phone.
- **Back up every couple of weeks.** In the app: **Data -> Back up
  (share to Drive)**, or **Save file**. The app nudges you after 14 days.
- New phone or cleared browser: install the app there, open **Data ->
  Import a backup**, pick your file. Sessions merge by most-recent edit.
- For a monthly review, hand the backup file (or **Copy as text**) to a
  personal Claude chat and ask it to judge progression and stalls.

## Notes on the platform

- Installed on Android, this behaves like a native app: own icon, no
  address bar, fully offline after first load.
- The rest timer holds a screen **wake lock** so the countdown keeps
  running and the beep fires; without it, a phone that sleeps mid-rest
  freezes the timer. Session reminders come from `training.ics`, not from
  the app, because reliable timed notifications need a server and this app
  has none by design.
- Fonts load from Google Fonts online and are cached after first visit;
  fully offline on a cold cache, the app falls back to the system font.
