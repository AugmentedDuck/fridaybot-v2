//                                           _           _ _____             _
//     /\                                   | |         | |  __ \           | |
//    /  \  _   _  __ _ _ __ ___   ___ _ __ | |_ ___  __| | |  | |_   _  ___| | __
//   / /\ \| | | |/ _` | '_ ` _ \ / _ \ '_ \| __/ _ \/ _` | |  | | | | |/ __| |/ /
//  / ____ \ |_| | (_| | | | | | |  __/ | | | ||  __/ (_| | |__| | |_| | (__|   <
// /_/    \_\__,_|\__, |_| |_| |_|\___|_| |_|\__\___|\__,_|_____/ \__,_|\___|_|\_\
//                 __/ |
//                |___/
//
// + - + - + - + - + - + - + - + - + - + - +
// | F | R | I | D | A | Y |   | B | O | T |
// + - + - + - + - + - + - + - + - + - + - +
//

const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./.secrets/config.json');

// ////////////////////////////////
// LOGIN TO DISCORD
// ////////////////////////////////
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

try {
    client.login(token);
}
catch (error) {
    console.error('Error logging in:', error);
}

// ////////////////////////////////
// COMMAND HANDLER
// ////////////////////////////////
client.commands = new Collection();

const folderPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(folderPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(folderPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// ////////////////////////////////
// EVENT HANDLER
// ////////////////////////////////
const eventPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}