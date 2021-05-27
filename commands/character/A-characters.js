const Discord = require('discord.js');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	slash: 'both',
	name: 'characters',
	category: 'Characters',
	description: 'Shows list of supported characters with their ID\'s. Default page 1.',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(page number)',
	callback: ({ message, args }) => {
		let page;
		if (args.length === 0) {
			page = 1;
		} else {
			page = +args[0];
		}
		const maxPage = Math.ceil(characters.length / 20);
		if (page > 0 && page <= maxPage) {
			const list = [];
			const newlist = [];
			characters.forEach(character => list.push(`[${character.id}] **${character.name}** ${getEmotes.getEmote(character.element)}`));
			for (let i = (page * 20) - 20; i < page * 20; i++) {
				newlist.push(list[i]);
			}

			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Character List__')
				.setColor('#00FF97')
				.addFields(
					{
						name: 'A→Z\n[ID] [Name] [Element]',
						value: newlist,
						inline: true,
					})
				.setFooter(`Page ${page} of ${maxPage}`);
			if (message) {
				message.channel.send(embed);
			}
			return embed;
		} else if (page > maxPage) {
			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Character List__')
				.setColor('#00FF97')
				.addFields(
					{
						name: 'hol up',
						value: `We only have **${maxPage}** pages right now! More will come soon.`,
						inline: true,
					})
				.setFooter('>:(');
			if (message) {
				message.channel.send(embed);
			}
			return embed;
		} else {
			const error = 'Incorrect syntax. Use b!characters (Page Number)';
			if (message) {
				message.channel.send(error);
			}
			return error;
		}
	},
};