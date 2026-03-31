import winston from "winston";
import { config } from "./env.js";

const logger = winston.createLogger({
    level: config.nodeEnv === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        config.nodeEnv === "production"
            ? winston.format.json()
            : winston.format.combine(
                  winston.format.colorize(),
                  winston.format.printf(
                      ({ timestamp, level, message, ...meta }) =>
                          `${timestamp} ${level}: ${message}${
                              Object.keys(meta).length
                                  ? " " + JSON.stringify(meta)
                                  : ""
                          }`
                  )
              )
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
