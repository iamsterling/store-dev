import { EditGrid } from "@/components/edit-grid";
export const metadata = { title: "The edits" };
export default function EditsPage() {
  return (
    <div className="mx-auto max-w-360 px-5 py-12 md:px-10 lg:px-16">
      <p className="text-xs tracking-widest text-primary uppercase">
        Considered company
      </p>
      <h1 className="mt-4 font-editorial text-5xl tracking-tight">
        The edits.
      </h1>
      <p className="mt-5 mb-10 max-w-lg text-sm leading-7 text-muted-foreground">
        Start with a feeling, not a category. Small collections for the moments
        that make a day yours.
      </p>
      <EditGrid />
    </div>
  );
}
