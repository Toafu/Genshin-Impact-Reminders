module.exports = {
	name: 'bruh',
	category: 'Misc',
	description: 'bruh moment',
	minArgs: 0,
	maxArgs: 0,
	callback: ({ message }) => {
		message.channel.send('This is a certified bruh moment™');
	},

};
