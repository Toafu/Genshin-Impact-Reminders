/* eslint-disable no-shadow-restricted-names */
const Discord = require('discord.js');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	commands: ['charinfo', 'cinfo'],
	minArgs: 1,
	maxArgs: 2,
	expectedArgs: '<ID/Character Name>',
	callback: (message, arguments, text) => {
		let index;
		const query = text;
		const querytest = Number(query);
		if (Number.isNaN(querytest) === true) {
			index = characters.findIndex(person => person.name.toLowerCase() === query);
		} else {
			index = querytest;
		}
		if (index >= 0 && index < characters.length) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`${characters[index].name} ${getEmotes.getEmote(characters[index].element)}`)
				.setImage(characters[index].img)
				.setColor('#00FF97')
				.addFields(
					{
						name: 'Talent Info',
						value: `•**${characters[index].talent}** books can be farmed on **${characters[index].days.replace(/["]+/g, '')}**.`,
						inline: true,
					},
					{
						name: 'Ascension Info',
						value: `•To ascend ${characters[index].name}, you'll need the **${characters[index].boss}** and **${characters[index].stone}** \
						from normal bosses, **${characters[index].resource}**, and **${characters[index].loot}**.`,
						inline: false,
					});
			message.channel.send(embed);
		} else {
			message.channel.send(`Please use a valid ID [\`0-${characters.length - 1}\`] or character name.`);
		}
	},
};