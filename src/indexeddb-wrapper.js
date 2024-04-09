import indexedDB from "./indexedDB.js";
import Logger from "./logger.js";
import { performance } from "./performance.js";
import enforceRange from "./enforceRange.js";

const logger = new Logger("info", "console");

/**
 * IndexedDB asynchronous initialization.
 * @param {*} databaseName
 * @param {*} tableName
 * @param {*} version, unsigned long long
 * @param {*} keyPath
 * @param {*} callback
 */
function syncInit(databaseName, tableName, version, keyPath, callback) {
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

function syncSet(database, tableName, data, callback) {
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

function syncGet(database, tableName, key, callback, errorCallBack) {
  if (database === undefined) {
    if (errorCallBack) {
      errorCallBack("database undefined.");
    }
    return;
  }

  logger.info(`Started to fetch data by keyPath ${key}.`);
  const transaction = database.transaction([tableName], "readwrite");
  const objectStore = transaction.objectStore(tableName);

  const request = objectStore.get(key);
  request.onsuccess = function (event) {
    if (event.target.result) {
      logger.info(`Fetched data by keyPath ${key}.`);
      callback(event.target.result);
    } else if (errorCallBack) {
      errorCallBack(`Failed to fetch data by keyPath ${key}.`);
    }
  };

  request.onerror = function (event) {
    logger.warn("keyPath: " + key + " not found", event);
    if (errorCallBack) errorCallBack();
  };
}

function syncListKeys(database, tableName, callback) {
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

function syncRemove(database, tableName, callback, ...keys) {
  if (keys === undefined || keys.size === 0) {
    return;
  }
  let transaction = database.transaction([tableName], "readwrite");
  let objectStore = transaction.objectStore(tableName);
  keys.forEach((key) => {
    let request = objectStore.delete(key);
    request.onsuccess = function () {
      logger.info(`Record with key ${key} has been removed.`);
      if (callback) {
        callback("success", key);
      }
    };
    request.onerror = function (event) {
      logger.error(`Failed to remove record with key ${key}.`, event);
      if (callback) {
        callback("failed", key);
      }
    };
  });
}

function syncTruncate(database, tableName, callback) {
  if (database === undefined) return;

  var transaction = database.transaction([tableName], "readwrite");
  var objectStore = transaction.objectStore(tableName);
  if (objectStore) {
    var request = objectStore.clear();
    request.onsuccess = function () {
      logger.info(`${tableName} has been truncated.`);
      if (callback) {
        callback("success");
      }
    };

    request.onerror = function (event) {
      logger.error(`Failed to truncate table ${tableName}.`);
      if (callback) {
        callback("failed");
      }
    };
  }
}

async function init(databaseName, tableName, version, keyPath) {
  return new Promise((resolve, reject) => {
    syncInit(databaseName, tableName, version, keyPath, (db) => {
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
    syncSet(database, tableName, data, (ret) => {
      logger.info("set db value", ret);
      if (ret === "success") {
        resolve(ret);
      } else {
        reject(ret);
      }
    });
  });
}

async function get(database, tableName, key) {
  return new Promise((resolve, reject) => {
    syncGet(
      database,
      tableName,
      key,
      (ret) => {
        resolve(ret);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

async function listKeys(database, tableName) {
  return new Promise((resolve, reject) => {
    syncListKeys(database, tableName, (ret) => {
      if (ret) {
        resolve(ret);
      } else {
        reject(ret);
      }
    });
  });
}

async function remove(database, tableName, ...keys) {
  return new Promise((resolve, reject) => {
    syncRemove(
      database,
      tableName,
      (ret, key) => {
        if (ret === "success") {
          resolve(`Record with key ${key} has been removed.`);
        } else {
          reject(`Failed to remove record with key ${key}.`);
        }
      },
      ...keys
    );
  });
}

async function truncate(database, tableName) {
  return new Promise((resolve, reject) => {
    syncTruncate(database, tableName, (ret) => {
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
  foo = structuredClone(foo);
  foo.key_path = "key3";
  await set(db, tbName, foo);
  foo = structuredClone(foo);
  foo.key_path = "key4";
  await set(db, tbName, foo);
  foo = structuredClone(foo);
  foo.key_path = "key5";
  foo.value = "value5";
  await set(db, tbName, foo);
  foo = structuredClone(foo);
  foo.key_path = "key5";
  foo.value = "value555";
  await set(db, tbName, foo);

  const keys = await listKeys(db, tbName);
  logger.debug("Stored keys are: ");
  logger.debug(...keys);

  const getRet1 = await get(db, tbName, "key1").catch((error) => {
    logger.error(error);
  });
  if (getRet1) logger.debug(JSON.stringify(getRet1));
  const getRet2 = await get(db, tbName, "key2").catch((error) => {
    logger.info(error);
  });
  if (getRet2) logger.debug(getRet2);

  const getRet5 = await get(db, tbName, "key5").catch((error) => {
    logger.error(error);
  });
  if (getRet5) logger.debug(JSON.stringify(getRet5));

  const removeRet = await remove(
    db,
    tbName,
    "key1",
    "key2",
    "key3",
    "key4",
    "key5"
  );
  logger.debug(removeRet);
}

main();
