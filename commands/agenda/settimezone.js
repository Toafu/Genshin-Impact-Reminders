const Discord = require('discord.js');
const timezoneSchema = require('@schemas/timezone-schema');

module.exports = {
	slash: 'both',
	name: 'settimezone',
	aliases: 'setserver',
	category: 'Agenda',
	description: 'Sets your Genshin server. Default NA.',
	minArgs: 1,
	maxArgs: 1,
	expectedArgs: '<na or eu or asia>',
	testOnly: true,
	callback: async ({ message, text, interaction: msgInt }) => {
		let id;
		if (message) {
			id = message.author.id;
		} else {
			id = msgInt.user.id;
		}

		let server = {};

		switch (text) {
			case 'NA':
			case 'na':
				server = {
					name: 'NA',
					offset: -5,
				};
				break;
			case 'EU':
			case 'eu':
				server = {
					name: 'EU',
					offset: 1,
				};
				break;
			case 'ASIA':
			case 'asia':
				server = {
					name: 'ASIA',
					offset: 8,
				};
				break;
			default:
				if (message) {
					message.channel.send('Please input a valid server. (`NA`, `EU`, or `ASIA`)');
				} else {
					msgInt.reply('Please input a valid server. (`NA`, `EU`, or `ASIA`)');
				}
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
		if (message) {
			message.channel.send({ embeds: [embed] });
		} else {
			msgInt.reply({ embeds: [embed] });
		}
		return;
	},
};