export {};

declare global {
  interface Window {
    electronAPI?: {
      isDesktop: boolean;
      platform: string;
      db: {
        invoke: (action: string, table: string, payload?: any) => Promise<{ success: boolean; data?: any; error?: string; count?: number; id?: string }>;
        onChanged: (callback: (table: string) => void) => () => void;
      };
      backup: {
        save: (content: string) => Promise<{ success: boolean; path?: string; cancelled?: boolean; error?: string }>;
        read: () => Promise<{ success: boolean; content?: string; path?: string; error?: string; cancelled?: boolean }>;
      };
      secureStorage: {
        get: (key: string) => Promise<{ success: boolean; data?: string }>;
        set: (key: string, value: string) => Promise<{ success: boolean }>;
        delete: (key: string) => Promise<{ success: boolean }>;
      };
    };
  }
}
