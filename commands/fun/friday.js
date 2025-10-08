const { SlashCommandBuilder } = require('discord.js');

const logger = require('../../logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('friday')
        .setDescription('Is it friday?'),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        logger.verbose('Running "friday" command');

        const today = new Date();
        const isFriday = today.getDay() === 5;

        await interaction.reply(`${isFriday ? 'https://tenor.com/view/friday-stop-working-start-drinking-gif-16613439415718644570' : 'No\nhttps://tenor.com/view/kpop-looking-for-friday-gif-11705491'}`);
    },
};