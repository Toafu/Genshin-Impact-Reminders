//const command = require('./command');
const Discord = require('discord.js');
const client = new Discord.Client();

module.exports = {
	commands: 'status',
	expectedArgs: '<message>',
	permissions: 'ADMINISTRATOR',
	permissionError: 'You do not have permissions to run this command',
	minArgs: 1,
	maxArgs: 10,
	callback: (message) => {
		const text = message.content.replace('b!status ', '').toLowerCase();
		client.user.setPresence({
			activity: {
				name: text,
				type: 0,
			},
		});
	},
};