// Should include the following:
// - Play a song from a URL
//   - Spotify - Track, Album, Playlist
//   - YouTube - Playlist
//   - SoundCloud

const { joinVoiceChannel, AudioPlayerStatus, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { clientId, clientSecret } = require('../../.secrets/credentials.json');
const fs = require('node:fs/promises');
const path = require('node:path');

const youtubedl = require('youtube-dl-exec');
const yts = require('yt-search');

const TOKEN_FILE = path.resolve('./temp/spotify_token.json');

let currentSong = '';
const queue = [];

let voiceChannel;
let connection;

const player = createAudioPlayer();

const regexYTLink = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
const regexYTPlaylistLink = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:\?|watch\?v=))([a-zA-Z0-9_-]+)(&list=)([a-zA-Z0-9_-]+)/g;

const regexSoundCloudLink = /(?:https?:\/\/)?(?:www\.)?(?:soundcloud\.com\/)([a-zA-Z0-9_-]+)/g;

const regexSpotifyTrackLink = /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com\/track\/)([a-zA-Z0-9]{22})/g;
const regexSpotifyAlbumLink = /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com\/album\/)([a-zA-Z0-9]{22})/g;
const regexSpotifyPlaylistLink = /(?:https?:\/\/)?(?:www\.)?(?:open\.spotify\.com\/playlist\/)([a-zA-Z0-9]{22})/g;

let spotifyAccessToken;

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
        spotifyAccessToken = await getValidSpotifyToken();

        if (interaction.options.getSubcommand() == 'play') {
            await interaction.deferReply();

            const query = interaction.options.getString('query');
            voiceChannel = interaction.options.getChannel('channel');

            if (!connection) {
                createConnection(interaction);
            }

            await addSongToQueue(query);

            if (queue.length == 1 && !currentSong) {
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

async function addSongToQueue(query) {
    if (query.match(regexYTPlaylistLink)) {
        console.log('[INFO] Adding a YouTube playlist to queue');
        try {
            const playlist = await yts({ listId: query.slice(query.length - 34) });

            playlist.videos.forEach(video => {
                queue.push('https://youtube.com/watch?v=' + video.videoId);
            });

            if (queue.length == playlist.videos.length && !currentSong) {
                moveSongToCurrent();
                playSong();
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    else if (currentSong.match(regexSpotifyAlbumLink)) {
        console.log('NOT IMPLEMENTED YET');
    }
    else if (currentSong.match(regexSpotifyPlaylistLink)) {
        console.log('NOT IMPLEMENTED YET');
    }
    else {
        queue.push(query);
    }
}

function moveSongToCurrent() {
    currentSong = queue[0];
    queue.shift();
}

async function playSong() {
    const pathToSong = await downloadSong();

    if (!pathToSong) { console.warn('[WARNING] NO PATH'); }

    const resource = createAudioResource(pathToSong);

    connection.subscribe(player);
    player.play(resource);
}

async function downloadSong() {
    if (currentSong.match(regexYTLink)) {
        console.log('[INFO] Downloading song from YT Link');
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
            console.error('[ERROR] YouTube download failed: ' + error);
        }
    }
    else if (currentSong.match(regexSoundCloudLink)) {
        console.log('[INFO] Downloading from SoundCloud Link');
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
            console.error('[ERROR] SoundCloud download failed: ' + error);
        }
    }
    else if (currentSong.match(regexSpotifyTrackLink)) {
        console.log('[INFO] Downloading song from Spotify Track Link');
        try {
            const response = await fetch(`https://api.spotify.com/v1/tracks/${currentSong.slice(currentSong.length - 42, currentSong.length - 20)}`, {
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`,
                },
            });

            const data = await response.json();

            const artist = data.artists[0].name;
            const title = data.name;

            currentSong = `${artist} - ${title}`;

            return await downloadSong();
        }
        catch (error) {
            console.error('[ERROR] ' + error);
        }
    }
    else {
        console.log('[INFO] Searching song by name');
        try {
            const result = await yts(currentSong);
            const video = result.videos[0];

            currentSong = video.url;

            return await downloadSong();

        }
        catch (error) {
            console.error('[ERROR] ' + error);
        }
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
        console.error('[ERROR] ' + error);
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

async function getSpotifyToken() {

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'client_id': clientId,
            'client_secret': clientSecret,
        }),
    });

    if (!response.ok) {
        console.error('[ERROR] Failed to fetch Spotify token:', response.statusText);
        return;
    }

    const data = await response.json();
    data.timestamp = Date.now();
    await fs.writeFile(TOKEN_FILE, JSON.stringify(data, null, 2), 'utf8');
    return data.access_token;
}

async function getValidSpotifyToken() {
    try {
        const tokenData = JSON.parse(await fs.readFile(TOKEN_FILE, 'utf8'));
        const tokenAge = Date.now() - tokenData.timestamp;

        if (tokenAge > 3600 * 1000) {
            return await getSpotifyToken();
        }

        return tokenData.access_token;
    }
    catch (error) {
        console.error('[ERROR] Error reading Spotify token:', error);
        return await getSpotifyToken();
    }
}
