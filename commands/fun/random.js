const { SlashCommandBuilder } = require('discord.js');

const fs = require('fs');
const Text = require('markov-chains-text').default;

const logger = require('../../logger.js');

const colorAPI = 'https://www.thecolorapi.com/id?hex=';

const sampleText = fs.readFileSync('./temp/babbler.txt', 'utf-8');
const babbleText = new Text(sampleText);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Generate random things')
        .addSubcommand(subcommand =>
            subcommand
                .setName('number')
                .setDescription('Get a random number')
                .addIntegerOption(option =>
                    option
                        .setName('min')
                        .setDescription('Minimum number')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('max')
                        .setDescription('Maximum number')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('string')
                .setDescription('Get a random string')
                .addIntegerOption(option =>
                    option
                        .setName('length')
                        .setDescription('Length of the string')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('color')
                .setDescription('Get a random color'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('coin')
                .setDescription('Do a coin flip'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dice')
                .setDescription('roll a dice')
                .addIntegerOption(option =>
                    option
                        .setName('sides')
                        .setDescription('Number of sides on the dice')
                        .addChoices(
                            // { name: '4', value: 4 },
                            { name: '6', value: 6 },
                            // { name: '8', value: 8 },
                            // { name: '10', value: 10 },
                            // { name: '12', value: 12 },
                            // { name: '20', value: 20 },
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('text')
                .setDescription('Generate a random text sentence')),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'number') {
            const min = interaction.options.getInteger('min');
            const max = interaction.options.getInteger('max');

            logger.verbose(`Running "random number" command, MAX: ${max}, MIN: ${min}`);

            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            await interaction.reply(`Random number between ${min} and ${max}: ${randomNumber}`);
        }
        else if (interaction.options.getSubcommand() === 'string') {
            logger.verbose('Running "random string" command');

            const length = interaction.options.getInteger('length');
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let randomString = '';

            for (let i = 0; i < length; i++) {
                randomString += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            await interaction.reply(`Random string of length ${length}:\n${randomString}`);
        }
        else if (interaction.options.getSubcommand() === 'color') {
            logger.verbose('Running "random color" command');

            const randomColor = Math.floor(Math.random() * 16777215).toString(16);
            await interaction.reply(`Random color:\n#${randomColor}`);

            try {
                const response = await fetch(`${colorAPI}${randomColor}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                await interaction.followUp('Name:' + data.name.value + '\nhttps://singlecolorimage.com/get/' + randomColor + '/400x400');
            }
            catch (error) {
                logger.error(error);
                await interaction.followUp({ content: 'There was an error while fetching the color image', ephemeral: true });
            }
        }
        else if (interaction.options.getSubcommand() === 'coin') {
            logger.verbose('Running "random coin" command');

            const rng = Math.round(Math.random());

            const result = rng == 0 ? 'https://tenor.com/view/coin-flip-coin-flip-heads-coin-flip-head-gif-27075791' : 'https://tenor.com/view/coin-flip-coin-flip-tails-coin-flip-tail-gif-27075788';

            await interaction.reply(result);
        }
        else if (interaction.options.getSubcommand() === 'dice') {
            let size = interaction.options.getInteger('sides');

            logger.verbose('Running "random dice" command with ' + size + ' sides');

            size = size ? size : 6;

            const landing = Math.floor(Math.random() * size);

            const sixDice = ['https://tenor.com/view/roll-1-gif-12835294614889799974',
                             'https://tenor.com/view/roll-2-gif-15043967336347227346',
                             'https://tenor.com/view/roll-3-gif-1564875996584374492',
                             'https://tenor.com/view/roll-4-gif-12215915903528391474',
                             'https://tenor.com/view/roll-5-gif-11576420221152969126',
                             'https://tenor.com/view/roll-6-gif-18297131842914939537'];

            if (size == 6) {
                await interaction.reply(sixDice[landing]);
            }
            else {
                await interaction.reply(landing.toString());
            }
        }
        else if (interaction.options.getSubcommand() === 'text') {
            logger.verbose('Running "random text" command');

            const sentence = babbleText.makeSentence();

            await interaction.reply('Here is a random sentence: ' + sentence);
        }
    },
};