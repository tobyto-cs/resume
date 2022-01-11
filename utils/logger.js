const winston = require('winston');
const fs = require('fs');
const path = require('path');

const logdir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logdir)) {
  fs.mkdirSync(logdir)
}

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(logdir, 'info.log'), level: 'info' }),
    new winston.transports.File({ filename: path.join(logdir, 'debug.log')})
  ]
})

const consoleFormat = winston.format.printf( ({ level, message, timestamp, ...metadata }) => {
  let msg = `[${level}]: ${message} `;
  return msg;
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.timestamp(),
      consoleFormat
    )
  }));
}

module.exports = logger;
