/* Iron Logbook — the pure training maths, extracted as a spec.
 *
 * index.html keeps its own inline copy of these formulas so the app stays
 * a single self-contained file. This module is the reference used by the
 * tests in test/logic.test.js. If you change a formula in index.html,
 * change it here too and run `node --test`.
 */

/* comma-and-junk-safe number parse: "30,7 kg" -> 30.7, "max" -> null */
function num(s) {
  if (s == null) return null;
  var v = parseFloat(String(s).replace(",", ".").replace(/[^0-9.\-]/g, ""));
  return isFinite(v) ? v : null;
}

/* whole-day serial from a yyyy-mm-dd string via UTC — immune to daylight saving */
function dayNum(dstr) {
  var p = String(dstr).split("-");
  return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5);
}

/* 0-based week index of `d` relative to the programme start */
function weekIdx(start, d) {
  return Math.floor((dayNum(d) - dayNum(start)) / 7);
}

/* rest target in seconds: "2-3 min" -> 120, "90 s" -> 90 */
function restSecs(str) {
  var m = String(str).match(/(\d+)(?:\s*-\s*(\d+))?\s*(min|s)\b/);
  if (!m) return 90;
  return m[3] === "min" ? (+m[1]) * 60 : +m[1];
}

/* top of a rep range, or null for "max" and distance ("40 m") targets */
function repTop(str) {
  if (/max/i.test(str)) return null;
  if (/\d\s*m\b/.test(str) && !/min/.test(str)) return null;
  var m = String(str).match(/(\d+)(?:\s*-\s*(\d+))?/);
  return m ? +(m[2] || m[1]) : null;
}

/* the ramp is keyed to how many times this split day has already been trained:
 * 1st time (prior 0) -> 2 sets, 2nd (prior 1) -> 3 sets, 3rd on -> full */
function rampSets(prior, target) {
  if (prior <= 0) return Math.min(2, target);
  if (prior === 1) return Math.min(3, target);
  return target;
}

/* double progression decision from last time's sets.
 * `sets` = [{w, r}], `top` = repTop(target), `gear` = the load type.
 * Returns {kind, w, next?} where kind is one of
 * none | beat | harder | hold | up. `up` (with `next`) is the only one
 * that adds weight: every set at the top of the range, on one uniform load. */
function progressionKind(sets, top, gear) {
  var reps = sets.map(function (x) { return num(x.r); }).filter(function (n) { return n != null; });
  var ws = sets.map(function (x) { return num(x.w); }).filter(function (n) { return n != null; });
  var w = ws.length ? Math.max.apply(null, ws) : null;
  var uniformW = ws.length === sets.length && ws.every(function (x) { return x === ws[0]; });
  if (!reps.length) return { kind: "none", w: w };
  var allTop = top != null && reps.length === sets.length && reps.every(function (n) { return n >= top; });
  if (top == null) return { kind: "beat", w: w };
  if (gear === "none" || w == null) return allTop ? { kind: "harder", w: w } : { kind: "hold", w: w };
  if (allTop && uniformW) return { kind: "up", w: w, next: Math.round((w + 2) * 10) / 10 };
  return { kind: "hold", w: w };
}

module.exports = { num, dayNum, weekIdx, restSecs, repTop, rampSets, progressionKind };
