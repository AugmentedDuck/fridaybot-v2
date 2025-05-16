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

const { joinVoiceChannel, AudioPlayerStatus, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

const youtubedl = require('youtube-dl-exec');
// Implement search later
// const yts = require('yt-search');

let currentSong = '';
const queue = [];

let voiceChannel;
let connection;

const player = createAudioPlayer();

const regexYTLink = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
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

            queue.push(query);

            if (queue.length == 1) {
                moveSongToCurrent();
                playSong();

                interaction.editReply('Playing song');
            }
            else {
                interaction.editReply('Added song to queue');
            }
        }
        else if (interaction.options.getSubcommand() == 'toggle') {
            await interaction.deferReply();

            if (player.state.status() == AudioPlayerStatus.Playing) {
                player.pause();
            }
            else if (player.state.status() == AudioPlayerStatus.Paused) {
                player.unpause();
            }
        }
        else if (interaction.options.getSubcommand() == 'skip') {

            if (currentSong) {
                await interaction.reply('Skipped Song');

                currentSong = '';
                player.stop();
            }
            else {
                await interaction.reply('No song is playing');
            }
        }
        else if (interaction.options.getSubcommand() == 'stop') {
            player.stop();
            connection.destroy();
            queue.length = 0;
            currentSong = '';
            await interaction.reply('Stop playing music');
        }
        else if (interaction.options.getSubcommand() == 'queue') {
            await interaction.deferReply();

            if (queue.length == 0) {
                await interaction.editReply('No songs in queue');
                return;
            }

            let queueString = '';

            for (const song of queue) {
                queueString += `- ${song}`;
            }

            await interaction.editReply('The current queue is:\n' + queueString);

        }
        else if (interaction.options.getSubcommand() == 'clear') {
            queue.length = 0;

            await interaction.reply('Queue Cleared');
        }
        else if (interaction.options.getSubcommand() == 'shuffle') {
            await interaction.reply('Shuffling...');

            for (let i = queue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [queue[i], queue[j]] = [queue[j], queue[i]];
            }

            await interaction.editReply('Suffled the queue');
        }
    },
};

// ////////////////////////////////////
//
// Helping Functions
//
// ////////////////////////////////////

function moveSongToCurrent() {
    currentSong = queue[0];
    queue.shift();
}

async function playSong() {
    const path = await downloadSong();

    if (!path) { console.warn('[WARNING] NO PATH'); }

    const resource = createAudioResource(path);

    connection.subscribe(player);
    player.play(resource);
}

async function downloadSong() {
    if (currentSong.match(regexYTLink)) {
        try {
            await youtubedl(currentSong, {
                paths: './temp',
                output: 'currentSong',
                extractAudio: true,
                audioFormat: 'opus',
                forceOverwrites: true,
            });

            return './temp/currentSong.opus';
        }
        catch (error) {
            console.error(error);
        }
    }
    else {
        console.warn('[WARN] Format not expected');
    }
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
    if (queue.length > 0) {
        moveSongToCurrent();
        playSong();
    }
    else if (queue.length == 0) {
        currentSong = '';
    }
});