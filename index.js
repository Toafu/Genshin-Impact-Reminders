require('module-alias/register');

const path = require('path');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

//const config = require('@root/config.json');
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

	const baseFile = 'command-base.js';
	const commandBase = require(`./commands/${baseFile}`);

	const readCommands = dir => {
		const files = fs.readdirSync(path.join(__dirname, dir));
		for (const file of files) {
			const stat = fs.lstatSync(path.join(__dirname, dir, file));
			if (stat.isDirectory()) {
				readCommands(path.join(dir, file));
			} else if (file !== baseFile) {
				const option = require(path.join(__dirname, dir, file));
				commandBase(option);
			}
		}
	};

	readCommands('commands');

	commandBase.listen(client);

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