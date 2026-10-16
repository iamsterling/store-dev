import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNavigation } from "@/components/bottom-navigation";

export default function StoreLayout({
  children,
  overlay,
}: {
  children: React.ReactNode;
  overlay: React.ReactNode;
}) {
  return (
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <BottomNavigation />
      {overlay}
    </div>
  );
}
