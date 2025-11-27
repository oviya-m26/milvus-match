import fs from "node:fs"
import path from "node:path"
import winston from "winston"
import { config } from "../config.js"

const logDir = config.logsPath
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "ingest.log"),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 3,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message }) => `[${level}] ${message}`)
      ),
    }),
  ],
})



