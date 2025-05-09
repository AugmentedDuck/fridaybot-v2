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

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./.secrets/config.json');

//////////////////////////////////
// LOGIN TO DISCORD
//////////////////////////////////
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

try {
    client.login(token);
} catch (error) {
    console.error('Error logging in:', error);
}

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

//////////////////////////////////
// COMMAND HANDLER
//////////////////////////////////
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
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error)
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});