const GUEST_ORDER_ACCESS_STORAGE_KEY = "lumera-guest-order-access";

type GuestOrderAccessMap = Record<string, string>;

function readMap(): GuestOrderAccessMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(GUEST_ORDER_ACCESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as GuestOrderAccessMap;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function writeMap(data: GuestOrderAccessMap) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(GUEST_ORDER_ACCESS_STORAGE_KEY, JSON.stringify(data));
}

export function setGuestOrderAccessToken(orderId: string, token: string) {
  if (!orderId || !token) {
    return;
  }
  const current = readMap();
  current[orderId] = token;
  writeMap(current);
}

export function getGuestOrderAccessToken(orderId: string): string | null {
  if (!orderId) {
    return null;
  }
  const current = readMap();
  return current[orderId] || null;
}
