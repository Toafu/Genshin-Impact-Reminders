module.exports = {
	category: 'Development',
	description: 'Wipe channel history.',
	aliases: 'cc',
	minArgs: 0,
	maxArgs: 0,
	callback: message => {
		message.channel.messages.fetch().then(results => {
			message.channel.bulkDelete(results);
		});
	},
};