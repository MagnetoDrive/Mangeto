class SafeStorage {
  private memoryStore: Record<string, string> = {};

  getItem(key: string): string | null {
    try {
      return typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (e) {
      console.warn("Storage access denied, using in-memory fallback", e);
      return this.memoryStore[key] || null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        this.memoryStore[key] = value;
      }
    } catch (e) {
      console.warn("Storage access denied, using in-memory fallback", e);
      this.memoryStore[key] = value;
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        delete this.memoryStore[key];
      }
    } catch (e) {
      console.warn("Storage access denied, using in-memory fallback", e);
      delete this.memoryStore[key];
    }
  }
}

export const safeStorage = new SafeStorage();
