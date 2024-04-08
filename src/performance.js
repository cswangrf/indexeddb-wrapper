import { createRequire } from "module";

let _performance;
if (typeof performance === "undefined") {
  const require = createRequire(import.meta.url);
  _performance = require("perf_hooks").performance;
} else {
  _performance = performance;
}

export { _performance as performance };
