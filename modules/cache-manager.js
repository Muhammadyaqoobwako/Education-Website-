// Cache Manager Module - Advanced caching utilities
class CacheManager {
  constructor(options = {}) {
    this.cacheName = options.cacheName || "app-cache-v1";
    this.maxAge = options.maxAge || 86400000; // 24 hours in milliseconds
    this.maxItems = options.maxItems || 50;
  }

  // Store data in localStorage with timestamp
  set(key, value, expiresIn = this.maxAge) {
    try {
      const item = {
        value: value,
        timestamp: Date.now(),
        expiresIn: expiresIn,
      };
      localStorage.setItem(this.getCacheKey(key), JSON.stringify(item));
      this.cleanup();
      return true;
    } catch (error) {
      console.error("Error storing cache:", error);
      return false;
    }
  }

  // Retrieve data from localStorage
  get(key) {
    try {
      const cachedItem = localStorage.getItem(this.getCacheKey(key));
      if (!cachedItem) return null;

      const item = JSON.parse(cachedItem);
      const now = Date.now();

      // Check if expired
      if (now - item.timestamp > item.expiresIn) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error("Error retrieving cache:", error);
      return null;
    }
  }

  // Remove specific cache item
  remove(key) {
    try {
      localStorage.removeItem(this.getCacheKey(key));
      return true;
    } catch (error) {
      console.error("Error removing cache:", error);
      return false;
    }
  }

  // Clear all cache items
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.cacheName + "_")) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }

  // Clean up expired items
  cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) =>
        key.startsWith(this.cacheName + "_")
      );

      // Remove expired items
      cacheKeys.forEach((key) => {
        const item = JSON.parse(localStorage.getItem(key));
        if (Date.now() - item.timestamp > item.expiresIn) {
          localStorage.removeItem(key);
        }
      });

      // If still too many items, remove oldest
      if (cacheKeys.length > this.maxItems) {
        const sortedKeys = cacheKeys
          .map((key) => ({
            key: key,
            timestamp: JSON.parse(localStorage.getItem(key)).timestamp,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        const toRemove = sortedKeys.slice(0, sortedKeys.length - this.maxItems);
        toRemove.forEach((item) => localStorage.removeItem(item.key));
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }

  // Get full cache key
  getCacheKey(key) {
    return `${this.cacheName}_${key}`;
  }

  // Get cache size
  getSize() {
    const keys = Object.keys(localStorage);
    return keys.filter((key) => key.startsWith(this.cacheName + "_")).length;
  }

  // Get cache statistics
  getStats() {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) =>
      key.startsWith(this.cacheName + "_")
    );

    let totalSize = 0;
    let validItems = 0;
    let expiredItems = 0;

    cacheKeys.forEach((key) => {
      const item = localStorage.getItem(key);
      totalSize += item.length;

      const parsedItem = JSON.parse(item);
      if (Date.now() - parsedItem.timestamp > parsedItem.expiresIn) {
        expiredItems++;
      } else {
        validItems++;
      }
    });

    return {
      totalItems: cacheKeys.length,
      validItems: validItems,
      expiredItems: expiredItems,
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
    };
  }
}

// Session Storage Manager
class SessionManager {
  static set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error storing session data:", error);
      return false;
    }
  }

  static get(key) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error retrieving session data:", error);
      return null;
    }
  }

  static remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing session data:", error);
      return false;
    }
  }

  static clear() {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing session storage:", error);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CacheManager, SessionManager };
}
