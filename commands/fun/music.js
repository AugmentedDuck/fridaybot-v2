// Should include the following:
// - Play a song from a URL
// - Search for a song by name
// - Pause the current song
// - Resume the current song
// - Skip to the next song in the queue
// - Stop the current song
// - Show the queue of songs
// - Clear the queue
// - Shuffle the queue

const { joinVoiceChannel, AudioPlayerStatus, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
// const fs = require('fs');

let currentSong = '';
const queue = [];

let voiceChannel;
let connection;

const player = createAudioPlayer();

// const regexYTLink = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
// const regexSpotifyLink = /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com\/track\/)([a-zA-Z0-9]{22})/g;


module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Control the music')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Start playing or add song to queue')
                .addStringOption(option =>
                    option
                        .setName('query')
                        .setDescription('Search fro a song or put URL')
                        .setRequired(true))
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('What channel to play in')
                        .addChannelTypes(ChannelType.GuildVoice)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('Pause or Resume'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Skip the current song'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stops current song and clears queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('Show the current queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear the queue'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('shuffle')
                .setDescription('Shuffle the queue')),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {

        if (interaction.options.getSubcommand() == 'play') {
            await interaction.deferReply();

            const query = interaction.options.getString('query');
            voiceChannel = interaction.options.getChannel('channel');

            if (!connection) {
                createConnection(interaction);
            }

            addSongToQueue(query);

            await interaction.editReply('Added Song to queue');
        }
        else if (interaction.options.getSubcommand() == 'toggle') {
            await interaction.deferReply();
        }
        else if (interaction.options.getSubcommand() == 'skip') {
            await interaction.reply('Skipping...');
        }
        else if (interaction.options.getSubcommand() == 'stop') {
            await interaction.reply('Stopping...');
            connection.destroy();
            queue.length = 0;
            currentSong = '';
        }
        else if (interaction.options.getSubcommand() == 'queue') {
            await interaction.deferReply();
        }
        else if (interaction.options.getSubcommand() == 'clear') {
            await interaction.reply('Clearing queue...');
        }
        else if (interaction.options.getSubcommand() == 'shuffle') {
            await interaction.reply('Shuffling...');
        }
    },
};

// ////////////////////////////////////
//
// Helping Functions
//
// ////////////////////////////////////

function addSongToQueue(query) {
    queue.push(query);

    if (queue.length == 1 && currentSong == '') {
        moveSongToCurrentAndPlay();
    }
}

async function moveSongToCurrentAndPlay() {
    currentSong = queue[0];
    queue.shift();

    downloadSong(currentSong);

    const resource = createAudioResource('D:\\Users\\ander\\Documents\\GitHub\\fridaybot-v2\\currentSong.mp3', { inputType: StreamType.Arbitrary });

    player.play(resource);

    connection.subscribe(player);

    console.log(resource);

}

async function downloadSong(query) {
    // Magic to get song
    return query;
}

function createConnection(interaction) {
    try {
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

    }
    catch (error) {
        console.error(error);
    }
}

player.on(AudioPlayerStatus.Idle, async () => {
    console.log('Switching Song');
    try {
        // fs.rmSync('./temp/currentSong.mp3');
    }
    catch (error) {
        console.error(error);
    }

    if (queue.length > 0) {
        moveSongToCurrentAndPlay();
    }
});