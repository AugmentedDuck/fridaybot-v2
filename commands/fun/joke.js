const { SlashCommandBuilder } = require('discord.js');

const logger = require('../../logger.js');

const jokeAPI = 'https://v2.jokeapi.dev/joke/Any';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Get a joke')
        .addBooleanOption(option =>
		    option
                .setName('ephemeral')
			    .setDescription('Whether or not the echo should be ephemeral')),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        logger.verbose('Running "joke" command');

        await interaction.deferReply();

        const isSafe = interaction.options.getBoolean('safe');

        const fullURL = isSafe ? jokeAPI + '?safe-mode' : jokeAPI;

        try {
            const response = await fetch(fullURL);
            const data = await response.json();

            logger.debug(data);

            if (data.type == 'single') {
                await interaction.editReply(data.joke);
            }
            else {
                await interaction.editReply(data.setup);
                setTimeout(() => {
                    interaction.followUp(data.delivery);
                }, 2000);
            }
        }
        catch (error) {
            logger.error(error);
            await interaction.editReply('I have a problem with 404 jokes,\nI don\'t find them funny\n*Something went wrong:* ' + error.message);
        }
    },
};