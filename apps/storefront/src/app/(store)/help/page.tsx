import type { Metadata } from "next";

export const metadata: Metadata = { title: "Good to know" };
export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-16 md:px-10">
      <p className="mb-5 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
        A few helpful things
      </p>
      <h1 className="font-editorial text-5xl tracking-[-0.05em] md:text-6xl">
        Good to know.
      </h1>
      <p className="mt-6 text-sm leading-7 text-muted-foreground">
        A little clarity about this early version of the shop.
      </p>
      <div className="mt-10 divide-y border-y">
        {[
          {
            title: "Can I place an order?",
            text: "Not yet. This is a storefront preview with sample products and prices. You can browse, search, and try the shopping bag, but checkout and payments are not connected.",
          },
          {
            title: "Are these the final products?",
            text: "No. Product photography, names, prices, finishes, and descriptions illustrate the intended shopping experience. Supplier specifications and availability have not been verified.",
          },
          {
            title: "Where does my shopping bag go?",
            text: "Your bag is stored only in this browser using local storage. No account or payment details are collected. Clear your browser’s site data to remove it. If browser storage is blocked, it lasts only during the current session.",
          },
          {
            title: "What about shipping and returns?",
            text: "Shipping destinations, delivery estimates, charges, and return terms will be published before real orders are accepted. No shipping or returns policy is offered in this preview.",
          },
        ].map(({ title, text }) => (
          <details key={title} className="py-6">
            <summary className="cursor-pointer text-sm font-medium">
              {title}
            </summary>
            <p className="mt-4 pr-5 text-sm leading-7 text-muted-foreground">
              {text}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
