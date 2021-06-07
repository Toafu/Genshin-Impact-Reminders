module.exports = {
	slash: 'both',
	name: 'tutorial',
	category: 'Misc',
	description: 'Shows an example of how the bot works.',
	maxArgs: 0,
	callback: ({ message }) => {
		const msg = 'A detailed example can be found in the README of this GitHub repository: https://github.com/ToafdaLoaf/Genshin-Impact-Reminders/blob/stable/README.md';
		if (message) {
			message.channel.send(msg);
		}
		return msg;
	},
};