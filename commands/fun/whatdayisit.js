const { SlashCommandBuilder } = require('discord.js');

const logger = require('../../logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whatdayisit')
        .setDescription('Tell me what day it is'),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        logger.verbose('Running "friday" command');

        const today = new Date().getDay();
        switch (today) {
            case 1:
                await interaction.reply('https://preview.redd.it/aqp60cmtwwyd1.jpeg?width=640&crop=smart&auto=webp&s=1c17a39996bae9cabd5afc0e76788c6585f3bf09');
                break;
            case 2:
                break;
            case 5:
                await interaction.reply('https://tenor.com/view/friday-stop-working-start-drinking-gif-16613439415718644570');
                break;
            default:
                await interaction.reply('I dont have a meme for this day');
                break;
        }

    },
};