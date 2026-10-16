import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges conflicting Tailwind utilities", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
  it("supports conditional classes", () => {
    expect(cn("base", false && "hidden", { active: true })).toBe("base active");
  });
});
