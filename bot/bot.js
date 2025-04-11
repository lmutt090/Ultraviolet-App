import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages]
});

const allowedUsers = ['USER_ID_1', 'USER_ID_2']; // Add allowed user IDs here

// Slash command registration
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (slash) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            {
                body: [
                    {
                        name: 'startproxy',
                        description: 'Starts npm and sets up LocalTunnel',
                    },
                ]
            }
        );

        console.log('Successfully reloaded application (slash) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const userId = process.env.USER_ID;
    client.users.fetch(userId)
        .then(user => {
            user.send('The bot is now running!');
            console.log(`Sent DM to user: ${user.username}`);
        })
        .catch(err => {
            console.error(`Failed to fetch user or send DM: ${err.message}`);
        });
});

async function sendOutputToAllowedUsers(message) {
    for (const userId of allowedUsers) {
        try {
            const user = await client.users.fetch(userId);
            await user.send(message);
        } catch (err) {
            console.error(`Failed to send DM to ${userId}: ${err.message}`);
        }
    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!allowedUsers.includes(interaction.user.id)) return;

    const { commandName } = interaction;

    if (commandName === 'startproxy') {
        await interaction.reply('Starting proxy...');

        exec('npm start', async (err, stdout, stderr) => {
            const output = err ? `Error starting npm: ${err.message}` : `npm start output: ${stdout}`;
            console.log(output);
            await interaction.followUp(output);
            await sendOutputToAllowedUsers(output, interaction.guildId);
        });

        exec('lt --port 8080', async (err, stdout, stderr) => {
            const output = err ? `Error starting localtunnel: ${err.message}` : `lt output: ${stdout}`;
            console.log(output);
            await interaction.followUp(output);
            await sendOutputToAllowedUsers(output, interaction.guildId);
        });

        exec('curl https://loca.lt/mytunnelpassword', async (err, stdout, stderr) => {
            const output = err ? `Error fetching URL: ${err.message}` : `URL output: ${stdout}`;
            await interaction.followUp(output);
            await sendOutputToAllowedUsers(output, interaction.guildId);
        });
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!allowedUsers.includes(message.author.id)) return;

    if (message.content === '$startproxy') {
        message.reply('Starting proxy...');

        exec('npm start', async (err, stdout, stderr) => {
            const output = err ? `Error starting npm: ${err.message}` : `npm start output: ${stdout}`;
            console.log(output);
            message.reply(output);
            await sendOutputToAllowedUsers(output, message.guild?.id);
        });

        exec('lt --port 8080', async (err, stdout, stderr) => {
            const output = err ? `Error starting localtunnel: ${err.message}` : `lt output: ${stdout}`;
            console.log(output);
            message.reply(output);
            await sendOutputToAllowedUsers(output, message.guild?.id);
        });
        exec('curl https://loca.lt/mytunnelpassword', async (err, stdout, stderr) => {
            const output = err ? `Error fetching URL: ${err.message}` : `URL output: ${stdout}`;
            message.reply(output);
            await sendOutputToAllowedUsers(output, interaction.guildId);
        });
    }
});

client.login(process.env.BOT_TOKEN);
