"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { addToBag, parseBag, updateQuantity, type BagLine } from "@/lib/bag";
import { readBag, serverBag, subscribeBag, writeBag } from "@/lib/bag-store";

type BagContextValue = {
  lines: BagLine[];
  count: number;
  add: (productId: string, option: string) => void;
  changeQuantity: (line: BagLine, quantity: number) => void;
};
const BagContext = createContext<BagContextValue | null>(null);

export function useBag() {
  const value = useContext(BagContext);
  if (!value) throw new Error("useBag requires BagProvider");
  return value;
}

// Data persists above the route group; URL state, not this provider, owns the panels.
export function BagProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribeBag, readBag, serverBag);
  const lines = useMemo(() => parseBag(raw), [raw]);
  function add(productId: string, option: string) {
    writeBag(JSON.stringify(addToBag(parseBag(readBag()), productId, option)));
  }
  function changeQuantity(line: BagLine, quantity: number) {
    writeBag(
      JSON.stringify(
        updateQuantity(
          parseBag(readBag()),
          line.productId,
          line.option,
          quantity,
        ),
      ),
    );
  }
  return (
    <BagContext.Provider
      value={{
        lines,
        count: lines.reduce((total, line) => total + line.quantity, 0),
        add,
        changeQuantity,
      }}
    >
      {children}
    </BagContext.Provider>
  );
}
