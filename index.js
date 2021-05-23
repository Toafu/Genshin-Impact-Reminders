require('module-alias/register');

const Discord = require('discord.js');
const client = new Discord.Client();

//const config = require('@root/config.json');
const firstMessage = require('./first-message');
const roleClaim = require('./role-claim');
const loadCommands = require('./commands/load-commands');
const commandBase = require('./commands/command-base');
const command = require('./command');
const mongo = require('./mongo');

client.on('ready', async () => {
	console.log('It has awoken.');

	await mongo().then(mongoose => { //Connect to MongoDB
		try {
			//Try some code
			console.log('Connected to mongo!');
		} finally {
			//Will always run
			mongoose.connection.close();
		}
	});
	commandBase.loadPrefixes(client);
	loadCommands(client);

	client.user.setPresence({
		activity: {
			name: 'b!help',
			type: 0,
		},
	});

	const verificationembed = new Discord.MessageEmbed()
		.setTitle('Before you enter the server...')
		.setDescription('We need to make sure you\'re a person! Just hit that check mark below this message. It may take a short bit for the verification process to complete.')
		.setFooter('You got this!');

	firstMessage(client, '844208376828788771', verificationembed, ['<:check:844677239827726346>']);

	roleClaim(client);

	command(client, 'status', message => {
		if(message.member.hasPermission('ADMINISTRATOR')) {
			const content = message.content.replace('b!status ', '');
			client.user.setPresence({
				activity: {
					name: content,
					type: 0,
				},
			});
		}
	});
});
client.login(process.env.DJS_TOKEN);
//client.login(config.token);