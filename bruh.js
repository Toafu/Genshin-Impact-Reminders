module.exports = {
	commands: 'bruh', //Can include all aliases of a command
	minArgs: 0,
	maxArgs: 0,
	callback: message => {
		message.channel.send('This is a certified bruh moment™');
	},
};