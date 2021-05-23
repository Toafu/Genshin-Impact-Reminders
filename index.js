require('module-alias/register');

const Discord = require('discord.js');
const WOKCommands = require('wokcommands');
const client = new Discord.Client({
	partials: ['MESSAGE', 'REACTION'],
});

//const config = require('@root/config.json');
const firstMessage = require('./features/first-message');
const roleClaim = require('./role-claim');
//const command = require('./command');

client.on('ready', () => {
	console.log('It has awoken.');

	new WOKCommands(client, {
		commandsDir: 'commands',
		messagesPath: 'messages.json',

		dbOptions: {
			keepAlive: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
		},

		testServers: '345711221208514560',

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
		.setMongoPath('mongodb://localhost:27017/BlobBot');

	client.user.setPresence({
		activity: {
			name: 'Under maintenance',
			type: 0,
		},
	});

	const verificationembed = new Discord.MessageEmbed()
		.setTitle('Before you enter the server...')
		.setDescription('We need to make sure you\'re a person! Just hit that check mark below this message. It may take a short bit for the verification process to complete.')
		.setFooter('You got this!');

	firstMessage(client, '844208376828788771', verificationembed, ['<:check:844677239827726346>']);

	roleClaim(client);

});
client.login(process.env.DJS_TOKEN);
//client.login(config.token);