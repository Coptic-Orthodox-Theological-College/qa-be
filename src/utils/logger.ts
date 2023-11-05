import winston, { Logger, format } from "winston";
import path from "path";
import fs from "fs";

const logDir: string = path.join(__dirname, "..", "log");

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
  },
};

winston.addColors(customLevels.colors);

// Custom format to filter log levels
const onlyLevel = (level: string) =>
  format((info) => {
    if (info.level === level) return info;
    return false;
  })();

const logger: Logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => `${info.level}: ${info.message}`)
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: winston.format.combine(onlyLevel("error"), winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: path.join(logDir, "warn.log"),
      level: "warn",
      format: winston.format.combine(onlyLevel("warn"), winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: path.join(logDir, "info.log"),
      level: "info",
      format: winston.format.combine(onlyLevel("info"), winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

// Create a stream object for morgan
const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, morganStream };
