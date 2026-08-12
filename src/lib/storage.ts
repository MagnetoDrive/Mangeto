class SafeStorage {
  private memoryStore: Record<string, string> = {};

  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const value = window.localStorage.getItem(key);
        if (value !== null) return value;
      }
      return this.memoryStore[key] || null;
    } catch (e) {
      console.warn("Storage access issue, using in-memory fallback:", e);
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
      console.warn("LocalStorage quota or disk space exceeded, gracefully falling back to in-memory store:", e);
      this.memoryStore[key] = value;
      // Best-effort cleanup of non-critical items if disk space / quota error occurred
      try {
        if (typeof window !== "undefined" && window.localStorage && key !== "magneto_projects") {
          window.localStorage.removeItem("magneto_projects");
        }
      } catch (_) {}
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete this.memoryStore[key];
    } catch (e) {
      console.warn("Storage access issue, removing from in-memory store:", e);
      delete this.memoryStore[key];
    }
  }

  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
      this.memoryStore = {};
    } catch (e) {
      this.memoryStore = {};
    }
  }
}

export const safeStorage = new SafeStorage();
