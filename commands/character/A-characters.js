const Discord = require('discord.js');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	slash: 'both',
	name: 'characters',
	category: 'Characters',
	description: 'Shows list of supported characters with ID\'s. Default page 1. (No reactions for slash yet)',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(page number)',
	callback: async ({ message, args }) => {
		const { author } = message;
		const { id } = author;

		const getlist = page => {
			const list = [];
			for (let i = (page * 20) - 20; i < page * 20; i++) {
				if (characters[i]) {
					list.push(`[${characters[i].id}] **${characters[i].name}** ${getEmotes.getEmote(characters[i].element)}`);
				}
			}
			return list;
		};

		let page;
		if (args.length === 0) {
			page = 1;
		} else {
			page = +args[0];
		}
		const maxPage = Math.ceil(characters.length / 20);

		if (page > 0 && page <= maxPage) {
			const name = 'A→Z\n[ID] [Name] [Element]';
			let list = getlist(page);

			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Character List__')
				.setColor('#00FF97')
				.setFooter(`Page ${page} of ${maxPage}`)
				.addFields({
					name: name,
					value: list,
				});

			if (message) {
				const msg = await message.channel.send(embed);

				await msg.react('⏮️');
				await msg.react('◀️');
				await msg.react('▶️');
				await msg.react('⏭️');

				const leftleftfilter = (reaction, user) => { return reaction.emoji.name === '⏮️' && user.id === id; };
				const leftfilter = (reaction, user) => { return reaction.emoji.name === '◀️' && user.id === id; };
				const rightfilter = (reaction, user) => { return reaction.emoji.name === '▶️' && user.id === id; };
				const rightrightfilter = (reaction, user) => { return reaction.emoji.name === '⏭️' && user.id === id; };

				const leftleft = msg.createReactionCollector(leftleftfilter, { idle: 30000, dispose: true });
				const left = msg.createReactionCollector(leftfilter, { idle: 30000, dispose: true });
				const right = msg.createReactionCollector(rightfilter, { idle: 30000, dispose: true });
				const rightright = msg.createReactionCollector(rightrightfilter, { idle: 30000, dispose: true });

				leftleft.on('collect', r => {
					r.users.remove(message.author.id);
					page = 1;
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.fields = [];
					embed.addField(name, list);
					msg.edit(embed);
				});

				left.on('collect', r => {
					r.users.remove(message.author.id);
					page--;
					if (page < 1) {
						page = 1;
					}
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.fields = [];
					embed.addField(name, list);
					msg.edit(embed);
				});

				right.on('collect', r => {
					r.users.remove(message.author.id);
					page++;
					if (page > maxPage) {
						page = maxPage;
					}
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.fields = [];
					embed.addField(name, list);
					msg.edit(embed);
				});

				rightright.on('collect', r => {
					r.users.remove(message.author.id);
					page = maxPage;
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.fields = [];
					embed.addField(name, list);
					msg.edit(embed);
				});
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