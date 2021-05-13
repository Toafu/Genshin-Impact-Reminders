module.exports = {
	commands:['cc', 'clearchannel'],
	minArgs: 0,
	maxArgs: 0,
	permissions: ['ADMINISTRATOR'],
	permissionError: 'You do not have permissions to run this command',
	callback: message => {
		message.channel.messages.fetch().then(results => {
			message.channel.bulkDelete(results);
		});
	},
};