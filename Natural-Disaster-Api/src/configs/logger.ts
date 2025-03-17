import winston, { format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export enum ELoggerLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  VERBOSE = "verbose",
  DEBUG = "debug",
  SILLY = "silly",
}

const {
  LOG_FILE_NAME = "application-%DATE%.log",
  LOG_DIR = "./logs",
  LOG_LEVEL = ELoggerLevel.INFO,
} = process.env;

const timestampFormat = format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" });

const logFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const dailyTransport = new DailyRotateFile({
  filename: LOG_FILE_NAME,
  dirname: LOG_DIR,
  datePattern: "YYYY-MM-DD-HH",
  maxSize: "1m",
  format: format.combine(timestampFormat, format.json(), logFormat),
});

const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.json(),
    timestampFormat,
    logFormat
  ),
});

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports: [consoleTransport, dailyTransport],
});
