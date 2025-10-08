const { generateDependencyReport } = require('@discordjs/voice');

const logger = require('./logger.js');

logger.debug(generateDependencyReport());