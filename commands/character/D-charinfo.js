const Discord = require('discord.js');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	slash: 'both',
	name: 'charinfo',
	aliases: 'cinfo',
	category: 'Characters',
	description: 'Shows detailed information about a specific character.',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '<id or character name>',
	callback: ({ message, text }) => {
		let index;
		const query = text.toLowerCase();
		const querytest = Number(query);
		if (Number.isNaN(querytest) === true) {
			if (query === 'childe') {
				index = 25;
			} else {
				index = characters.findIndex(person => person.name.toLowerCase() === query);
			}
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
						name: 'Role',
						value: characters[index].role,
						inline: true,
					},
					{
						name: 'Focused Stat(s)',
						value: `${characters[index].stat}`,
						inline: true,
					},
					{
						name: 'Prioritized Talent',
						value: characters[index].focus,
						inline: true,
					},
					{
						name: 'Talent Book Info',
						value: `•**${characters[index].talent}** books can be farmed on **${characters[index].days.replace(/["]+/g, '')}** at **${characters[index].location}**.`,
						inline: true,
					},
					{
						name: 'Ascension Info',
						value: `•To ascend ${characters[index].name}, you'll need the **${characters[index].boss}** and **${characters[index].stone}** \
						from normal bosses, **${characters[index].resource}**, and **${characters[index].loot}**.`,
						inline: false,
					},
					{
						name: 'Maybe Useful Tips/Strategies',
						value: characters[index].tip,
					})
				.setFooter('You don\'t have to follow these tips. Play the way you want to play!');
			if (message) {
				message.channel.send(embed);
			}
			return embed;
		} else {
			const error = `Please use a valid ID [\`0-${characters.length - 1}\`] or character name.`;
			if (message) {
				message.channel.send(error);
			}
			return error;
		}
	},
};