export const sections = {
  catalog: {
    title: "Product catalog",
    label: "Catalog",
    description: "A home for the products you choose to sell.",
    empty: "Your catalog starts here",
    detail:
      "Product imports, variants, pricing, and stock availability will live here once the catalog backend is ready.",
    next: "Define products, variants, and supplier product references.",
  },
  orders: {
    title: "Orders",
    label: "Orders",
    description: "From checkout to your customer’s doorstep.",
    empty: "Ready for your first order",
    detail:
      "Order intake, supplier routing, and fulfillment tracking are planned. No order data is connected yet.",
    next: "Define the order lifecycle and idempotent fulfillment commands.",
  },
  suppliers: {
    title: "Suppliers",
    label: "Suppliers",
    description: "Build the network behind your storefront.",
    empty: "Great operations start with great suppliers",
    detail:
      "Supplier connections, inventory syncs, and fulfillment capabilities will be managed here. No integrations are active.",
    next: "Define supplier credentials, sync contracts, and retry behavior.",
  },
} as const;

export type Section = keyof typeof sections;
