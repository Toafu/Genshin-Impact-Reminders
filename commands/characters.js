/* eslint-disable no-shadow-restricted-names */
const Discord = require('discord.js');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	commands: 'characters',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '<Page Number>',
	callback: (message, arguments) => {
		let page;
		if (arguments.length === 0) {
			page = 1;
		} else {
			page = +arguments[0];
		}
		const maxPage = Math.ceil(characters.length / 20);
		if (page > 0 && page <= maxPage) {
			const list = [];
			const newlist = [];
			characters.forEach(character => list.push(`[${character.id}] ${character.name} ${getEmotes.getEmote(character.element)}`));
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
			message.channel.send(embed);
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
			message.channel.send(embed);
		} else {
			message.channel.send('Incorrect syntax. Use b!characters <Page Number>');
		}
	},
};