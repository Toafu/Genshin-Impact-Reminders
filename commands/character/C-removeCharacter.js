const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	name: 'untrack',
	aliases: 'remove',
	category: 'Characters',
	description: 'Removes a character from your agenda. `all` wipes your character list.',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '<ID/Character Name>',
	callback: async ({ message, text }) => {
		const { author } = message;
		const { id } = author;

		const query = text.toLowerCase();
		let index;

		if (query === 'all') {
			await savedCharacterSchema.findOneAndDelete({
				_id: id,
			});
			const removeallembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(message.author.username)
				.addFields(
					{
						name: 'Removing All Characters',
						value: 'You are no longer tracking any characters.',
						inline: true,
					});
			message.channel.send(removeallembed);
		} else {
			const querytest = Number(query);
			if (Number.isNaN(querytest) === true) {
				index = characters.findIndex(person => person.name.toLowerCase() === query);
			} else {
				index = querytest;
			}

			if(index >= 0 && index < characters.length) {
				await savedCharacterSchema.findOneAndUpdate({
					_id: id,
				}, {
					$pull: { savedCharacters: characters[index] },
				}, {
					upsert: true,
				}).exec();
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
		}
	},
};