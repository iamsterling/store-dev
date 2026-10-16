import Link from "next/link";
import { Button } from "@repo/ui/components/button";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-sm text-muted-foreground">404 / Not found</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Nothing here just yet.
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Let’s get you back to your workspace.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to overview</Link>
      </Button>
    </div>
  );
}
