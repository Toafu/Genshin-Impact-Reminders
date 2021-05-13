/* eslint-disable no-shadow-restricted-names */
module.exports = {
	commands: 'ping',
	minArgs: 0,
	maxArgs: 0,
	callback: (message, arguments, text, client) => {
		message.reply('Calculating ping...').then(resultMessage => {
			const ping = resultMessage.createdTimestamp - message.createdTimestamp;

			resultMessage.edit(`Bot latency: ${ping}ms, API Latency: ${client.ws.ping}ms
			`);
		});
	},
};