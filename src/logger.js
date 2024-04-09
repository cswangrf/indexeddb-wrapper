class Logger {
  constructor(level = "info", output = "console") {
    this.level = level;
    this.output = output;
    this._log = (message, level) => {
      level = level ?? this.level;
      const timestamp = `[${this.getCurrentTime()}]`;
      const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      if (this.output === "console") {
        console[level](logMessage);
      } else {
        // Other output logic, such as file, etc.
      }
    };
  }

  _log(message, level) {
    level = level ?? this.level;
    const timestamp = `[${this.getCurrentTime()}]`;
    const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (this.output === "console") {
      console[level](logMessage);
    } else {
      // Other output logic, such as file, etc.
    }
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

  log(message) {
    this._log(message, "info");
  }

  info(message) {
    this._log(message, "info");
  }

  warn(message) {
    this._log(message, "warn");
  }

  error(message) {
    this._log(message, "error");
  }

  debug(message) {
    this._log(message, "debug");
  }
}

export default Logger;
