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
		const getlist = page => {
			const arrayList = [];
			for (let i = (page * 20) - 20; i < page * 20; i++) {
				if (characters[i]) {
					arrayList.push(`[${characters[i].id}] **${characters[i].name}** ${getEmotes.getEmote(characters[i].element)}`);
				}
			}
			const list = arrayList.join('\n');
			return list;
		};

		let page = 1;
		if (args && args.length > 0) {
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
				.addField(name, list);

			if (message) {
				const { author } = message;
				const { id } = author;
				const msg = await message.channel.send({ embeds: [embed] });
				/*
				await msg.react('⏮️');
				await msg.react('◀️');
				await msg.react('▶️');
				await msg.react('⏭️');

				const leftleftfilter = (reaction, user) => { return reaction.emoji.name === '⏮️' && user.id === id };
				const leftfilter = (reaction, user) => { return reaction.emoji.name === '◀️' && user.id === id; };
				const rightfilter = (reaction, user) => { return reaction.emoji.name === '▶️' && user.id === id; };
				const rightrightfilter = (reaction, user) => { return reaction.emoji.name === '⏭️' && user.id === id; };

				const leftleft = msg.createReactionCollector({ leftleftfilter, time: 15000 });
				const left = msg.createReactionCollector({ leftfilter, time: 15000 });
				const right = msg.createReactionCollector({ rightfilter, time: 15000 });
				const rightright = msg.createReactionCollector({ rightrightfilter, time: 15000 });

				leftleft.on('collect', (reaction, user) => {
					console.log('LeftLeft');
					reaction.users.remove(user.id);
					page = 1;
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.fields = [];
					embed.addField(name, list);
					msg.edit({ embeds: [embed] });
				});

				left.on('collect', r => {
					r.users.remove(message.author.id);
					page--;
					if (page < 1) {
						page = 1;
					}
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.spliceFields(0, 1, { name: name, value: list });
					msg.edit({ embeds: [embed] });
					console.log('Left');
				});

				right.on('collect', reaction => {
					reaction.users.remove(message.author.id);
					page++;
					if (page > maxPage) {
						page = maxPage;
					}
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.fields = [];
					embed.addField(name, list);
					msg.edit({ embeds: [embed] });
					console.log('Right');
				});

				rightright.on('collect', r => {
					r.users.remove(message.author.id);
					page = maxPage;
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.fields = [];
					embed.addField(name, list);
					msg.edit({ embeds: [embed] });
					console.log('RightRight');
				});
				*/
				return;
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
					})
				.setFooter('>:(');
			if (message) {
				message.channel.send(embed);
				return;
			}
			return embed;
		} else {
			const error = 'Incorrect syntax. Use b!characters (Page Number)';
			if (message) {
				message.channel.send(error);
				return;
			}
			return error;
		}
	},
};