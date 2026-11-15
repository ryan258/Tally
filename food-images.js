(function(root){
  "use strict";

  const IMAGE_HOST = "images.openfoodfacts.org";

  function normalizeBarcode(value){
    const barcode = String(value === null || value === undefined ? "" : value).trim();
    return /^\d{8,14}$/.test(barcode) ? barcode : "";
  }

  function openFoodFactsProductUrl(value){
    const barcode = normalizeBarcode(value);
    if(!barcode) return "";
    const fields = encodeURIComponent("code,product_name,image_front_small_url");
    return `https://world.openfoodfacts.org/api/v3/product/${barcode}?fields=${fields}`;
  }

  function safeImageUrl(value){
    if(typeof value !== "string" || !value) return "";
    try{
      const url = new URL(value);
      if(url.protocol !== "https:" || url.hostname !== IMAGE_HOST) return "";
      if(!url.pathname.startsWith("/images/products/")) return "";
      return url.href;
    }catch{
      return "";
    }
  }

  function parseOpenFoodFactsImage(payload){
    if(!payload || payload.status !== "success" || !payload.product) return "";
    return safeImageUrl(payload.product.image_front_small_url);
  }

  function sanitizeFoodImageMetadata(value){
    const source = value && typeof value === "object" ? value : {};
    return {
      barcode: normalizeBarcode(source.barcode),
      imageUrl: safeImageUrl(source.imageUrl),
    };
  }

  function foodFallbackGlyph(name){
    const value = String(name || "").toLowerCase();
    if(value.includes("sandwich") || value.includes("sub ")) return "🥪";
    if(value.includes("yogurt") || value.includes("cereal") || value.includes("oatmeal")) return "🥣";
    if(value.includes("egg")) return "🥚";
    if(value.includes("chicken") || value.includes("turkey")) return "🍗";
    if(value.includes("banana")) return "🍌";
    if(value.includes("apple")) return "🍎";
    if(value.includes("pizza")) return "🍕";
    if(value.includes("snickers") || value.includes("candy") || value.includes("chocolate")) return "🍫";
    if(value.includes("shake") || value.includes("smoothie") || value.includes("drink")) return "🥤";
    return "🍽️";
  }

  // Single source of truth for keyword→emoji mapping. Returns "" when nothing
  // matches so the caller can decide whether to fall back to the generic glyph.
  function detectEmoji(name){
    const value = String(name || "").toLowerCase();
    if(!value) return "";
    if(value.includes("egg")) return "🥚";
    if(value.includes("chicken") || value.includes("poultry")) return "🍗";
    if(value.includes("yogurt") || value.includes("oat") || value.includes("cereal")) return "🥣";
    if(value.includes("banana")) return "🍌";
    if(value.includes("shake") || value.includes("smoothie") || value.includes("drink")) return "🥤";
    if(value.includes("steak") || value.includes("beef") || value.includes("meat")) return "🥩";
    if(value.includes("apple")) return "🍎";
    if(value.includes("salad")) return "🥗";
    if(value.includes("pizza")) return "🍕";
    if(value.includes("rice")) return "🍚";
    if(value.includes("fish") || value.includes("salmon") || value.includes("tuna")) return "🐟";
    if(value.includes("bread") || value.includes("toast")) return "🍞";
    if(value.includes("coffee") || value.includes("espresso")) return "☕";
    if(value.includes("milk") || value.includes("cheese")) return "🧀";
    if(value.includes("walk") || value.includes("hike")) return "🚶";
    if(value.includes("run") || value.includes("jog")) return "🏃";
    if(value.includes("gym") || value.includes("workout") || value.includes("lift")) return "🏋️";
    if(value.includes("cycle") || value.includes("bike")) return "🚴";
    if(value.includes("sandwich") || value.includes("sub ")) return "🥪";
    return "";
  }

  const api = Object.freeze({
    normalizeBarcode,
    openFoodFactsProductUrl,
    safeImageUrl,
    parseOpenFoodFactsImage,
    sanitizeFoodImageMetadata,
    foodFallbackGlyph,
    detectEmoji,
  });

  root.TallyFoodImages = api;
  if(typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
