import { execFileSync } from "node:child_process";
import { renameSync, writeFileSync } from "node:fs";

// Generate before replacing: failed CLI calls must not truncate committed types.
const output = execFileSync(
  "supabase",
  ["gen", "types", "typescript", "--local", "--schema", "public"],
  { encoding: "utf8" },
);
if (!output.includes("export type Database"))
  throw new Error("Supabase returned no Database type");
writeFileSync("src/database.types.ts.tmp", output);
renameSync("src/database.types.ts.tmp", "src/database.types.ts");
