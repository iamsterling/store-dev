import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";

export const metadata: Metadata = { title: "Project setup" };

export default function SetupPage() {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="secondary">Developer guide</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Build on solid ground.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          Your workspace is scaffolded. Connect your development database when
          you’re ready. This page does not test database connectivity.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>01 / Start Supabase locally</CardTitle>
            <CardDescription>
              Docker is required. Run from the repository root.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-7">
              <code>
                {
                  "pnpm --filter @repo/database db:start\npnpm --filter @repo/database db:status"
                }
              </code>
            </pre>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Or use a new hosted development project. Never point local
              migration experiments at production.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>02 / Configure the web app</CardTitle>
            <CardDescription>
              Copy apps/web/.env.example to apps/web/.env.local.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-7">
              <code>
                {
                  "NEXT_PUBLIC_SUPABASE_URL=…\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…"
                }
              </code>
            </pre>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Use your project URL and publishable key. Secret and service-role
              keys never belong in browser variables.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>03 / Model access before tables</CardTitle>
            <CardDescription>
              Backend correctness is the first product feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">
              Read AGENTS.md and docs/backend.md before adding tables. Define
              tenancy, authorization, and lifecycle rules first. Commit
              migrations, explicit grants, RLS policies, and isolation tests
              together.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>04 / Keep the checks green</CardTitle>
            <CardDescription>
              One shared baseline for people and agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-7">
              <code>{"pnpm check\npnpm build"}</code>
            </pre>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              See README.md for workflows and docs/architecture.md for package
              boundaries.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
