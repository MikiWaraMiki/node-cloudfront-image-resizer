import * as winston from "winston";

// eslint-disable-next-line import/prefer-default-export
export const Logger = async (): Promise<winston.Logger> => {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: "image-resizer-lambda-edge" },
    transports: new winston.transports.Console()
  });
}
