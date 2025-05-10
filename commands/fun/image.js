// MISSING: AI generated image

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const gis = require('async-g-i-s');
const fs = require('fs');

const waifuAPI = 'https://api.waifu.im/search';

// This requires stable-diffusion to be running and the API to be set up; (LOCALHOST)
const stableDiffusionAPI = 'http://127.0.0.1:7860/sdapi/v1/txt2img';

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
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('width')
                        .setDescription('The width of the image')
                        .setMinValue(512)
                        .setMaxValue(1024)
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('height')
                        .setDescription('The height of the image')
                        .setMinValue(512)
                        .setMaxValue(1024)
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('steps')
                        .setDescription('The number of steps to generate the image')
                        .setMinValue(1)
                        .setMaxValue(50)
                        .setRequired(true))
                .addBooleanOption(option =>
                    option
                        .setName('anime')
                        .setDescription('Is this an anime image?')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('negative-prompt')
                        .setDescription('The negative prompt to generate the image'))
                .addIntegerOption(option =>
                    option
                        .setName('seed')
                        .setDescription('The seed to generate the image')
                        .setMinValue(1)
                        .setMaxValue(1000000000))
                .addIntegerOption(option =>
                    option
                        .setName('cfg-scale')
                        .setDescription('The CFG scale to generate the image')
                        .setMinValue(1)
                        .setMaxValue(30)))
        // This connects to https://api.waifu.im/
        .addSubcommand(subcommand =>
            subcommand
                .setName('waifu')
                .setDescription('Get an image of a waifu')
                .addStringOption(option =>
                    option
                        .setName('tag')
                        .setDescription('The tag to search for')
                        .addChoices(
                            { name: 'Maid', value: 'maid' },
                            { name: 'Waifu', value: 'waifu' },
                            { name: 'Marin Kitagawa', value: 'marin-kitagawa' },
                            { name: 'Mori Calliope', value: 'mori-calliope' },
                            { name: 'Raiden Shogun', value: 'raiden-shogun' },
                            { name: 'Oppai', value: 'oppai' },
                            { name: 'Selfie', value: 'selfies' },
                            { name: 'Uniform', value: 'uniform' },
                            { name: 'Kamisato Ayaka', value: 'kamisato-ayaka' },
                        ))
                .addBooleanOption(option =>
                    option
                        .setName('private')
                        .setDescription('Whether only you can see the image')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nsfw-waifu')
                .setDescription('Get a NSFW image from the waifu API')
                .addStringOption(option =>
                    option
                    .setName('tag')
                    .setDescription('The tag to search for')
                        .addChoices(
                            { name: 'Ass', value: 'ass' },
                            { name: 'Hentai', value: 'hentai' },
                            { name: 'MILF', value: 'milf' },
                            { name: 'Oral', value: 'oral' },
                            { name: 'Titty fuck', value: 'paizuri' },
                            { name: 'Softcore', value: 'ecchi' },
                            { name: 'Erotic', value: 'ero' },
                        ))
                .addBooleanOption(option =>
                    option
                        .setName('private')
                        .setDescription('Whether only you can see the image'))),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        // ////////////////////////////
        //
        // SEARCH
        //
        // ////////////////////////////
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
        // ////////////////////////////
        //
        // WAIFU
        //
        // ////////////////////////////
        else if (interaction.options.getSubcommand() === 'waifu') {
            const tag = interaction.options.getString('tag');
            const isPrivate = interaction.options.getBoolean('private');

            if (isPrivate) {
                await interaction.deferReply({ ephemeral: true });
            }
            else {
                await interaction.deferReply();
            }

            await interaction.editReply(await getWaifuImage(tag, false));
        }
        // ////////////////////////////
        //
        // NSFW WAIFU
        //
        // ////////////////////////////
        else if (interaction.options.getSubcommand() === 'nsfw-waifu') {
            const tag = interaction.options.getString('tag');
            const isPrivate = interaction.options.getBoolean('private');

            if (!interaction.channel.nsfw) {
                await interaction.reply('This command can only be used in NSFW channels.');
                return;
            }

            if (isPrivate) {
                await interaction.deferReply({ ephemeral: true });
            }
            else {
                await interaction.deferReply();
            }

            await interaction.editReply(await getWaifuImage(tag, true));
        }
        // ////////////////////////////
        //
        // AI
        //
        // ////////////////////////////
        else if (interaction.options.getSubcommand() === 'ai') {
            const prompt = interaction.options.getString('prompt');
            const width = interaction.options.getInteger('width');
            const height = interaction.options.getInteger('height');
            const steps = interaction.options.getInteger('steps');
            const isAnime = interaction.options.getBoolean('anime');
            let seed = interaction.options.getInteger('seed');
            let cfgScale = interaction.options.getInteger('cfg-scale');
            let negativePrompt = interaction.options.getString('negative-prompt');

            seed = seed ? seed : -1;
            cfgScale = cfgScale ? cfgScale : 7;
            negativePrompt = negativePrompt ? negativePrompt : '';

            if (interaction.channel.nsfw) {
                negativePrompt += ', nsfw, pussy, naked, nude, nipples';
            }

            const model = isAnime ? 'ponyDiffusionV6XL_v6StartWithThisOne' : 'epicphotogasm_ultimateFidelity';

            await interaction.deferReply();

            const payload = {
                'prompt': prompt,
                'negative_prompt': negativePrompt,
                'width': width,
                'height': height,
                'steps': steps,
                'seed': seed,
                'cfg_scale': cfgScale,
                'override_settings': {
                    'sd_model_checkpoint': model,
                },
            };

            try {
                const response = await fetch(stableDiffusionAPI, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                const imageData = data.images[0];

                fs.writeFile('./temp/image.png', imageData, 'base64', (err) => {
                    if (err) {
                        throw err;
                    }
                });

                const attachment = new AttachmentBuilder('./temp/image.png', { name: 'image.png' });
                await interaction.editReply({ content: 'Here is your image:', files: [attachment] });
            }
            catch (error) {
                console.error('Error fetching image:', error);
                await interaction.editReply('Error fetching image');
            }
        }
        else {
            await interaction.reply('This command is not implemented yet.');
        }
    },
};

// ////////////////////////////////////
//
// Helper functions
//
// ////////////////////////////////////
async function getWaifuImage(tag, isNSFW) {
    let params = {};

    if (!tag) {
        params = {
            is_nsfw: isNSFW,
        };
    }
    else {
        params = {
            included_tags: tag,
            is_nsfw: isNSFW,
        };
    }

    const queryParams = new URLSearchParams();

    for (const key in params) {
        if (Array.isArray(params[key])) {
            queryParams[key].forEach(value => {
                queryParams.append(key, value);
            });
        }
        else {
            queryParams.set(key, params[key]);
        }
    }

    const requestURL = `${waifuAPI}?${queryParams.toString()}`;

    try {
        const response = await fetch(requestURL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        else {
            const data = await response.json();

            return data.images[0].url;
        }
    }
    catch (error) {
        console.error('Error fetching image:', error);
        return 'Error fetching image';
    }
}