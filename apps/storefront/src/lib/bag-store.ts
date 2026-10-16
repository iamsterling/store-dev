export const BAG_KEY = "daymark:bag:v1";
const CHANGE_EVENT = "daymark:bag-change";
let fallback = "[]";
let storageFailed = false;

export function subscribeBag(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === BAG_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function readBag() {
  if (storageFailed) return fallback;
  try {
    return window.localStorage.getItem(BAG_KEY) ?? "[]";
  } catch {
    return fallback;
  }
}

export function writeBag(raw: string) {
  fallback = raw;
  try {
    window.localStorage.setItem(BAG_KEY, raw);
    storageFailed = false;
  } catch {
    storageFailed = true; /* Session-only bag if browser storage is unavailable. */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function serverBag() {
  return "[]";
}
