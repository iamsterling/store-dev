import { getProduct } from "./catalog";

export type BagLine = { productId: string; option: string; quantity: number };
export const MAX_QUANTITY = 10;

// localStorage is untrusted input; ignore unknown products and invalid quantities/options.
export function parseBag(raw: string): BagLine[] {
  try {
    if (raw.length > 20000) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const lines: BagLine[] = [];
    for (const candidate of data.slice(0, 100)) {
      if (!candidate || typeof candidate !== "object") continue;
      const { productId, option, quantity } = candidate;
      if (
        typeof productId !== "string" ||
        typeof option !== "string" ||
        !Number.isInteger(quantity) ||
        quantity < 1
      )
        continue;
      const product = getProduct(productId);
      if (!product?.options.includes(option)) continue;
      const existing = lines.find(
        (line) => line.productId === productId && line.option === option,
      );
      if (existing)
        existing.quantity = Math.min(
          MAX_QUANTITY,
          existing.quantity + quantity,
        );
      else
        lines.push({
          productId,
          option,
          quantity: Math.min(MAX_QUANTITY, quantity),
        });
    }
    return lines;
  } catch {
    return [];
  }
}

export function addToBag(
  lines: BagLine[],
  productId: string,
  option: string,
  quantity = 1,
): BagLine[] {
  if (!Number.isInteger(quantity) || quantity < 1) return lines;
  return parseBag(JSON.stringify([...lines, { productId, option, quantity }]));
}

export function updateQuantity(
  lines: BagLine[],
  productId: string,
  option: string,
  quantity: number,
): BagLine[] {
  if (!Number.isInteger(quantity) || quantity < 0) return lines;
  return parseBag(
    JSON.stringify(
      lines.map((line) =>
        line.productId === productId && line.option === option
          ? { ...line, quantity }
          : line,
      ),
    ),
  );
}

export function bagSubtotal(lines: BagLine[]) {
  return lines.reduce(
    (total, line) =>
      total + (getProduct(line.productId)?.price ?? 0) * line.quantity,
    0,
  );
}
