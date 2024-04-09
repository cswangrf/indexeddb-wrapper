import indexedDB from "./indexedDB.js";
import Logger from "./logger.js";
import { performance } from "./performance.js";
import enforceRange from "./enforceRange.js";

const logger = new Logger("info", "console");

/**
 *
 * @param {*} databaseName
 * @param {*} tableName
 * @param {*} version, unsigned long long
 * @param {*} keyPath
 * @param {*} callback
 */
function asyncInit(databaseName, tableName, version, keyPath, callback) {
  if (version !== undefined) {
    // Based on spec, not sure why "MAX_SAFE_INTEGER" instead of "unsigned long long", but it's needed to pass
    // tests
    version = enforceRange(version, "MAX_SAFE_INTEGER");
  }
  if (version === 0) {
    throw new TypeError();
  }
  logger.info("Database initialize started.");

  const request = indexedDB.open(databaseName, version);
  let database;

  request.onupgradeneeded = function (event) {
    database = event.target.result;
    if (database.objectStoreNames.contains(tableName)) {
      logger.info("database.objectStoreNames", database.objectStoreNames);
      database.deleteObjectStore(tableName);
    }
    database.createObjectStore(tableName, { keyPath: keyPath });
  };

  request.onsuccess = function (event) {
    database = event.target.result;
    logger.info("Database initialize finished.");
    callback(database);
  };

  request.onerror = function (event) {
    logger.warn("Failed to open: ", event);
  };
}

function listKeys(database, tableName, callback) {
  if (database === undefined) return;

  const transaction = database.transaction([tableName], "readwrite");
  const objectStore = transaction.objectStore(tableName);
  const req = objectStore.getAllKeys();
  req.onsuccess = function () {
    callback(req.result);
  };

  req.onerror = function () {
    callback(null);
  };
}

function get(database, tableName, key, callback, errorCallBack) {
  if (database === undefined) {
    if (errorCallBack) {
      errorCallBack("database undefined.");
    }
    return;
  }

  const transaction = database.transaction([tableName], "readwrite");
  const objectStore = transaction.objectStore(tableName);

  const request = objectStore.get(key);
  request.onsuccess = function (event) {
    if (event.target.result) {
      callback(event.target.result);
    } else if (errorCallBack) {
      errorCallBack();
    }
  };

  request.onerror = function (event) {
    logger.warn("keyPath: " + key + " not found", event);
    if (errorCallBack) errorCallBack();
  };
}

function asyncSet(database, tableName, data, callback) {
  if (!database || !data) {
    if (callback) {
      callback("failed");
    }
    return;
  }

  const start = performance.now();
  logger.info("Set operation started.");

  const transaction = database.transaction([tableName], "readwrite");
  const objectStore = transaction.objectStore(tableName);

  var countRequest = objectStore.count();
  countRequest.onsuccess = function () {
    const request = objectStore.put(data);
    request.onsuccess = function () {
      logger.info(
        "Data set in " + (performance.now() - start).toFixed(2) + "ms"
      );
      if (callback) {
        callback("success");
      }
    };

    request.onerror = function (event) {
      logger.warn("save error", event);
      objectStore.clear();
      if (callback) {
        callback("failed");
      }
    };
  };
}

async function init(databaseName, tableName, version, keyPath) {
  return new Promise((resolve, reject) => {
    asyncInit(databaseName, tableName, version, keyPath, (db) => {
      if (db) {
        resolve(db);
      } else {
        reject("Error occurred.");
      }
    });
  });
}

async function set(database, tableName, data) {
  return new Promise((resolve, reject) => {
    asyncSet(database, tableName, data, (ret) => {
      logger.info("set db value", ret);
      if (ret === "success") {
        resolve(ret);
      } else {
        reject(ret);
      }
    });
  });
}

async function main() {
  let dbName = "test_database";
  let tbName = "test_table";
  let foo = { key_path: "key1", value: "value2" };

  const db = await init(dbName, tbName, "200", "key_path");
  const ret = await set(db, tbName, foo);
  logger.debug(ret);
}

main();
