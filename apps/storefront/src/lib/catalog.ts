// Illustrative catalog only. Replace at the server boundary when the commerce backend exists.
export const categories = ["All", "Living", "Kitchen", "Everyday"] as const;
export type Category = (typeof categories)[number];
export type Product = {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  price: number;
  image: string;
  imageAlt: string;
  eyebrow: string;
  description: string;
  details: string[];
  options: string[];
};

export const products: readonly Product[] = [
  {
    id: "coast-dinnerware",
    name: "The Coast Dinnerware Set",
    category: "Kitchen",
    price: 4800,
    image: "/images/dinnerware.jpg",
    imageAlt: "Stacks of blue ceramic plates and bowls on a wooden shelf",
    eyebrow: "A seat at the table",
    description:
      "For slow breakfasts and dinners that turn into conversations. Soft blue tones and simple shapes bring a little ease to the everyday table.",
    details: [
      "Illustrative 4-piece place setting",
      "Blue glazed ceramic finish",
      "Sample product; specifications are not supplier-verified",
    ],
    options: ["Coastal blue"],
  },
  {
    id: "arc-pendant",
    name: "The Arc Pendant",
    category: "Living",
    price: 8900,
    image: "/images/lamp.jpg",
    imageAlt: "Minimal light gray pendant lamp against a teal wall",
    eyebrow: "Set a softer mood",
    description:
      "A simple silhouette with a warm presence. A quiet finishing touch above a reading corner or your favorite gathering spot.",
    details: [
      "Illustrative pendant light",
      "Soft gray shade",
      "Installation and electrical specifications pending supplier selection",
    ],
    options: ["Soft gray"],
  },
  {
    id: "slow-evening-candle",
    name: "The Slow Evening Candle",
    category: "Living",
    price: 2400,
    image: "/images/candle.jpg",
    imageAlt: "A lit candle in a clear glass jar in a cozy setting",
    eyebrow: "A small daily ritual",
    description:
      "Dim the lights. Put the phone down. A simple glass candle for those moments when doing less feels like exactly enough.",
    details: [
      "Illustrative glass jar candle",
      "Natural wax color",
      "Scent, ingredients, and burn time are not yet specified",
    ],
    options: ["Original"],
  },
  {
    id: "day-out-tote",
    name: "The Day Out Tote",
    category: "Everyday",
    price: 2800,
    image: "/images/bag.jpg",
    imageAlt: "A natural tan tote bag with two fabric handles",
    eyebrow: "Take the long way home",
    description:
      "Market mornings, a book for the train, the just-in-case layer. A straightforward carryall for wherever your day takes you.",
    details: [
      "Illustrative everyday carryall",
      "Natural tan finish",
      "Dimensions and material composition pending supplier selection",
    ],
    options: ["Natural"],
  },
];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}
export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function filterProducts({
  category = "All",
  query = "",
  sort = "featured",
}: {
  category?: string;
  query?: string;
  sort?: string;
}) {
  const normalized = query.trim().toLowerCase();
  const filtered = products.filter(
    (product) =>
      (category === "All" || product.category === category) &&
      `${product.name} ${product.category} ${product.description}`
        .toLowerCase()
        .includes(normalized),
  );
  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  return filtered;
}
