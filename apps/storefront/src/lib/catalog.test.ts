import { describe, expect, it } from "vitest";
import { filterProducts, formatMoney, getProduct, products } from "./catalog";

describe("sample catalog", () => {
  it("filters by category and case-insensitive search", () =>
    expect(
      filterProducts({ category: "Living", query: " PENDANT " }).map(
        (p) => p.id,
      ),
    ).toEqual(["arc-pendant"]));
  it("returns an empty state for unmatched queries", () =>
    expect(filterProducts({ query: "spaceship" })).toEqual([]));
  it("sorts prices without mutating the source", () => {
    const original = products.map((p) => p.id);
    expect(filterProducts({ sort: "price-asc" })[0]?.id).toBe(
      "slow-evening-candle",
    );
    expect(products.map((p) => p.id)).toEqual(original);
  });
  it("rejects unknown product identifiers", () =>
    expect(getProduct("toString")).toBeUndefined());
  it("formats integer minor units", () =>
    expect(formatMoney(4800)).toBe("$48.00"));
});
