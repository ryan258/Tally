const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeBarcode,
  openFoodFactsProductUrl,
  parseOpenFoodFactsImage,
  foodFallbackGlyph,
} = require("../food-images.js");

test("normalizeBarcode accepts standard GTIN lengths and rejects unsafe values", () => {
  assert.equal(normalizeBarcode(" 040000503781 "), "040000503781");
  assert.equal(normalizeBarcode("3017620422003"), "3017620422003");
  assert.equal(normalizeBarcode("not-a-barcode"), "");
  assert.equal(normalizeBarcode("123"), "");
});

test("openFoodFactsProductUrl requests only the fields needed for a thumbnail", () => {
  assert.equal(
    openFoodFactsProductUrl("3017620422003"),
    "https://world.openfoodfacts.org/api/v3/product/3017620422003?fields=code%2Cproduct_name%2Cimage_front_small_url"
  );
  assert.equal(openFoodFactsProductUrl("bad"), "");
});

test("parseOpenFoodFactsImage accepts only the trusted image host", () => {
  assert.equal(
    parseOpenFoodFactsImage({
      status: "success",
      product: {
        image_front_small_url:
          "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.200.jpg",
      },
    }),
    "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.200.jpg"
  );

  assert.equal(
    parseOpenFoodFactsImage({
      status: "success",
      product: { image_front_small_url: "https://example.com/tracker.png" },
    }),
    ""
  );
  assert.equal(parseOpenFoodFactsImage({ status: "failure" }), "");
});

test("foodFallbackGlyph provides recognizable local fallbacks", () => {
  assert.equal(foodFallbackGlyph("Ham sandwich on white"), "🥪");
  assert.equal(foodFallbackGlyph("Greek yogurt cup"), "🥣");
  assert.equal(foodFallbackGlyph("Something unknown"), "🍽️");
});
