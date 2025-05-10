// Includes:
// - pinging the bot
// - echoing a message
// - user info
// - server info
// - API pinging.

const { SlashCommandBuilder } = require('discord.js');

const { botMods } = require('../../.secrets/botMods.json');

const APIs = [{ name: 'waifu.im', url: 'https://api.waifu.im/tags' },
              { name: 'stable diffusion (localhost)', url: 'http://127.0.0.1:7860/info' },
              { name: 'The Color API', url: 'https://www.thecolorapi.com/id?hex=ffffff' }];

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
            const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;

            const apiLatency = Math.round(interaction.client.ws.ping);

            await interaction.editReply(`Pong! Latency: ${latency}ms, API Latency: ${apiLatency}ms`);
        }
        else if (interaction.options.getSubcommand() === 'echo') {
            const message = interaction.options.getString('message');
            await interaction.reply(message);
        }
        else if (interaction.options.getSubcommand() === 'user') {
            await interaction.reply(`This command was run by ${interaction.user.username}, who joined the server on ${interaction.member.joinedAt}.`);
        }
        else if (interaction.options.getSubcommand() === 'server') {
            await interaction.reply(`Server: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
        }
        else if (interaction.options.getSubcommand() === 'api') {

            if (botMods.includes(interaction.user.id)) {
                await interaction.reply(`Pinging ${APIs.length} APIs...`);

                let apiResults = '';

                for (const api of APIs) {
                    apiResults += ('\n');
                    try {
                        const response = await fetch(api.url);
                        apiResults += (`${api.name}: ${response.status} (${response.statusText})`);
                    }
                    catch (error) {
                        apiResults += (`${api.name}: ${error.message}`);
                    }
                }

                if (apiResults == '') {
                    apiResults = 'No APIs to ping.';
                }

                await interaction.editReply(apiResults);
            }
            else {
                await interaction.reply('You don\'t have permission to use this command!');
            }
        }
    },
};