const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

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
                        { name: 'November', value: 11 },
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
                    .setRequired(true))
                .addBooleanOption(option =>
                    option
                    .setName('random')
                    .setDescription('Should only one random data be chosen')
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

        const server = interaction.guild.id;

        if (interaction.options.getSubcommandGroup() === 'event') {
            if (interaction.options.getSubcommand() === 'create') {
                const type = interaction.options.getString('type');
                const name = interaction.options.getString('name');

                const year = interaction.options.getInteger('year');
                const month = interaction.options.getInteger('month');
                const day = interaction.options.getInteger('day');

                const isRepeating = interaction.options.getBoolean('repeat');

                const timestamp = Math.round(new Date().setFullYear(year, month - 1, day) / 1000);

                await interaction.editReply(`This is not yet supported, you entered:\n-Type: ${type}\n-Name: ${name}\n-Time: <t:${timestamp}:D> <t:${timestamp}:R>\n-Repeating: ${isRepeating}\n`);
            }
            else if (interaction.options.getSubcommand() === 'list') {
                const type = interaction.options.getString('type');

                await interaction.editReply(`This is not yet supported, you entered:\n-Type: ${type}`);
            }
            else if (interaction.options.getSubcommand() === 'next') {
                const type = interaction.options.getString('type');

                await interaction.editReply(`This is not yet supported, you entered:\n-Type: ${type}`);
            }
            else {
                logger.warn('User got to an unreachable spot: ' + interaction.options.getSubcommandGroup() + ' -> ' + interaction.options.getSubcommand());
                await interaction.editReply('Your not supposed to get here');
            }
        }
        else if (interaction.options.getSubcommandGroup() === 'data') {
            if (interaction.options.getSubcommand() === 'create') {
                const data = interaction.options.getString('data');

                await interaction.editReply(`This is not yet supported, you entered:\n-Data: ${data}`);
            }
            else if (interaction.options.getSubcommand() === 'list') {
                const type = interaction.options.getString('type');
                const isAll = !interaction.options.getBoolean('random');


                if (type == 'quote') {
                    if (isAll) {
                        try {
                            const quotes = fs.readFileSync(`./persistent/data/quotes/${server}.dat`, 'utf-8');
                            if (quotes) {
                                await interaction.editReply(quotes);
                            }
                            else {
                                await interaction.editReply('There are no saved quotes');
                            }
                        }
                        catch (error) {
                            logger.error('Something went wrong fetching quotes: ' + error);
                        }
                    }
                    else {
                        try {
                            const quotes = fs.readFileSync(`./persistent/data/quotes/${server}.dat`, 'utf-8');
                            if (quotes) {
                                const quotesList = quotes.split('\n');

                                await interaction.editReply(quotesList[Math.floor(Math.random() * (quotesList.length - 1))]);
                            }
                            else {
                                await interaction.editReply('There are no saved quotes');
                            }
                        }
                        catch (error) {
                            logger.error('Something went wrong fetching quotes: ' + error);
                        }
                    }
                }
                else {
                    await interaction.editReply(`This is not yet supported, you entered:\n-Type: ${type}`);
                }

            }
            else if (interaction.options.getSubcommand() === 'quote') {
                const quote = interaction.options.getString('quote');
                const author = interaction.options.getUser('author');

                await interaction.editReply(`"${quote}" - ${author}`);

                try {
                    fs.appendFileSync(`./persistent/data/quotes/${server}.dat`, `"${quote}" - ${author}\n`);
                }
                catch (error) {
                    logger.error('Something went wrong saving a quote' + error);
                }
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