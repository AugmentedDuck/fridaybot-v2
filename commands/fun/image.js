const { SlashCommandBuilder } = require('discord.js');

const gis = require('async-g-i-s');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('get an image')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for an image')
                .addStringOption(option =>
                    option
                        .setName('query')
                        .setDescription('The query to search for')
                        .setRequired(true)))
        // This requires stable-diffusion to be running and the API to be set up
        .addSubcommand(subcommand =>
            subcommand
                .setName('ai')
                .setDescription('Get an AI generated image')
                .addStringOption(option =>
                    option
                        .setName('prompt')
                        .setDescription('The prompt to generate the image')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('waifu')
                .setDescription('Get an image of a waifu')


// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
       if (interaction.options.getSubcommand() === 'search') {
           await interaction.deferReply();
            const query = interaction.options.getString('query');
            images = await (async () => {
                try {
                    const images = await gis(query);
                    return images;
                }
                catch (error) {
                    console.error('Error fetching image:', error);
                }
            })();

            if (images.length > 0) {
                const image = images[Math.floor(Math.random() * images.length)];
                await interaction.editReply(image.url);
            }
            else {
                await interaction.editReply('No images found for the query: ' + query);
            }
        }
        else {
            await interaction.reply('This command is not implemented yet.');
        }
    },
};