/* eslint-disable no-shadow-restricted-names */
const Discord = require('discord.js');
const getChar = require('../getChars');
const characters = getChar.getChars();
const getEmotes = require('../getEmote');

module.exports = {
	commands: 'info',
	minArgs: 1,
	maxArgs: 2,
	expectedArgs: '<ID/Character Name>',
	callback: (message) => {
		let index;
		const query = message.content.replace('b!info ', '').toLowerCase();
		const querytest = Number(query);
		if (Number.isNaN(querytest) === true) {
			index = characters.findIndex(person => person.name.toLowerCase() === query);
		} else {
			index = querytest;
		}
		if (index >= 0 && index < characters.length) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`${characters[index].name} ${getEmotes.getEmote(characters[index].element)}`)
				.setColor('#00FF97')
				.addFields(
					{
						name: 'Talent Info',
						value: `•**${characters[index].talent}** books can be farmed on **${characters[index].days.replace(/["]+/g, '')}**`,
						inline: true,
					});
			message.channel.send(embed);
		} else {
			message.channel.send(`Please use a valid ID [\`0-${characters.length - 1}\`] or character name.`);
		}
	},
};