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
  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

  function getInitData(): string {
    if (cachedInitData) return cachedInitData;
    try {
      cachedInitData = tg?.initData || "";
    } catch {
      cachedInitData = "";
    }
    return cachedInitData;
  }

  function ready() {
    try { tg?.ready(); tg?.expand(); } catch {}
  }

  return { tg, getInitData, ready, isTelegram: !!tg };
}
