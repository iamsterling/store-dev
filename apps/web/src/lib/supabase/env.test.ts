import { describe, expect, it } from "vitest";
import { getSupabaseConfig } from "./env";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
};
describe("Supabase configuration", () => {
  it("accepts public configuration", () =>
    expect(getSupabaseConfig(valid).url).toBe(valid.NEXT_PUBLIC_SUPABASE_URL));
  it("accepts local HTTP", () =>
    expect(
      getSupabaseConfig({
        ...valid,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      }).url,
    ).toContain("54321"));
  it("fails at client creation when configuration is missing", () =>
    expect(() => getSupabaseConfig({})).toThrow("Set NEXT_PUBLIC"));
  it.each([
    "http://example.com",
    "not-a-url",
    "https://user:password@example.com",
    "ftp://localhost",
  ])("rejects unsafe URL %s", (url) =>
    expect(() =>
      getSupabaseConfig({ ...valid, NEXT_PUBLIC_SUPABASE_URL: url }),
    ).toThrow(),
  );
  it.each(["sb_secret_example", "garbage"])(
    "rejects non-public key %s",
    (key) =>
      expect(() =>
        getSupabaseConfig({
          ...valid,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
        }),
      ).toThrow("publishable"),
  );
  it("rejects service-role JWTs", () => {
    const key = `header.${btoa(JSON.stringify({ role: "service_role" }))}.signature`;
    expect(() =>
      getSupabaseConfig({
        ...valid,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
      }),
    ).toThrow("service-role");
  });
  it("accepts legacy local anon JWTs", () => {
    const key = `header.${btoa(JSON.stringify({ role: "anon" }))}.signature`;
    expect(
      getSupabaseConfig({ ...valid, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key })
        .key,
    ).toBe(key);
  });
});
