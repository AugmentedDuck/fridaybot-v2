// Includes:
// - pinging the bot
// - echoing a message
// - user info
// - server info
// - API pinging.

const { SlashCommandBuilder } = require('discord.js');

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
                    option.setName('message')
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
            await interaction.reply('Not implemented yet!');
        }
    },
};