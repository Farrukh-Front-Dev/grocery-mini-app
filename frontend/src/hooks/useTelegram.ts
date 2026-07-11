function generateMockInitData(): string {
  const user = JSON.stringify({ id: 1, first_name: "Dev", username: "dev" });
  return `user=${encodeURIComponent(user)}&hash=mock${Date.now()}`;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: Record<string, unknown>;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: { setText: (t: string) => void; show: () => void; hide: () => void; onClick: (cb: () => void) => void };
        [key: string]: unknown;
      };
    };
  }
}

let cachedInitData: string | null = null;

export function useTelegram() {
  const isTelegram = typeof window !== "undefined" && !!window.Telegram?.WebApp?.initData;
  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

  function getInitData(): string {
    if (cachedInitData) return cachedInitData;
    if (isTelegram) {
      cachedInitData = tg?.initData || "";
    } else {
      cachedInitData = generateMockInitData();
    }
    return cachedInitData;
  }

  function ready() {
    if (isTelegram) {
      try { tg?.ready(); tg?.expand(); } catch {}
    }
  }

  return { tg, getInitData, ready, isTelegram };
}
