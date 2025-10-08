const { SlashCommandBuilder } = require('discord.js');

const logger = require('../../logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('save')
        .setDescription('save some data (not shared between servers)')
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
            .setName('event')
            .setDescription('Set a name and a timestamp for an event')
            .addSubcommand(subcommand =>
                subcommand
                .setName('create')
                .setDescription('Create a new event')
                .addStringOption(option =>
                    option
                    .setName('type')
                    .setDescription('type of event')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Birthday', value: 'birthday' },
                        { name: 'Other', value: 'other' }))
                .addStringOption(option =>
                    option
                    .setName('name')
                    .setDescription('name of the event')
                    .setRequired(true))
                .addIntegerOption(option =>
                    option
                    .setName('year')
                    .setDescription('what year should this event be')
                    .setRequired(true))
                .addIntegerOption(option =>
                    option
                    .setName('month')
                    .setDescription('what month should this event be')
                    .addChoices(
                        { name: 'January', value: 1 },
                        { name: 'Febuary', value: 2 },
                        { name: 'March', value: 3 },
                        { name: 'April', value: 4 },
                        { name: 'May', value: 5 },
                        { name: 'June', value: 6 },
                        { name: 'July', value: 7 },
                        { name: 'August', value: 8 },
                        { name: 'September', value: 9 },
                        { name: 'October', value: 10 },
                        { name: 'Nevember', value: 11 },
                        { name: 'December', value: 12 })
                    .setRequired(true))
                .addIntegerOption(option =>
                    option
                    .setName('day')
                    .setDescription('what day should this event be')
                    .setMaxValue(31)
                    .setMinValue(1)
                    .setRequired(true))
                .addBooleanOption(option =>
                    option
                    .setName('repeat')
                    .setDescription('Should this event repeat every year')
                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                .setName('list')
                .setDescription('Show all events')
                .addStringOption(option =>
                    option
                    .setName('type')
                    .setDescription('type of event')
                    .addChoices(
                        { name: 'Birthday', value: 'birthday' },
                        { name: 'Other', value: 'other' })))
            .addSubcommand(subcommand =>
                subcommand
                .setName('next')
                .setDescription('Show next event')
                .addStringOption(option =>
                    option
                    .setName('type')
                    .setDescription('type of event')
                    .addChoices(
                        { name: 'Birthday', value: 'birthday' },
                        { name: 'Other', value: 'other' }))))

// /////////////////////////////////////////////////////
//
//              PERSISTANT NON EVENT
//
// /////////////////////////////////////////////////////
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
            .setName('data')
            .setDescription('Store only data')
            .addSubcommand(subcommand =>
                subcommand
                .setName('create')
                .setDescription('Create a new entry')
                .addStringOption(option =>
                    option
                    .setName('data')
                    .setDescription('what should be stored')
                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                .setName('list')
                .setDescription('Show all stored data')
                .addStringOption(option =>
                    option
                    .setName('type')
                    .setDescription('Quotes or other data')
                    .setChoices(
                        { name: 'other', value: 'other' },
                        { name: 'quote', value: 'quote' })
                    .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                .setName('quote')
                .setDescription('Quote someone')
                .addStringOption(option =>
                    option
                    .setName('quote')
                    .setDescription('The quote')
                    .setRequired(true))
                .addUserOption(option =>
                    option
                    .setName('author')
                    .setDescription('Who said it')
                    .setRequired(true)))),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        logger.verbose('Running "save" command');
        await interaction.deferReply();

        if (interaction.options.getSubcommandGroup() === 'event') {
            if (interaction.options.getSubcommand() === 'create') {
                interaction.editReply('This is not yet supported');
            }
            else if (interaction.options.getSubcommand() === 'list') {
                interaction.editReply('This is not yet supported');
            }
            else if (interaction.options.getSubcommand() === 'next') {
                interaction.editReply('This is not yet supported');
            }
            else {
                logger.warn('User got to an unreachable spot: ' + interaction.options.getSubcommandGroup() + ' -> ' + interaction.options.getSubcommand());
                interaction.editReply('Your not supposed to get here');
            }
        }
        else if (interaction.options.getSubcommandGroup() === 'data') {
            if (interaction.options.getSubcommand() === 'create') {
                interaction.editReply('This is not yet supported');
            }
            else if (interaction.options.getSubcommand() === 'list') {
                interaction.editReply('This is not yet supported');
            }
            else if (interaction.options.getSubcommand() === 'quote') {
                interaction.editReply('This is not yet supported');
            }
            else {
                logger.warn('User got to an unreachable spot: ' + interaction.options.getSubcommandGroup() + ' -> ' + interaction.options.getSubcommand());
                interaction.editReply('Your not supposed to get here');
            }
        }
        else {
            logger.warn('User got to an unreachable spot: ' + interaction.options.getSubcommandGroup());
            interaction.editReply('Your not supposed to get here');
        }
        return;
    },
};