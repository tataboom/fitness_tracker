/* Run with:  node --test
 * Guards the maths that decides what weight the app tells you to lift. */
const { test } = require("node:test");
const assert = require("node:assert");
const L = require("../src/logic.js");

test("num: comma decimals, junk, and blanks", () => {
  assert.strictEqual(L.num("30,7"), 30.7);
  assert.strictEqual(L.num("30.7 kg"), 30.7);
  assert.strictEqual(L.num("28.7"), 28.7);
  assert.strictEqual(L.num("max"), null);   // must never become NaN
  assert.strictEqual(L.num("40 m"), 40);     // digits still parse
  assert.strictEqual(L.num(""), null);
  assert.strictEqual(L.num(null), null);
});

test("dayNum / weekIdx are daylight-saving immune", () => {
  // Europe/Malta springs forward on 2027-03-28. A week that straddles it
  // must still be exactly one week, never off by a day.
  assert.strictEqual(L.weekIdx("2027-03-22", "2027-03-29"), 1);
  assert.strictEqual(L.weekIdx("2026-11-02", "2026-11-02"), 0);
  assert.strictEqual(L.weekIdx("2026-11-02", "2026-11-08"), 0);
  assert.strictEqual(L.weekIdx("2026-11-02", "2026-11-09"), 1);
  assert.strictEqual(L.weekIdx("2026-11-02", "2026-10-26"), -1); // before start
});

test("restSecs parses the programme's rest strings", () => {
  assert.strictEqual(L.restSecs("2-3 min"), 120);
  assert.strictEqual(L.restSecs("2 min"), 120);
  assert.strictEqual(L.restSecs("90 s"), 90);
  assert.strictEqual(L.restSecs("45 s"), 45);
  assert.strictEqual(L.restSecs("nonsense"), 90); // safe default
});

test("repTop handles ranges, max, and distance", () => {
  assert.strictEqual(L.repTop("6-8"), 8);
  assert.strictEqual(L.repTop("12-15"), 15);
  assert.strictEqual(L.repTop("12"), 12);
  assert.strictEqual(L.repTop("8-10 / leg"), 10);
  assert.strictEqual(L.repTop("max"), null);
  assert.strictEqual(L.repTop("40 m"), null);
});

test("rampSets eases in over the first two exposures", () => {
  assert.strictEqual(L.rampSets(0, 4), 2);
  assert.strictEqual(L.rampSets(1, 4), 3);
  assert.strictEqual(L.rampSets(2, 4), 4);
  assert.strictEqual(L.rampSets(0, 3), 2);
  assert.strictEqual(L.rampSets(1, 3), 3);
});

test("double progression adds weight only on uniform, all-top sets", () => {
  var top = L.repTop("6-8"); // 8
  // all four sets at 8 reps on the same 28.7 kg -> advance to 30.7
  var up = L.progressionKind(
    [{ w: "28.7", r: "8" }, { w: "28.7", r: "8" }, { w: "28.7", r: "8" }, { w: "28.7", r: "8" }], top, "barH");
  assert.strictEqual(up.kind, "up");
  assert.strictEqual(up.next, 30.7);

  // one set short of the top -> hold
  var hold = L.progressionKind(
    [{ w: "28.7", r: "8" }, { w: "28.7", r: "7" }, { w: "28.7", r: "6" }, { w: "28.7", r: "6" }], top, "barH");
  assert.strictEqual(hold.kind, "hold");

  // all top but on mixed weights -> hold (never averages a jump off mixed loads)
  var mixed = L.progressionKind(
    [{ w: "30", r: "8" }, { w: "28.7", r: "8" }, { w: "28.7", r: "8" }, { w: "28.7", r: "8" }], top, "barH");
  assert.strictEqual(mixed.kind, "hold");

  // bodyweight movement (gear none) never suggests a kg jump
  var bw = L.progressionKind([{ w: "", r: "15" }, { w: "", r: "15" }, { w: "", r: "15" }], L.repTop("12-15"), "none");
  assert.strictEqual(bw.kind, "harder");

  // a max-effort target reports a total to beat, not a weight jump
  var beat = L.progressionKind([{ w: "", r: "10" }, { w: "", r: "9" }, { w: "", r: "8" }], L.repTop("max"), "barH");
  assert.strictEqual(beat.kind, "beat");
});
