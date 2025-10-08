const winston = require('winston');

function timestamp() {
    const date = new Date();
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' T' + date.toLocaleTimeString();
}

const startTimestamp = new Date().toLocaleDateString();

const logFormat = winston.format.printf(function(info) {
    return `${timestamp()}: [${info.level}] ${JSON.stringify(info.message, null, 4)}`;
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), logFormat) }),

        new winston.transports.File({ filename: `./logs/${startTimestamp}.log`, format: logFormat, level: 'debug' }),
        new winston.transports.File({ filename: './logs/exceptions.log', format: logFormat, level: 'warn', handleExceptions: true }),
    ],
});

module.exports = logger;