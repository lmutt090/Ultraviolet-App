import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages]
});

// Slash command registration
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (slash) commands.');

        await rest.put(
            Routes.applicationCommands('YOUR_CLIENT_ID'), // Replace YOUR_CLIENT_ID with your bot's Client ID
            { body: [
                {
                    name: 'startproxy',
                    description: 'Starts npm and sets up LocalTunnel',
                },
            ] }
        );

        console.log('Successfully reloaded application (slash) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // DM the specific user when the bot is running
    const userId = '1286383453016686705';
    client.users.fetch(userId)
        .then(user => {
            user.send('The bot is now running!');
            console.log(`Sent DM to user: ${user.username}`);
        })
        .catch(err => {
            console.error(`Failed to fetch user or send DM: ${err.message}`);
        });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'startproxy') {
        await interaction.reply('Starting proxy...');

        // Run `npm start`
        exec('npm start', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error starting npm: ${err.message}`);
                interaction.followUp(`Error starting npm: ${err.message}`);
                return;
            }
            console.log(`npm start output: ${stdout}`);
            interaction.followUp(`npm start output: ${stdout}`);
        });

        // Run `lt --port 8080 --subdomain lmutt090prox`
        exec('lt --port 8080 --subdomain lmutt090prox', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error starting localtunnel: ${err.message}`);
                interaction.followUp(`Error starting localtunnel: ${err.message}`);
                return;
            }
            console.log(`lt output: ${stdout}`);
            interaction.followUp(`lt output: ${stdout}`);
        });
    }
});

client.on('messageCreate', (message) => {
    if (message.content === '$startproxy') {
        if (message.author.bot) return;

        message.reply('Starting proxy...');

        // Run `npm start`
        exec('npm start', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error starting npm: ${err.message}`);
                message.reply(`Error starting npm: ${err.message}`);
                return;
            }
            console.log(`npm start output: ${stdout}`);
            message.reply(`npm start output: ${stdout}`);
        });

        // Run `lt --port 8080 --subdomain lmutt090prox`
        exec('lt --port 8080 --subdomain lmutt090prox', (err, stdout, stderr) => {
            if (err) {
                console.error(`Error starting localtunnel: ${err.message}`);
                message.reply(`Error starting localtunnel: ${err.message}`);
                return;
            }
            console.log(`lt output: ${stdout}`);
            message.reply(`lt output: ${stdout}`);
        });
    }
});

client.login(process.env.BOT_TOKEN);
