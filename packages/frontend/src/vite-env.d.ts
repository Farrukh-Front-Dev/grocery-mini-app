/// <reference types="vite/client" />

interface Window {
  Telegram?: {
    WebApp: {
      initData: string;
      initDataUnsafe: Record<string, unknown>;
      ready: () => void;
      expand: () => void;
      close: () => void;
      MainButton: {
        setText: (text: string) => void;
        show: () => void;
        hide: () => void;
        onClick: (cb: () => void) => void;
      };
      [key: string]: unknown;
    };
  };
}
