/* eslint-disable no-shadow-restricted-names */
const Discord = require('discord.js');
const mongo = require('@root/mongo');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getEmotes = require('@helper/getEmote');


module.exports = {
	commands: 'tracking',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '<Page Number>',
	callback: async (message, arguments) => {
		const { author } = message;
		const { id } = author;

		const emptyembed = new Discord.MessageEmbed()
			.setTitle(`${author.username}'s Tracking List`)
			.setColor('#00FF97')
			.addFields(
				{
					name: `${author.username}, this list is empty.`,
					value: 'You currently aren\'t tracking anyone. Add some characters with b!add <ID/Character>.',
					inline: true,
				});

		await mongo().then(async mongoose => {
			try {
				const result = await savedCharacterSchema.find({
					_id: id,
				});
				if (result.length > 0) {
					const dblist = result[0].savedCharacters;
					const trackList = [];
					let page;
					dblist.forEach(person => trackList.push(person));
					if (arguments.length === 0) {
						page = 1;
					} else {
						page = +arguments[0];
					}

					const list = [];
					const newlist = [];
					trackList.sort((char1, char2) => (char1.name > char2.name) ? 1 : -1);
					const maxPage = Math.ceil(trackList.length / 15);
					trackList.forEach(person => list.push(`[${person.id}] **${person.name}** ${getEmotes.getEmote(person.element)}`));

					for (let i = (page * 15) - 15; i < page * 15; i++) {
						newlist.push(list[i]);
					}
					if (list.length > 0 && page <= maxPage) {
						const embed = new Discord.MessageEmbed()
							.setTitle(`${author.username}'s Tracking List`)
							.setColor('#00FF97')
							.setFooter(`Page ${page} of ${maxPage}`)
							.addFields(
								{
									name: 'You are currently spending countless hours building:',
									value: newlist,
									inline: true,
								});
						message.channel.send(embed);
					} else if (page > maxPage) {
						const maxpageembed = new Discord.MessageEmbed()
							.setTitle(`${author.username}'s Tracking List`)
							.setColor('#00FF97')
							.addFields(
								{
									name: 'hol up',
									value: `You only have **${maxPage}** page(s) worth of tracked characters!`,
									inline: false,
								})
							.setFooter('>:(');
						message.channel.send(maxpageembed);
					} else {
						message.channel.send(emptyembed);
					}
				} else {
					message.channel.send(emptyembed);
				}
			} finally {
				mongoose.connection.close();
			}
		});
	},
};