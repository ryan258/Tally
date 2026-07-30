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

  function dayKey(d){
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function parseDayKey(key){
    const parts = (key || "").split("-").map(Number);
    return (parts.length === 3 && !parts.some(isNaN))
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date();
  }

  // null means "no log for this day" — distinct from a logged day totalling 0g.
  function dayProtein(day){
    if(!day || !Array.isArray(day.entries) || day.entries.length === 0) return null;
    let p = 0;
    for(const e of day.entries){
      if(e.type !== "exercise") p += num(e.protein);
    }
    return round1(p);
  }

  function calculateConsistency(daysMap, currentKey, proteinGoal){
    const days = daysMap || {};
    const goal = num(proteinGoal);
    const base = parseDayKey(currentKey);
    const hitOn = key => {
      const p = dayProtein(days[key]);
      return goal > 0 && p !== null && p >= goal;
    };

    // Today is still in progress, so a miss today doesn't break a streak that is
    // alive through yesterday. Any other miss ends it.
    let streak = 0;
    for(let i = 0; i < 365; i++){
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      if(hitOn(dayKey(d))) streak++;
      else if(i > 0) break;
    }

    // Hit rate counts only days that were actually logged in the last 30.
    let loggedDays = 0, hits = 0;
    for(let i = 0; i < 30; i++){
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      if(dayProtein(days[key]) === null) continue;
      loggedDays++;
      if(hitOn(key)) hits++;
    }

    const prefix = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-`;
    let daysThisMonth = 0;
    for(const key of Object.keys(days)){
      if(key.indexOf(prefix) === 0 && dayProtein(days[key]) !== null) daysThisMonth++;
    }

    return {
      streak,
      loggedDays,
      hitRate: loggedDays > 0 ? Math.round((hits / loggedDays) * 100) : 0,
      daysThisMonth,
    };
  }

  const CSV_COLUMNS = [
    "date", "time", "meal", "type", "name", "servings",
    "calories", "protein", "carbs", "fat", "fiber", "sugar", "notes"
  ];

  function csvCell(v){
    const s = str(v);
    // Quote anything a spreadsheet could misread, and double up embedded quotes.
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function buildHistoryCsv(daysMap){
    const days = daysMap || {};
    const rows = [CSV_COLUMNS.join(",")];

    for(const date of Object.keys(days).sort()){
      const entries = days[date] && days[date].entries;
      if(!Array.isArray(entries)) continue;
      for(const it of entries){
        const isEx = it.type === "exercise";
        rows.push([
          date,
          formatEntryTime(it.timestamp),
          isEx ? "" : mealForEntry(it),
          isEx ? "exercise" : "food",
          str(it.name),
          isEx ? "" : (num(it.servings) || 1),
          num(it.calories),
          isEx ? "" : num(it.protein),
          isEx ? "" : num(it.carbs),
          isEx ? "" : num(it.fat),
          isEx ? "" : num(it.fiber),
          isEx ? "" : num(it.sugar),
          str(it.notes),
        ].map(csvCell).join(","));
      }
    }

    return rows.join("\n");
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
    calculateConsistency,
    buildHistoryCsv,
    CSV_COLUMNS,
  });

  root.TallyHelpers = api;
  if(typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
