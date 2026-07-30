(function(root){
  "use strict";

  function num(v){ const n=+v; return Number.isFinite(n) && n>=0 ? n : 0; }
  function str(v){ return typeof v==="string" ? v : (v==null ? "" : String(v)); }
  function round1(n){ return Math.round((+n||0)*10)/10; }

  function deriveMacroGoalsFromRatios(calorieGoal, proteinPct, carbsPct, fatPct){
    const cal = num(calorieGoal);
    const p = num(proteinPct);
    const c = num(carbsPct);
    const f = num(fatPct);

    return {
      protein: Math.round((cal * (p / 100)) / 4),
      carbs: Math.round((cal * (c / 100)) / 4),
      fat: Math.round((cal * (f / 100)) / 9),
    };
  }

  function calculateServingNutrients(base, quantity, isGrams){
    const q = num(quantity) || (isGrams ? 100 : 1);
    const factor = isGrams ? q / 100 : q;
    const b = base || {};

    return {
      calories: Math.round(num(b.calories) * factor),
      protein: round1(num(b.protein) * factor),
      carbs: round1(num(b.carbs) * factor),
      fat: round1(num(b.fat) * factor),
      fiber: round1(num(b.fiber) * factor),
      sugar: round1(num(b.sugar) * factor),
    };
  }

  function formatEntryTime(timestamp){
    if(!timestamp) return "";
    const d = new Date(timestamp);
    if(isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function getMealFromHour(hour){
    if(hour >= 5 && hour < 11) return "breakfast";
    if(hour >= 11 && hour < 16) return "lunch";
    if(hour >= 16 && hour < 22) return "dinner";
    return "snack";
  }

  function inferMealTag(timestamp){
    const d = timestamp ? new Date(timestamp) : new Date();
    const hour = isNaN(d.getTime()) ? new Date().getHours() : d.getHours();
    return getMealFromHour(hour);
  }

  const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];
  const MEAL_LABELS = {
    breakfast: "Breakfast 🍳",
    lunch: "Lunch 🥗",
    dinner: "Dinner 🍽️",
    snack: "Snack 🍎"
  };

  // Entries written before 1.3 carry neither meal nor timestamp. There is nothing to infer
  // from, so they land in a fixed bucket instead of drifting with the wall clock.
  const LEGACY_MEAL = "snack";
  function mealForEntry(item){
    const it = item || {};
    if(MEAL_ORDER.indexOf(it.meal) > -1) return it.meal;
    if(!it.timestamp) return LEGACY_MEAL;
    const d = new Date(it.timestamp);
    return isNaN(d.getTime()) ? LEGACY_MEAL : getMealFromHour(d.getHours());
  }

  function groupEntriesByMeal(entries){
    const groups = {
      breakfast: { entries: [], foodCal: 0, exCal: 0, netCal: 0, protein: 0, carbs: 0, fat: 0 },
      lunch:     { entries: [], foodCal: 0, exCal: 0, netCal: 0, protein: 0, carbs: 0, fat: 0 },
      dinner:    { entries: [], foodCal: 0, exCal: 0, netCal: 0, protein: 0, carbs: 0, fat: 0 },
      snack:     { entries: [], foodCal: 0, exCal: 0, netCal: 0, protein: 0, carbs: 0, fat: 0 },
    };

    const list = Array.isArray(entries) ? entries : [];
    for(const item of list){
      const grp = groups[mealForEntry(item)];
      grp.entries.push(item);

      if(item.type === "exercise"){
        grp.exCal += num(item.calories);
      } else {
        grp.foodCal += num(item.calories);
        grp.protein += num(item.protein);
        grp.carbs += num(item.carbs);
        grp.fat += num(item.fat);
      }
      grp.netCal = grp.foodCal - grp.exCal;
    }

    for(const key of MEAL_ORDER){
      groups[key].protein = round1(groups[key].protein);
      groups[key].carbs = round1(groups[key].carbs);
      groups[key].fat = round1(groups[key].fat);
    }

    return groups;
  }

  function calculateWeeklyAverages(daysMap, currentKey, dailyCalGoal){
    const days = daysMap || {};
    const goal = num(dailyCalGoal) || 2000;
    const parts = (currentKey || "").split("-").map(Number);
    const baseDate = (parts.length === 3 && !parts.some(isNaN))
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date();

    let totalNet = 0;
    let loggedDaysCount = 0;

    for(let i = 6; i >= 0; i--){
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${dayStr}`;

      if(days[key] && Array.isArray(days[key].entries) && days[key].entries.length > 0){
        loggedDaysCount++;
        let dayNet = 0;
        for(const entry of days[key].entries){
          if(entry.type === "exercise"){
            dayNet -= num(entry.calories);
          } else {
            dayNet += num(entry.calories);
          }
        }
        totalNet += dayNet;
      }
    }

    const loggedTarget = goal * loggedDaysCount;
    const bankNet = loggedDaysCount > 0 ? totalNet - loggedTarget : 0;
    const avgCalories = loggedDaysCount > 0 ? Math.round(totalNet / loggedDaysCount) : 0;

    return {
      loggedDaysCount,
      avgCalories,
      totalNet,
      targetPeriod: loggedTarget,
      bankNet,
    };
  }

  const api = Object.freeze({
    num,
    str,
    round1,
    deriveMacroGoalsFromRatios,
    calculateServingNutrients,
    formatEntryTime,
    getMealFromHour,
    inferMealTag,
    MEAL_ORDER,
    MEAL_LABELS,
    LEGACY_MEAL,
    mealForEntry,
    groupEntriesByMeal,
    calculateWeeklyAverages,
  });

  root.TallyHelpers = api;
  if(typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
