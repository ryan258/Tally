const test = require("node:test");
const assert = require("node:assert/strict");

const {
  num,
  str,
  round1,
  deriveMacroGoalsFromRatios,
  calculateServingNutrients,
  formatEntryTime,
  inferMealTag,
  mealForEntry,
  LEGACY_MEAL,
  groupEntriesByMeal,
  calculateWeeklyAverages,
  calculateConsistency,
  buildHistoryCsv,
} = require("../tally-helpers.js");

test("deriveMacroGoalsFromRatios computes correct macro grams for 40/30/30", () => {
  const goals = deriveMacroGoalsFromRatios(2000, 30, 40, 30);
  assert.equal(goals.protein, 150);
  assert.equal(goals.carbs, 200);
  assert.equal(goals.fat, 67);
});

test("calculateServingNutrients scales per-serving and decimal servings correctly", () => {
  const egg = { calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sugar: 0.4 };
  const doubleEgg = calculateServingNutrients(egg, 2, false);
  assert.equal(doubleEgg.calories, 156);
  assert.equal(doubleEgg.protein, 12);
  assert.equal(doubleEgg.carbs, 1.2);
  assert.equal(doubleEgg.fat, 10);

  const scoop = { calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 1, sugar: 1 };
  const scoop15 = calculateServingNutrients(scoop, 1.5, false);
  assert.equal(scoop15.calories, 180);
  assert.equal(scoop15.protein, 36);
  assert.equal(scoop15.carbs, 4.5);
  assert.equal(scoop15.fat, 2.3);
});

test("calculateServingNutrients handles per-100g weight mode scaling", () => {
  const chicken100g = { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 };
  const portion150g = calculateServingNutrients(chicken100g, 150, true);
  assert.equal(portion150g.calories, 248); // Math.round(165 * 1.5)
  assert.equal(portion150g.protein, 46.5);
  assert.equal(portion150g.fat, 5.4);
});

test("inferMealTag infers appropriate meal based on local timestamp hour", () => {
  const morning = new Date(2026, 6, 30, 8, 30).getTime();
  assert.equal(inferMealTag(morning), "breakfast");

  const noon = new Date(2026, 6, 30, 12, 30).getTime();
  assert.equal(inferMealTag(noon), "lunch");

  const evening = new Date(2026, 6, 30, 18, 30).getTime();
  assert.equal(inferMealTag(evening), "dinner");

  const night = new Date(2026, 6, 30, 23, 30).getTime();
  assert.equal(inferMealTag(night), "snack");
});

test("pre-1.3 entries with no meal and no timestamp bucket deterministically", () => {
  const legacy = { id: "old", type: "food", name: "Egg", calories: 78, protein: 6 };

  // Same answer regardless of the wall clock — the old bug read the current hour here.
  assert.equal(mealForEntry(legacy), LEGACY_MEAL);
  assert.equal(mealForEntry(legacy), mealForEntry(legacy));
  assert.equal(mealForEntry({ ...legacy, timestamp: 0 }), LEGACY_MEAL);
  assert.equal(mealForEntry({ ...legacy, timestamp: "not-a-date" }), LEGACY_MEAL);

  // An explicit meal still wins, and a real timestamp is still inferred from.
  assert.equal(mealForEntry({ ...legacy, meal: "dinner" }), "dinner");
  assert.equal(mealForEntry({ ...legacy, meal: "brunch" }), LEGACY_MEAL);
  assert.equal(mealForEntry({ ...legacy, timestamp: new Date(2026, 6, 30, 8, 30).getTime() }), "breakfast");

  const groups = groupEntriesByMeal([legacy]);
  assert.equal(groups[LEGACY_MEAL].entries.length, 1);
  assert.equal(groups[LEGACY_MEAL].foodCal, 78);
  assert.equal(groups.breakfast.entries.length, 0);
});

test("groupEntriesByMeal aggregates sub-totals per meal section", () => {
  const entries = [
    { id: "1", type: "food", meal: "breakfast", name: "Egg", calories: 156, protein: 12, carbs: 1.2, fat: 10 },
    { id: "2", type: "food", meal: "breakfast", name: "Toast", calories: 120, protein: 4, carbs: 22, fat: 2 },
    { id: "3", type: "food", meal: "lunch", name: "Salad", calories: 350, protein: 25, carbs: 15, fat: 18 },
    { id: "4", type: "exercise", meal: "lunch", name: "Walk", calories: 100 },
  ];

  const groups = groupEntriesByMeal(entries);
  assert.equal(groups.breakfast.entries.length, 2);
  assert.equal(groups.breakfast.foodCal, 276);
  assert.equal(groups.breakfast.protein, 16);
  assert.equal(groups.breakfast.carbs, 23.2);
  assert.equal(groups.breakfast.fat, 12);

  assert.equal(groups.lunch.entries.length, 2);
  assert.equal(groups.lunch.foodCal, 350);
  assert.equal(groups.lunch.exCal, 100);
  assert.equal(groups.lunch.netCal, 250);
});

test("calculateWeeklyAverages computes 7-day average and bank relative to logged days only", () => {
  const days = {
    "2026-07-30": { entries: [{ type: "food", calories: 2100 }, { type: "exercise", calories: 100 }] }, // net 2000
    "2026-07-29": { entries: [{ type: "food", calories: 1800 }] }, // net 1800
    "2026-07-28": { entries: [{ type: "food", calories: 2200 }] }, // net 2200
  };

  const res = calculateWeeklyAverages(days, "2026-07-30", 2000);
  assert.equal(res.loggedDaysCount, 3);
  assert.equal(res.avgCalories, 2000); // (2000+1800+2200)/3 = 2000
  assert.equal(res.totalNet, 6000);
  assert.equal(res.targetPeriod, 6000); // 2000 * 3 logged days
  assert.equal(res.bankNet, 0); // 6000 net - 6000 target = 0 cal bank!
});

const proteinDay = grams => ({ entries: [{ type: "food", name: "Shake", calories: 160, protein: grams }] });

test("calculateConsistency counts a streak back from today, tolerating an unfinished today", () => {
  const days = {
    "2026-07-30": proteinDay(10),  // today, still short — must not break the streak
    "2026-07-29": proteinDay(160),
    "2026-07-28": proteinDay(155),
    "2026-07-27": proteinDay(20),  // this is what ends it
    "2026-07-26": proteinDay(200),
  };
  assert.equal(calculateConsistency(days, "2026-07-30", 150).streak, 2);

  // Once today clears the goal it joins the streak.
  assert.equal(calculateConsistency({ ...days, "2026-07-30": proteinDay(151) }, "2026-07-30", 150).streak, 3);

  // A gap day with no log at all is a miss, not a skip.
  const gapped = { "2026-07-30": proteinDay(151), "2026-07-28": proteinDay(151) };
  assert.equal(calculateConsistency(gapped, "2026-07-30", 150).streak, 1);
});

test("calculateConsistency rates only logged days and counts this month's logs", () => {
  const days = {
    "2026-07-30": proteinDay(151),
    "2026-07-29": proteinDay(10),
    "2026-07-28": proteinDay(151),
    "2026-07-27": { entries: [] },   // opened the app, logged nothing
    "2026-06-15": proteinDay(151),   // previous month
  };
  const res = calculateConsistency(days, "2026-07-30", 150);

  assert.equal(res.loggedDays, 3);    // the empty day is not held against the rate
  assert.equal(res.hitRate, 67);      // 2 of 3
  assert.equal(res.daysThisMonth, 3); // June is excluded, so is the empty day

  // No goal set means nothing to hit — and no division by zero.
  assert.equal(calculateConsistency(days, "2026-07-30", 0).hitRate, 0);
  assert.deepEqual(calculateConsistency({}, "2026-07-30", 150), { streak: 0, loggedDays: 0, hitRate: 0, daysThisMonth: 0 });
});

test("buildHistoryCsv escapes cells that would otherwise break a spreadsheet", () => {
  const csv = buildHistoryCsv({
    "2026-07-29": { entries: [{ type: "exercise", name: "Walk", calories: 150, notes: "" }] },
    "2026-07-28": { entries: [{ type: "food", name: 'Rice, "jasmine"', calories: 200, protein: 4, meal: "lunch", notes: "line\nbreak" }] },
  });
  const lines = csv.split("\n");

  assert.match(lines[0], /^date,time,meal,type,name,servings,calories,protein/);
  assert.ok(lines[1].startsWith("2026-07-28,"), "days sort oldest first");
  assert.ok(lines[1].includes('"Rice, ""jasmine"""'), "commas and quotes escaped");
  assert.ok(csv.includes('"line\nbreak"'), "newlines stay inside a quoted cell");

  // Exercise rows leave the macro columns empty rather than writing a misleading 0.
  const walk = csv.split("\n").find(l => l.includes("Walk"));
  assert.equal(walk, "2026-07-29,,,exercise,Walk,,150,,,,,,");
});
