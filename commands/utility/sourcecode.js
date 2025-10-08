const { SlashCommandBuilder } = require('discord.js');

const logger = require('../../logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('source-code')
        .setDescription('Get the link for my source code'),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        logger.verbose('Running "sourcecode" command');
        await interaction.reply('https://github.com/AugmentedDuck/fridaybot-v2');
    },
};