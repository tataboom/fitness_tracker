# Iron Logbook

A personal home-gym training companion: an equipment-aware plan, clear movement guides, quick set logging, and progress you can review. It remains a static, installable PWA with device-local data and no account or backend.

## Run locally

Requires Node.js 20 or newer. No dependency installation or build step is needed.

```sh
npm start
```

Open http://localhost:8080. The server binds only to this computer and serves only public app assets (never the Git directory, tests, backups, or arbitrary files).

Use http://localhost:8080/?demo=1 for an explicitly labelled sample-data space. Demo data uses a separate storage key and never modifies personal logs.

## What changed in v2

- Responsive desktop sidebar and phone navigation, clearer home screen, accessible labels and native dialogs.
- A four-day upper/lower starter plan for general fitness, configurable to two or three full-body days.
- The user's Domyos bar/dumbbell kit and Rebel Active RBA-2008 bench are configured by default.
- Nineteen exercise guides with original start/end diagrams, opt-in full-rep schematic playback, setup/movement/return cues, common mistakes, and external technique references.
- Previous results next to each set, explicit set completion, effort feedback, exercise substitutions, skip reasons, partial-session finishing, and persistent rest timers.
- Weekly body-weight averages, per-exercise load charts, completed-set volume, body measurements and editable workout history.
- Transparent coaching rules, discomfort/readiness feedback, local review notes and downloadable coach reports.
- A balanced plate calculator, four-week calendar export, set-level CSV, and validated JSON backup/merge.
- A workout started early retains its planned date as well as its actual training date, so it does not get recommended again on the original day.

## Files

| File | Purpose |
| --- | --- |
| index.html | Accessible app shell |
| src/app.js | Rendering, logging, forms, exports, timer |
| src/model.js | Actual production training logic, validation and migration |
| src/catalog.js | Exercise descriptions, equipment and guidance |
| src/poses.js | Original pose coordinates and legacy templates |
| src/styles.css | Responsive visual system |
| sw.js | Versioned offline app shell |
| programme.html | Training principles and equipment references |
| test/model.test.js | Production-model regression tests |
| test/offline.test.js | Service-worker behavior and asset tests |
| dev-server.js | Dependency-free local preview |

The tests import the same model that the browser uses; there is no duplicate formula implementation to maintain.

## Equipment defaults

The linked kit lists 80 kg of plates, one 8.7 kg bar and two 2 kg handles. The default barbell inventory ceiling is 88.7 kg, with 2 kg balanced increases. The leg attachment is limited to 25 kg. The matched-dumbbell inventory ceiling is 42 kg per handle; real sleeve space can reduce it. The kit specifies a 15 kg vertical-grip limit and no overhead dumbbell use. Safety catches on the bench have not been confirmed, so solo barbell bench press is excluded until rated safety arms are enabled.

The plate calculator assumes the original inventory is available and checks symmetrical loading. It does not verify sleeve fit or whether plates are currently loaded on another implement. These are equipment ceilings, never starting-weight recommendations.

Specifications and design research are linked in [docs/refinement-review.md](docs/refinement-review.md).

## Tests

```sh
npm test
```

Tests cover real workout planning, migration, backup validation and merging, equipment changes, progression, load limits, actual completed volume, body averages, date boundaries, plate allocation and offline caching.

Browser QA was performed through the actual UI in the isolated demo space. See the review document for tested flows and current limits.

## Storage and compatibility

Personal logs retain the original `ironlog.v2` storage key and migrate to schema 4. Existing sessions keep their original templates, set values (including extra sets), skip reasons and notes. Body measurements retain their month/day structure. A pristine legacy installation's hard-coded future start date is reset; actual historical logs retain their configured date.

JSON imports validate the entire payload before merging. Newer timestamps win; equal or older imports preserve the local version. Profile settings remain local. Unreadable storage is not overwritten automatically: the app offers a raw download and an explicit restore flow.

Backups and reports are downloaded or copied only at the user's request. There is no cloud sync, live trainer messaging, camera-based form assessment, or AI API. The Coach screen uses conservative, documented rules. Illustrations explain movement but cannot validate an individual's technique.

Google Fonts are requested online, with system-font fallbacks. External reference pages need connectivity. Training logs themselves are never uploaded.

## Offline and hosting

The same static files remain compatible with GitHub Pages; no deployment was performed as part of this refinement. Serve over HTTPS for installation on a phone.

The service worker precaches the complete app shell and activates a new version only after existing clients close, keeping HTML, CSS and scripts consistent. Bump its `CACHE` name when changing app assets. Only this app's scoped caches are removed.

For live local development, the app avoids registering a service worker on loopback hosts. Append `?offline=1` to deliberately test installation/offline behavior. If an older worker was previously installed on that origin, close its tabs or use a clean preview origin while developing.

The generated calendar is available in Settings and follows the current plan. The old `training.ics` is retained as a legacy file; the app no longer offers or precaches it.

Rest countdowns use a saved deadline and catch up after returning to the app. Wake locks and sound are best-effort browser features; background sound/notifications are not guaranteed.
