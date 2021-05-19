require('module-alias/register');


const Discord = require('discord.js');
const client = new Discord.Client();

//const config = require('@root/config.json');
const loadCommands = require('./commands/load-commands');
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

	loadCommands(client);

	client.user.setPresence({
		activity: {
			name: 'b!help',
			type: 0,
		},
	});
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