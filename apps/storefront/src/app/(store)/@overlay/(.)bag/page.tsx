import { BagContent } from "@/components/bag-content";
import { RouteOverlay } from "@/components/route-overlay";

export default function BagPreview() {
  return (
    <RouteOverlay
      key="bag"
      title="Your bag"
      description="Keep your finds. Keep your place."
    >
      <BagContent />
    </RouteOverlay>
  );
}
