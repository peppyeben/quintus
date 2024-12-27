import winston from "winston";

// Create a logger
const logger = winston.createLogger({
    level: "info", // Default log level
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({
            filename: "logs/combined.log",
        }),
        // If we're not in production, log to the console as well
        ...(process.env.NODE_ENV !== "production"
            ? [
                  new winston.transports.Console({
                      format: winston.format.combine(
                          winston.format.colorize(),
                          winston.format.simple()
                      ),
                  }),
              ]
            : []),
    ],
});

export default logger;
