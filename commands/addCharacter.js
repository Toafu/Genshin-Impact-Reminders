/* eslint-disable no-shadow-restricted-names */
const mongo = require('@root/mongo');
const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	commands: ['add', 'track'],
	minArgs: 1,
	maxArgs: 2,
	expectedArgs: '<ID/Character Name>',
	callback: async (message) => {
		const { author } = message;
		const { id } = author;
		let query;
		let index;
		if (message.content.startsWith('b!add ')) {
			query = message.content.replace('b!add ', '').toLowerCase();
		} else if (message.content.startsWith('b!track ')) {
			query = message.content.replace('b!track ', '').toLowerCase();
		}

		if (query === 'all') {
			await mongo().then(async mongoose => {
				try {
					await savedCharacterSchema.findOneAndUpdate({
						_id: id,
					}, {
						$addToSet: { savedCharacters: characters },
					}, {
						upsert: true,
					});
				} finally {
					mongoose.connection.close();
				}
			});
			const addallcharsembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(message.author.username)
				.addFields(
					{
						name: 'Tracking All Characters',
						value: 'I hope you realized what you just did.',
						inline: true,
					});
			message.channel.send(addallcharsembed);
		} else {
			const querytest = Number(query);
			if (Number.isNaN(querytest) === true) {
				index = characters.findIndex(person => person.name.toLowerCase() === query);
			} else {
				index = querytest;
			}

			if(index >= 0 && index < characters.length) {
				await mongo().then(async mongoose => {
					try {
						await savedCharacterSchema.findOneAndUpdate({
							_id: id,
						}, {
							$addToSet: { savedCharacters: characters[index] },
						}, {
							upsert: true,
						}).exec();
					} finally {
						mongoose.connection.close();
					}
				});
				const embed = new Discord.MessageEmbed()
					.setColor('#00FF97')
					.setAuthor(message.author.username)
					.addFields(
						{
							name: 'Adding Character',
							value: `You are now tracking **${characters[index].name}** ${getEmotes.getEmote(characters[index].element)}`,
							inline: true,
						});
				message.channel.send(embed);
			} else {
				message.channel.send(`Please use a valid ID [\`0-${characters.length - 1}\`] or character name.`);
			}
		}
	},
};