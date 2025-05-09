const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./.secrets/config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

try {
    client.login(token);
} catch (error) {
    console.error('Error logging in:', error);
}
