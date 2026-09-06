# Iron Logbook refinement review

Reviewed and implemented on 6 September 2026.

## Product direction

Two perspectives shaped the refinement: an individual needs confidence during a workout, while a coach needs enough context to judge the next step. The interface brings technique and previous performance into the workout, then separates weekly planning and review from the live logging task.

The saved starting profile follows the user's preferences: four sessions per week, general fitness, the linked Domyos bar/dumbbell kit, and the Rebel Active bench with preacher and leg attachments. Experience is a clearly editable new/returning default because the user's training experience is not known.

## Main findings and changes

| Original issue | Implemented refinement |
| --- | --- |
| Narrow phone-only layout, small all-caps controls, little hierarchy | Responsive desktop sidebar, phone navigation, readable cards and clear primary actions |
| Sparse rest-day screen and a hard-coded future programme start | Useful overview, upcoming workout, weekly plan, and a current start for fresh installs |
| Plan assumed equipment and included unsupported overhead dumbbell work | Equipment-aware templates respecting the supplied product information |
| Advice to omit collars and tip plates on failed bench reps | Replaced with the product's collar guidance and requirement for rated safety catches for solo barbell bench press |
| Technique was hidden behind collapsed exercise details | Prominent movement guides with distinct start/end positions, opt-in full-rep playback, step-by-step cues and reference links |
| Typing the first rep digit started the rest clock | Explicit per-set completion starts the timer; invalid values cannot complete a set |
| Completing an exercise did not require real logged sets | Working-set completion and partial-session finishing keep actual work distinct from planned work |
| Blanket 2 kg increase without effort or equipment checks | Conservative progression gated by full sets, consistent load, rep targets, effort, readiness and limits |
| Bodyweight and timed targets could be handled like ordinary weight/reps | Separate units, correct timed-hold logging and no kilogram progression for timed/bodyweight targets |
| Little progress visibility | Weekly weight averages, best logged load by exercise, waist entries and workout history |
| Coaching needed manual interpretation outside the app | On-device observations, discomfort/skip context, review notes and a downloadable coach report |
| Imports accepted fragile payloads | Whole-payload validation, schema checks, safe-key checks, timestamp-based merging and unreadable-data protection |
| Production and test formulas were separate copies | Browser and tests use the same production model |
| Service worker deleted unrelated caches and could mix asset versions | App-prefixed cleanup and versioned cache-first shell, with subpath coverage |

## Inspiration and references

- [Hevy: previous workout values](https://www.hevyapp.com/features/track-exercises/) informed the previous-performance column beside each set.
- [Fitbod: how workouts are created](https://help.fitbod.me/hc/en-us/articles/360004429814-How-Fitbod-Creates-Your-Workout) informed equipment-aware planning and the role of effort feedback. Iron Logbook uses its own small, transparent rule set, not Fitbod's algorithm.
- [Technogym: digital training and on-demand guidance](https://corporate.technogym.com/~/media/Files/T/Technogym-Corporate/investor-relations/shareholder-meetings/2024/3-eng-2023-annual-report.pdf) informed keeping guidance close to the workout. No proprietary training media or branding was copied.
- [Domyos equipment listing](https://www.decathlon.mt/p/10804-188923-weight-training-93-kg-partly-recycled-cast-iron-dumbbells-and-bar-set.html) supplied the inventory, bar/handle weights, collar and usage limits. The listing's detailed inventory was used rather than its rounded product title.
- [Rebel Active RBA-2008 listing](https://kvhmalta.com/product/rebel-active-multifunctional-adjustable-training-bench-with-preacher-bench/) supplied attachment limits and bench information. Safety catches were not verified, so they are disabled by default.
- [Mayo Clinic technique guidance](https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/weight-training/art-20045842?p=1&pg=1), [Mayo Clinic video library](https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/strength-training/art-20046031), and the [ACE exercise library](https://www.acefitness.org/resources/everyone/exercise-library/equipment/barbell/) support the general technique approach and external reference links.

The app's illustrations are original schematics based on the repository's pose coordinates, with additional poses for the new exercises. They are intentionally labelled as simplified illustrations. External pages are reference material, not content hosted or reviewed frame-by-frame inside this app.

## Verification

- 25 automated tests pass, covering the production model and service-worker behavior.
- JavaScript syntax checks and Git whitespace checks pass.
- Browser walkthrough covered overview, weekly plan, exercise filtering, technique dialog/playback, settings, coach review and progress.
- Logging test: typing alone did not start a timer; 99 kg was rejected against an 88.7 kg bar limit; a valid 28.7 kg × 12 set contributed 344.4 kg and persisted after reload.
- Rest timer visibility and its deadline survived reload.
- Partial-session confirmation saved only actual completed work and appeared as “Finished early” in history.
- A comma-decimal body measurement saved correctly and appeared in the body table.
- The plate calculator correctly returned one 10 kg plate on each end for a 28.7 kg barbell.
- A legacy fixture was imported through the actual file chooser and merge confirmation. Its session and body entries appeared without replacing current preferences.
- Phone checks at 390 px and 320 px showed no page-level horizontal overflow; the primary measurement action was refined after visual review.
- Offline verification: after installing the app shell, the local preview server was stopped. The app reloaded from cache, navigation worked, and the leg-extension guide still displayed. The server was restarted afterward.
- No browser JavaScript errors were observed in the tested flows.

Browser mutations used the explicitly labelled demo space. Actual personal workout data was not populated with test sessions.

## Current limits and useful next stages

- Coaching is rule-based and device-local. There is no live coach account, cloud sync, AI chat or camera form assessment.
- The plan is a starter template, not an assessment of mobility, injuries, age, fitness level or individual readiness beyond self-report.
- Session lengths are approximate time budgets; users can finish partial workouts. Calendar events are all-day until the user assigns times.
- Movement playback is schematic. Professionally filmed demonstrations, reviewed for this exact equipment, would be a valuable next addition.
- The plate calculator models inventory and symmetrical loading, not sleeve fit or plates allocated elsewhere.
- Existing legacy exercises retain their data and original templates; exercises outside the current catalogue do not gain a new detailed guide automatically.
- Body weight and waist measurements provide trends, not direct body-composition estimates.
- Push notifications and audio while the device is asleep are not guaranteed by the browser.
- Code remains local and compatible with static hosting. This task did not publish or push the changes.

Potential next stages are a professionally reviewed tutorial library, more flexible custom routine editing, and an explicitly designed coach/client sync service with user-controlled sharing.
