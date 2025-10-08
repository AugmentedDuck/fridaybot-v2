const { SlashCommandBuilder } = require('discord.js');

const { botMods } = require('../../.secrets/botMods.json');

const logger = require('../../logger.js');

const APIs = [{ name: 'waifu.im', url: 'https://api.waifu.im/tags' },
              { name: 'stable diffusion (localhost)', url: 'http://127.0.0.1:7860/info' },
              { name: 'The Color API', url: 'https://www.thecolorapi.com/id?hex=ffffff' },
              { name: 'JokeAPI', url: 'https://v2.jokeapi.dev/joke/Any' }];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Debugging commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ping')
                .setDescription('Ping the bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('echo')
                .setDescription('Echo a message')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('The message to echo')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Get information about the user'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Get information about the server'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('api')
                .setDescription('ping different APIs')),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'ping') {
            logger.verbose('Running "debug ping" command');

            const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;

            const apiLatency = Math.round(interaction.client.ws.ping);

            logger.verbose(`Latency is ${latency}, with an API latency of ${apiLatency}`);

            await interaction.editReply(`Pong! Latency: ${latency}ms, API Latency: ${apiLatency}ms`);
        }
        else if (interaction.options.getSubcommand() === 'echo') {
            logger.verbose('Running "debug echo" command');

            const message = interaction.options.getString('message');
            await interaction.reply(message);
        }
        else if (interaction.options.getSubcommand() === 'user') {
            logger.verbose('Running "debug user" command');

            await interaction.reply(`This command was run by ${interaction.user.username}, who joined the server on ${interaction.member.joinedAt}.`);
        }
        else if (interaction.options.getSubcommand() === 'server') {
            logger.verbose('Running "debug server" command');

            await interaction.reply(`Server: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
        }
        else if (interaction.options.getSubcommand() === 'api') {

            logger.verbose('Running "debug api" command');

            if (botMods.includes(interaction.user.id)) {
                logger.info('User is authorized to run command');
                await interaction.reply(`Pinging ${APIs.length} APIs...`);

                const apiResults = [];

                for (const api of APIs) {
                    try {
                        const response = await fetch(api.url);
                        apiResults.push([api.name, response.status, response.statusText]);
                    }
                    catch (error) {
                        apiResults.push([api.name, '0', error.message]);
                    }
                }

                logger.debug(apiResults);

                let apiResultsString = '';
                const statusCodes = [];

                for (const response of apiResults) {

                    if (response[1] == '0') {
                        apiResultsString += `${response[0]}: ERROR (${response[2]})\n`;
                        continue;
                    }

                    if (!statusCodes.includes(response[1])) {
                        statusCodes.push(response[1]);
                    }

                    apiResultsString += `${response[0]}: ${response[1]}, ${response[2]}\n`;
                }

                for (const statusCode of statusCodes) {
                    const random = Math.floor(Math.random() * (4));

                    try {
                        switch (random) {
                            case 1:
                                apiResultsString += 'https://http.cat/' + statusCode;
                                break;
                            case 2:
                                apiResultsString += 'https://httpducks.com/' + statusCode + '.jpg';
                                break;
                            case 3:
                                apiResultsString += 'https://http.pizza/' + statusCode + '.jpg';
                                break;
                            default:
                                break;
                        }
                    }
                    catch (error) {
                        logger.error(error);
                    }
                }

                if (apiResults.length == 0) {
                    apiResultsString = 'No APIs to ping.';
                }

                logger.debug(apiResultsString);

                await interaction.editReply(apiResultsString);
            }
            else {
                logger.info('User is NOT authorized to run command');

                await interaction.reply('You don\'t have permission to use this command!');
            }
        }
    },
};