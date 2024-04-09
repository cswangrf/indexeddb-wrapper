const map = new Map();
map.set("info", "\x1b[0m");
map.set("error", "\x1b[31m");
// map.set("assert", "\x1b[\x1b[32m");
map.set("warn", "\x1b[33m");
map.set("debug", "\x1b[34m");

class Logger {
  constructor(level = "info", output = "console") {
    this.level = level;
    this.output = output;
    this._log = (message, level, condition) => {
      level = level ?? this.level;
      const timestamp = `[${this.getCurrentTime()}]`;
      const color = map.get(level);
      const logMessage = `${color}${timestamp} [${level.toUpperCase()}]: ${message}${map.get(
        "info"
      )}`;
      if (this.output === "console") {
        console[level](logMessage);
      } else {
        // Other output logic, such as file, etc.
      }
    };
  }

  getCurrentTime() {
    const now = new Date();
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    const seconds = this.padZero(now.getSeconds());
    const milliseconds = this.padZero(now.getMilliseconds(), 3);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  padZero(num, size = 2) {
    let str = num.toString();
    while (str.length < size) {
      str = "0" + str;
    }
    return str;
  }

  setLevel(level) {
    this.level = level;
  }

  log(...message) {
    this._log(message.join(", "), "info");
  }

  info(...message) {
    this._log(message.join(", "), "info");
  }

  warn(...message) {
    this._log(message.join(", "), "warn");
  }

  error(...message) {
    this._log(message.join(", "), "error");
  }

  debug(...message) {
    this._log(message.join(", "), "debug");
  }
}

export default Logger;
