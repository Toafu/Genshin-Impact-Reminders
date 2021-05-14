const Discord = require('discord.js');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	commands: 'characters', //Can include all aliases of a command
	minArgs: 1,
	maxArgs: 1,
	expectedArgs: '<Page Number>',
	callback: message => {
		const page = message.content.replace('b!characters ', '');
		const maxPage = Math.ceil(characters.length / 20);
		if (page > 0 && page <= maxPage) {
			const list = [];
			const newlist = [];
			characters.forEach(character => list.push(`[${character.id}] ${character.name} ${getEmotes.getEmote(character.element)}`));
			for (let i = (page * 20) - 20; i < page * 20; i++) {
				newlist.push(list[i]);
			}
			//console.log(list[0]);
			//console.log(typeof list[0]);
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
						value: `We only have ${maxPage} pages right now! More will come back soon.`,
						inline: true,
					})
				.setFooter('>:(');
			message.channel.send(embed);
		} else {
			message.channel.send('Incorrect syntax. Use b!characters <Page Number>');
		}
	},
};