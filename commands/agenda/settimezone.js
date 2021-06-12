const Discord = require('discord.js');
const timezoneSchema = require('@schemas/timezone-schema');

module.exports = {
	name: 'settimezone',
	aliases: 'setserver',
	category: 'Agenda',
	description: 'Sets your Genshin server. Default NA.',
	minArgs: 1,
	maxArgs: 1,
	expectedArgs: '<NA/EU/ASIA>',
	callback: async ({ message, text }) => {
		const { author } = message;
		const { id } = author;

		let server = {};

		switch (text) {
		case 'NA':
			server = {
				name: 'NA',
				offset: -5,
			};
			break;
		case 'EU':
			server = {
				name: 'EU',
				offset: 1,
			};
			break;
		case 'ASIA':
			server = {
				name: 'ASIA',
				offset: 8,
			};
			break;
		default: message.channel.send('Please input a valid server. (`NA`, `EU`, or `ASIA`)');
			return;
		}

		await timezoneSchema.findOneAndUpdate({
			_id: id,
		}, {
			server: server,
		}, {
			upsert: true,
		});
		const embed = new Discord.MessageEmbed()
			.setTitle('Setting Timezone')
			.setDescription(`Your agenda will now be based on the ${server.name} server time.`);
		message.channel.send(embed);
	},
};