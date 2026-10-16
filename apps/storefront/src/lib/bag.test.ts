import { describe, expect, it } from "vitest";
import { addToBag, bagSubtotal, parseBag, updateQuantity } from "./bag";

describe("local preview bag", () => {
  const line = {
    productId: "coast-dinnerware",
    option: "Coastal blue",
    quantity: 1,
  };
  it("adds and merges an item", () =>
    expect(addToBag([line], line.productId, line.option)).toEqual([
      { ...line, quantity: 2 },
    ]));
  it("limits quantity to ten", () =>
    expect(addToBag([line], line.productId, line.option, 20)[0]?.quantity).toBe(
      10,
    ));
  it("removes zero-quantity items", () =>
    expect(updateQuantity([line], line.productId, line.option, 0)).toEqual([]));
  it("does not accept negative or fractional quantities", () => {
    expect(addToBag([line], line.productId, line.option, -1)).toEqual([line]);
    expect(updateQuantity([line], line.productId, line.option, 1.5)).toEqual([
      line,
    ]);
  });
  it("calculates totals from the catalog, not persisted prices", () =>
    expect(bagSubtotal([{ ...line, quantity: 2 }])).toBe(9600));
  it.each([
    "broken json",
    "null",
    "{}",
    '[{"productId":"unknown","option":"fake","quantity":5}]',
    '[{"productId":"coast-dinnerware","option":"Coastal blue","quantity":"2"}]',
  ])("recovers from invalid storage: %s", (raw) =>
    expect(parseBag(raw)).toEqual([]),
  );
  it("rejects nonexistent options", () =>
    expect(addToBag([], line.productId, "fake")).toEqual([]));
  it("normalizes duplicate persisted entries", () =>
    expect(parseBag(JSON.stringify([line, line]))).toEqual([
      { ...line, quantity: 2 },
    ]));
});
