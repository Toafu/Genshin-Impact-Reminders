const Discord = require('discord.js');
const mongo = require('@root/mongo');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const today = require('@helper/today');

module.exports = {
	commands: 'agenda',
	minArgs: 0,
	maxArgs: 0,
	callback: async message => {
		const day = today.todayIs();
		const time = today.timeIs();
		const hours = String(time.getHours()).padStart(2, '0');
		const minutes = String(time.getMinutes()).padStart(2, '0');

		const { author } = message;
		const { id } = author;
		const logo = 'https://media.discordapp.net/attachments/424627903876169729/838122787083649055/4936.png?width=720&height=405';

		const nonexistantembed = new Discord.MessageEmbed()
			.setTitle(`Welcome to your Genshin Impact agenda. Today is ${day}, ${hours}:${minutes} NA server time.\nStill out of resin? Oh well ¯\\_(ツ)_/¯`)
			.setThumbnail(logo)
			.setAuthor(message.author.username)
			.setFooter('Run b!agenda to see this window again.')
			.setColor('#00FF97')
			.addFields(
				{
					name: 'You aren\'t tracking any characters yet!',
					value: 'Run b!add [ID] to start tracking some characters!',
					inline: true,
				});

		const nothingtodayembed = new Discord.MessageEmbed()
			.setTitle(`Welcome to your Genshin Impact agenda. Today is ${day}, ${hours}:${minutes} NA server time.\nStill out of resin? Oh well ¯\\_(ツ)_/¯`)
			.setThumbnail(logo)
			.setAuthor(message.author.username)
			.setFooter('Run b!agenda to see this window again.')
			.setColor('#00FF97')
			.addFields(
				{
					name: 'None of your characters\' talent materials can be farmed today (or you aren\'t tracking any yet!).',
					value: 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>',
					inline: true,
				});

		await mongo().then(async mongoose => {
			try {
				const query = { _id: id };
				const result = await savedCharacterSchema.find(query);
				const todaysChars = [];

				if (result.length === 0) {
					message.channel.send(nonexistantembed);
				} else {
					for (let i = 0; i < result[0].savedCharacters.length; i++) {
						if(result[0].savedCharacters[i].days.includes(day)) {
							todaysChars.push(result[0].savedCharacters[i]);
						}
					}

					if (todaysChars.length === 0) {
						message.channel.send(nothingtodayembed);
						return;
					}
					todaysChars.sort((tal1, tal2) => (tal1.talent > tal2.talent) ? 1 : -1);

					const agenda = [];

					for (let i = 0; i < todaysChars.length; i++) {
						agenda.push(`•**${todaysChars[i].talent}** books for **${todaysChars[i].name}.**`);
					}
					const embed = new Discord.MessageEmbed()
						.setTitle(`Welcome to your Genshin Impact agenda. Today is ${day}, ${hours}:${minutes} NA server time.\nStill out of resin? Oh well ¯\\_(ツ)_/¯`)
						.setThumbnail(logo)
						.setAuthor(message.author.username)
						.setFooter('Run b!agenda to see this window again.')
						.setColor('#00FF97')
						.addFields(
							{
								name: 'Today you can farm...',
								value: agenda,
								inline: true,
							});
					message.channel.send(embed);
				}
			} finally {
				mongoose.connection.close();
			}
		});
	},
};