import { createRequire } from "module";
import { indexedDB as fakeIndexedDB } from "fake-indexeddb";

let indexedDB;
if (typeof window === "undefined") {
  // const require = createRequire(import.meta.url);
  // indexedDB = require("fake-indexeddb");
  indexedDB = fakeIndexedDB;
} else {
  // Use the native IndexedDB API in a browser environment
  indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB;
}

export default indexedDB;
