/* eslint-disable no-shadow-restricted-names */
//YOU NEED PAGE NUMBERS
//ADD NUMBER OF CHARACTERS BEING TRACKED
const Discord = require('discord.js');
const mongo = require('@root/mongo');
const savedCharacterSchema = require('../schemas/savedcharacter-schema');
const getEmotes = require('@helper/getEmote');


module.exports = {
	commands: ['list', 'tracking'],
	callback: async message => {
		const { author } = message;
		const { id } = author;

		const emptyembed = new Discord.MessageEmbed()
			.setTitle('Tracking List')
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
					dblist.forEach(person => trackList.push(person));
					trackList.sort((char1, char2) => (char1.name > char2.name) ? 1 : -1);
					const list = [];
					trackList.forEach(person => list.push(`[${person.id}] ${person.name} ${getEmotes.getEmote(person.element)}`));
					if (list.length > 0) {
						const embed = new Discord.MessageEmbed()
							.setTitle('Tracking List')
							.setColor('#00FF97')
							.addFields(
								{
									name: `${author.username}, you are currently spending countless hours building:`,
									value: list,
									inline: true,
								});
						message.channel.send(embed);
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