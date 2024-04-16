import indexedDB from "./indexedDB.js";
import Logger from "./logger.js";
import { performance } from "./performance.js";

class IndexedDBWrapper {
  private dbName: string;
  private dbVersion: number;
  private logger: Logger;
  private static db: IDBDatabase | null = null;

  constructor(databaseName: string, version: number) {
    this.dbName = databaseName;
    this.dbVersion = version;
    this.logger = new Logger("info", "console");
  }

  async open(tableName: string, keyPath: string): Promise<string> {
    this.logger.info("Open IndexedDB started.");
    return new Promise((resolve, reject) => {
      const start = performance.now();
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB database"));
      };

      request.onsuccess = () => {
        IndexedDBWrapper.db = request.result;
        this.logger.info(
          "Data set in " + (performance.now() - start).toFixed(2) + "ms"
        );
        resolve("IndexedDB opened successfully.");
      };

      request.onupgradeneeded = (event) => {
        IndexedDBWrapper.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBWrapper.db.createObjectStore(tableName, { keyPath: keyPath });
      };
    });
  }

  async set(tableName: string, data: any, key?: any): Promise<string> {
    const start = performance.now();
    this.logger.info("Set operation started.");
    if (!IndexedDBWrapper.db) throw new Error("Database is not open");

    return new Promise((resolve, reject) => {
      const transaction = IndexedDBWrapper.db!.transaction(
        tableName,
        "readwrite"
      );
      const store = transaction.objectStore(tableName);

      const request = key ? store.put(data, key) : store.add(data);

      request.onerror = () => {
        reject(new Error("Failed to set data in IndexedDB"));
      };

      request.onsuccess = () => {
        this.logger.info(
          "Data set in " + (performance.now() - start).toFixed(2) + "ms"
        );
        resolve("success");
      };
    });
  }

  async get(tableName: string, key: any): Promise<any> {
    if (!IndexedDBWrapper.db) throw new Error("Database is not open");

    return new Promise((resolve, reject) => {
      const transaction = IndexedDBWrapper.db!.transaction(
        tableName,
        "readonly"
      );
      const store = transaction.objectStore(tableName);

      const request = store.get(key);

      request.onerror = () => {
        reject(new Error("Failed to get data from IndexedDB"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  async listKeys(tableName: string): Promise<any[]> {
    if (!IndexedDBWrapper.db) throw new Error("Database is not open");

    return new Promise((resolve, reject) => {
      const transaction = IndexedDBWrapper.db!.transaction(
        tableName,
        "readonly"
      );
      const store = transaction.objectStore(tableName);
      const request = store.getAllKeys();

      request.onerror = () => {
        reject(new Error("Failed to list keys in IndexedDB"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  async remove(tableName: string, ...keys: any[]): Promise<string> {
    if (!IndexedDBWrapper.db) throw new Error("Database is not open");

    return new Promise((resolve, reject) => {
      const transaction = IndexedDBWrapper.db!.transaction(
        tableName,
        "readwrite"
      );
      const store = transaction.objectStore(tableName);

      keys.forEach((key) => {
        const request = store.delete(key);
        request.onerror = () => {
          reject(new Error("Failed to remove data from IndexedDB"));
        };
      });

      transaction.oncomplete = () => {
        resolve(keys.join(", ") + "removed successfully.");
      };
    });
  }

  async truncate(tableName: string): Promise<void> {
    if (!IndexedDBWrapper.db) throw new Error("Database is not open");

    return new Promise((resolve, reject) => {
      const transaction = IndexedDBWrapper.db!.transaction(
        tableName,
        "readwrite"
      );
      const store = transaction.objectStore(tableName);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error("Failed to truncate table in IndexedDB"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }
}

export default IndexedDBWrapper;
