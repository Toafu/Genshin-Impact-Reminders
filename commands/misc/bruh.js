module.exports = {
	slash: 'both',
	name: 'bruh',
	category: 'Misc',
	maxArgs: 0,
	description: 'bruh moment',
	callback: ({ message }) => {
		if (message) {
			message.channel.send('This is a certified bruh moment™');
		}
		return 'This is a certified bruh moment™';
	},
};
