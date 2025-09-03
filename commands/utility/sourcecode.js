const { SlashCommandBuilder } = require('discord.js');

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
        await interaction.reply('https://github.com/AugmentedDuck/fridaybot-v2');
    },
};