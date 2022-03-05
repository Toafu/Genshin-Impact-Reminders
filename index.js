require('module-alias/register');

const Discord = require('discord.js');
const WOKCommands = require('wokcommands');
const path = require('path');
const { Intents } = Discord;

const client = new Discord.Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
});

require('dotenv').config();

const firstMessage = require('./first-message');
const roleClaim = require('./role-claim');

client.on('ready', async () => {
	console.log('It has awoken.');

	new WOKCommands(client, {
		commandsDir: path.join(__dirname, 'commands'),
		messagesPath: path.join(__dirname, 'messages.json'),

		dbOptions: {
			keepAlive: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		},

		testServers: ['844003091934085140', '345711221208514560'],

		disabledDefaultCommands: [
			'language',
		],

	})
		.setCategorySettings([
			{
				name: 'Characters',
				emoji: '😶',
			},
			{
				name: 'Weapons',
				emoji: '⚔️',
			},
			{
				name: 'Agenda',
				emoji: '📅',
			},
			{
				name: 'Misc',
				emoji: '🟢',
			},
			{
				name: 'Development',
				emoji: '🖥️',
				hidden: true,
			},
		])
		.setDisplayName('Genshin Impact Reminders')
		.setDefaultPrefix('b!')
		.setColor('0x00ff97')
		.setBotOwner('269910487133716480')
		.setMongoPath(process.env.DJS_MONGO);

	client.user.setPresence({ activities: [{ name: 'b!help | b!tutorial' }], status: 'online' });

	console.log(`This bot is in ${client.guilds.cache.size} servers.`);

	const verificationembed = new Discord.MessageEmbed()
		.setTitle('Before you enter the server...')
		.setDescription('We need to make sure you\'re a person! Just hit that check mark below this message. It may take a short bit for the verification process to complete.')
		.setFooter({text: 'You got this!'});

	firstMessage(client, '844208376828788771', verificationembed, ['<:check:844677239827726346>']);

	roleClaim(client);

	process.on('unhandledRejection', error => {
		console.error('Unhandled promise rejection:', error);
	});

});
client.login(process.env.DJS_TOKEN);