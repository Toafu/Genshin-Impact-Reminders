/* eslint-disable no-shadow-restricted-names */
const mongo = require('@root/mongo');
const Discord = require('discord.js');
const savedCharacterSchema = require('../schemas/savedcharacter-schema');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	commands: ['remove', 'untrack'],
	minArgs: 1,
	maxArgs: 2,
	expectedArgs: '<ID/Character Name>',
	callback: async (message) => {
		const { author } = message;
		const { id } = author;

		let query;
		let index;
		if (message.content.startsWith('b!remove ')) {
			query = message.content.replace('b!remove ', '').toLowerCase();
		} else if (message.content.startsWith('b!untrack ')) {
			query = message.content.replace('b!untrack ', '').toLowerCase();
		}
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
						$pull: { savedCharacters: characters[index] },
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
						name: 'Removing Character',
						value: `You are no longer tracking **${characters[index].name}** ${getEmotes.getEmote(characters[index].element)}`,
						inline: true,
					});
			message.channel.send(embed);
		} else {
			message.channel.send(`Please use a valid ID [\`0-${characters.length - 1}\`] or character name.`);
		}
	},
};