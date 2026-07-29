(function(root){
  "use strict";

  const IMAGE_HOST = "images.openfoodfacts.org";

  function normalizeBarcode(value){
    const barcode = String(value == null ? "" : value).trim();
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
    }catch(e){
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

  const api = Object.freeze({
    normalizeBarcode,
    openFoodFactsProductUrl,
    safeImageUrl,
    parseOpenFoodFactsImage,
    sanitizeFoodImageMetadata,
    foodFallbackGlyph,
  });

  root.TallyFoodImages = api;
  if(typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
