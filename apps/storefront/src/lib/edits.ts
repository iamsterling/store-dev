import { products } from "./catalog";

export type Edit = {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  tone: string;
  productIds: readonly string[];
};

export const edits: readonly Edit[] = [
  {
    slug: "slow-mornings",
    number: "01",
    title: "The slow morning",
    subtitle: "For the hours that belong to you.",
    description:
      "A table set just for you. A little light. Nowhere to be just yet. An edit for making a little more of the start of your day.",
    image: "/images/dinnerware.jpg",
    imageAlt: "Soft blue dinnerware ready for a slow breakfast",
    tone: "bg-[#e8eee9]",
    productIds: ["coast-dinnerware", "slow-evening-candle"],
  },
  {
    slug: "small-space",
    number: "02",
    title: "A little room",
    subtitle: "Small space. A softer landing.",
    description:
      "You don’t need more room to make room for yourself. A few considered details can change how a corner of your world feels.",
    image: "/images/hero.jpg",
    imageAlt: "A sunlit room with a cozy corner and natural textures",
    tone: "bg-[#ede3d4]",
    productIds: ["arc-pendant", "slow-evening-candle"],
  },
  {
    slug: "out-the-door",
    number: "03",
    title: "Out the door",
    subtitle: "The everyday, taken along.",
    description:
      "A market morning, a walk without a plan, the long way home. Simple company for the things you do outside your four walls.",
    image: "/images/bag.jpg",
    imageAlt: "A natural tan tote bag for a day out",
    tone: "bg-[#e6e7ed]",
    productIds: ["day-out-tote"],
  },
  {
    slug: "under-40",
    number: "04",
    title: "Little good things",
    subtitle: "Small finds, under $40.",
    description:
      "Sometimes a small change is all it takes. An edit of illustrative finds under $40, with room left for whatever comes next.",
    image: "/images/candle.jpg",
    imageAlt: "A candle glowing in a quiet evening setting",
    tone: "bg-[#f0dfd5]",
    productIds: ["slow-evening-candle", "day-out-tote"],
  },
];

export function getEdit(slug: string) {
  return edits.find((edit) => edit.slug === slug);
}
export function productsForEdit(edit: Edit) {
  return edit.productIds.flatMap((id) => {
    const product = products.find((item) => item.id === id);
    return product ? [product] : [];
  });
}
