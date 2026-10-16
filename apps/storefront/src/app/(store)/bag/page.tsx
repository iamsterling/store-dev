import type { Metadata } from "next";
import { BagContent } from "@/components/bag-content";

export const metadata: Metadata = { title: "Your bag" };
export default function BagPage() {
  return (
    <div
      className="mx-auto min-h-[65dvh] max-w-2xl py-6"
      data-testid="full-bag-page"
    >
      <BagContent />
    </div>
  );
}
