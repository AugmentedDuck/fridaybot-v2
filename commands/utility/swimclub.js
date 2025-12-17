const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');

const logger = require('../../logger.js');

const { swimPlace, swimTime } = require('../../.secrets/swimming.json');
const { lat, lon } = require('../../.secrets/openweather.json');

const todayTotal = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
const weatherFile = `./temp/${todayTotal}.txt`;

const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation,cloud_cover,wind_speed_10m,wind_gusts_10m&forecast_days=3`;
const WATER_URL = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,sea_level_height_msl,sea_surface_temperature&forecast_days=3`;
const OLLAMA_URL = 'http://localhost:11434/api/generate';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('swimclub')
        .setDescription('Send a message that we are swimming tomorrow'),

// ////////////////////////////////////
//
// Execute function
//
// ////////////////////////////////////
    async execute(interaction) {
        logger.verbose('Running "swimclub" command');

        await interaction.deferReply();

        const today = new Date().getDay();

        if (today != 1) {
            await interaction.editReply('https://tenor.com/view/no-no-no-not-today-nah-nope-no-way-gif-16392985');
            return;
        }

        let report;

        try {
            report = await GetWeather();
        }
        catch (error) {
            report = 'weather unavailable';
            logger.error('Something went wrong getting weather:', error);
        }

        const random = getRandomNumber(4);

        // const random = 3;

        let prompt = '';
        switch (random) {
            case 0:
                prompt = `Sound like yu really don't want to do it. We are swimming tomorrow at ${swimPlace} at ${swimTime}.\n${report}\nDon't just list the weather forecast. Sound very Emo. Use unicode emojies`;
                break;
            case 1:
                prompt = `Make it sound like a mission impossible mission. We are swimming tomorrow at ${swimPlace} at ${swimTime}.\n${report}\nDon't just list the weather forecast. Be way to serious. Make sure to give the consequences if the mission fails`;
                break;
            case 2:
                prompt = `You are a pirate captain. Make an annoucement to your crew that we are swimming tomorrow at ${swimPlace} at ${swimTime}.\n${report}\nDon't just list the weather forecast. Use unicode emojies. Talk over the top like a pirate`;
                break;
            case 3:
                prompt = `You are a military drill sergeant. Make an annoucement to useless privates that we are swimming tomorrow at ${swimPlace} at ${swimTime}.\n${report}\nDon't just list the weather forecast. Be very agressive and make up an over the top punishment for not showing up`;
                break;
            default:
                prompt = `Use a lot of unicode emojies. Generate a message for a group that we are swimming tomorrow at ${swimPlace} (the sea) at ${swimTime}.\n${report}\nDon't just list the weather forecast.\nMake sure to make its over the top brainrot. Make it theatening and hint that there will be consequences if you dont show up, make up a over the top consequence that is not swimming related.`;
                break;
        }

        try {
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3.2',
                    prompt: prompt,
                    stream: false,
                }),
            });

            const data = await response.json();

            await interaction.editReply(data.response);
        }
        catch (error) {
            logger.error('Something went wrong getting response from ollama:', error);
            await interaction.editReply('Something went wrong getting a response\nSwimming Tomorrow at ' + swimPlace + ' at ' + swimTime + '\n' + report);
        }
    },
};


async function GetWeather() {
    if (DoesDataExist()) {
        try {
            logger.debug('Read weather data from file');
            const report = fs.readFileSync(weatherFile, 'utf-8');
            return report;
        }
        catch (error) {
            logger.error('File failed to parse:', error);
        }
    }

    let totalReport;
    try {
        const weatherResponse = await fetch(WEATHER_URL);

        const weatherData = await weatherResponse.json();
        const hourly = weatherData.hourly;

        const weatherReport = `Weather:\nTemperature: ${hourly.temperature_2m[33]}C\nApparent Temperature: ${hourly.apparent_temperature[33]}C\nPrecipitation: ${hourly.precipitation[33]}mm\nCloud Cover: ${hourly.cloud_cover[33]}%\nWind Speed: ${hourly.wind_speed_10m[33]}km/h with gusts up to ${hourly.wind_gusts_10m[33]}km/h`;

        const waterResponse = await fetch(WATER_URL);

        const waterData = await waterResponse.json();
        const waterHourly = waterData.hourly;

        const waterReport = `Water:\nWave Height: ${waterHourly.wave_height[33]}m\nSea Level: ${waterHourly.sea_level_height_msl[33]}m\nWater Temperature (Surface): ${waterHourly.sea_surface_temperature[33]}`;

        totalReport = weatherReport + '\n' + waterReport;
    }
    catch (error) {
        logger.error('Couldnt get weather report', error);
        return 'Weather Unavailable';
    }

    try {
        fs.writeFileSync(weatherFile, totalReport, 'utf-8');
    }
    catch (error) {
        logger.warn('Something went wrong saving weather data:', error);
    }

    return totalReport;
}

function DoesDataExist() {
    return fs.existsSync(weatherFile);
}

function getRandomNumber(max) {
    return Math.floor(Math.random() * (max + 1));
}