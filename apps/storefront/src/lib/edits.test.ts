import { describe, expect, it } from "vitest";
import { edits, getEdit, productsForEdit } from "./edits";

describe("editorial edits", () => {
  it("references real sample products without duplicates", () => {
    for (const edit of edits) {
      expect(productsForEdit(edit)).toHaveLength(edit.productIds.length);
      expect(new Set(edit.productIds).size).toBe(edit.productIds.length);
    }
  });
  it("keeps the under-$40 edit within its stated budget", () =>
    expect(
      productsForEdit(getEdit("under-40")!).every(
        (product) => product.price < 4000,
      ),
    ).toBe(true));
  it("does not resolve unknown edit slugs", () =>
    expect(getEdit("toString")).toBeUndefined());
});
