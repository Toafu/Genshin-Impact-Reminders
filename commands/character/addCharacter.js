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
	callback: async (message, arguments, text) => {
		const { author } = message;
		const { id } = author;

		const query = text.toLowerCase();
		let index;

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