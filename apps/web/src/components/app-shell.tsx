import Link from "next/link";
import { Box, ArrowUpRight } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Navigation } from "./navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[236px_1fr]">
      <aside className="flex flex-col border-b bg-card p-5 md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <Link
          href="/"
          className="mb-8 flex w-fit items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Store home"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Box className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight">
            store<span className="text-primary">.</span>
          </span>
        </Link>
        <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Workspace
        </p>
        <Navigation />
        <div className="mt-auto hidden pt-10 md:block">
          <div className="rounded-xl border bg-background p-4">
            <Badge variant="outline" className="mb-3">
              Foundation phase
            </Badge>
            <p className="text-sm font-medium">Built for what comes next.</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Backend first. A considered place to build your operations.
            </p>
            <Link
              href="/setup"
              className="mt-4 flex items-center gap-2 text-xs font-medium text-primary"
            >
              View setup guide{" "}
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-5 px-2 text-xs text-muted-foreground">
            Store platform · Development
          </p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b px-6 lg:px-10">
          <p className="text-sm text-muted-foreground">
            Your workspace <span className="mx-2 text-border">/</span>{" "}
            <span className="text-foreground">Operations</span>
          </p>
          <Badge variant="outline" className="bg-card">
            <span className="size-1.5 rounded-full bg-amber-600" />
            Preview
          </Badge>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
