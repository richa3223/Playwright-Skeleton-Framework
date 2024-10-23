import { createLogger, format, transports } from 'winston';

/* Winston is used as the default logger to provide flexibility to log formatting and storage.
This should be used in favour of console logs. 
For more information, see: https://github.com/winstonjs/winston */
export const getLogger = (correlationId?: string) => {
  const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
      format.splat(),
      format.prettyPrint(),
      format.colorize(),
      format.timestamp(),
      format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    },
    defaultMeta: { component: 'playwright-test-framework' },
    transports: [new transports.Console({})],
  });

  if (correlationId) {
    logger.defaultMeta = { ...logger.defaultMeta, correlationId };
  }

  return logger;
};
