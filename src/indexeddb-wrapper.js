import indexedDB from "./indexedDB.js";
import { performance } from "./performance.js";
import enforceRange from "./enforceRange.js";

/**
 *
 * @param {*} tableName
 * @param {*} version, unsigned long long
 * @param {*} keyPath
 * @param {*} callback
 */
function init(databaseName, tableName, version, keyPath, callback) {
  if (version !== undefined) {
    // Based on spec, not sure why "MAX_SAFE_INTEGER" instead of "unsigned long long", but it's needed to pass
    // tests
    version = enforceRange(version, "MAX_SAFE_INTEGER");
  }
  if (version === 0) {
    throw new TypeError();
  }

  const request = indexedDB.open(tableName, version);
  let table;

  request.onupgradeneeded = function (event) {
    database = event.target.result;
    if (database.objectStoreNames.contains(tableName)) {
      console.debug("database.objectStoreNames", database.objectStoreNames);
      database.deleteObjectStore(tableName);
    }
    database.createObjectStore(tableName, { keyPath: keyPath });
  };

  request.onsuccess = function (event) {
    table = event.target.result;
    callback(table);
  };

  request.onerror = function (event) {
    console.warn("Failed to open: ", event);
  };
}

function listKeys(database, callback, tableName) {
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

function get(database, fileName, callback, errorCallBack, tableName) {
  if (database === undefined) {
    if (errorCallBack) {
      errorCallBack("database undefined.");
    }
    return;
  }

  const transaction = database.transaction([tableName], "readwrite");
  const objectStore = transaction.objectStore(tableName);

  const request = objectStore.get(fileName);
  request.onsuccess = function (event) {
    if (event.target.result) {
      callback(event.target.result);
    } else if (errorCallBack) {
      errorCallBack();
    }
  };

  request.onerror = function (event) {
    console.debug("fileBlob: " + fileName + " not found", event);
    if (errorCallBack) errorCallBack();
  };
}

function set(database, tableName, data, callback) {
  if (!database || !data) {
    if (callback) {
      callback("failed");
    }
    return;
  }

  const start = performance.now();

  const transaction = database.transaction([tableName], "readwrite");
  const objectStore = transaction.objectStore(tableName);

  var countRequest = objectStore.count();
  countRequest.onsuccess = function () {
    // if (countRequest.result > 800) {
    //   objectStore.clear();
    // }

    const request = objectStore.put(data);
    request.onsuccess = function () {
      console.debug(
        "[" + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + "]",
        "Saved state to IndexedDB. " +
          (performance.now() - start).toFixed(2) +
          "ms"
      );
      if (callback) {
        callback("success");
      }
    };

    request.onerror = function (event) {
      console.warn("save error", event);
      objectStore.clear();
      if (callback) {
        callback("failed");
      }
    };
  };
}

let dbName = "test_database",
  tbName = "test_table";
init(dbName, tbName, "200", "key_path", (database) => {
  let foo = { key_path: "key1", value: "value2" };
  set(database, tbName, foo, (ret) => {
    console.log("set db value", ret);
  });
});
