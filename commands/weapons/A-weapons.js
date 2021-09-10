const Discord = require('discord.js');
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	slash: 'both',
	name: 'weapons',
	category: 'Weapons',
	description: 'Shows list of supported weapons with their ID\'s. Default page 1.',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(page number)',
	callback: async ({ message, args }) => {
		const getlist = page => {
			const arrayList = [];
			for (let i = (page * 20) - 20; i < page * 20; i++) {
				if (weapons[i]) {
					arrayList.push(`[${weapons[i].id}] **${weapons[i].name}** (${weapons[i].stars})`);
				}
			}
			const list = arrayList.join('\n');
			return list;
		};

		let page = 1;
		if (args && args.length > 0) {
			page = +args[0];
		}
		const maxPage = Math.ceil(weapons.length / 20);

		if (page > 0 && page <= maxPage) {
			const name = 'A→Z\n[ID] [Name] [Rarity]';
			let list = getlist(page);

			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Weapons List__')
				.setColor('#00FF97')
				.addField(name, list)
				.setFooter(`Page ${page} of ${maxPage}`);
			if (message) {
				const { author } = message;
				const { id } = author;
				const msg = await message.channel.send({ embeds: [embed] });
				/*
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
					embed.fields = [];
					embed.addField(name, list);
					msg.edit({ embeds: [embed] });
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
					msg.edit({ embeds: [embed] });
				});

				rightright.on('collect', r => {
					r.users.remove(message.author.id);
					page = maxPage;
					embed.setFooter(`Page ${page} of ${maxPage}`);
					list = getlist(page);
					embed.fields = [];
					embed.addField(name, list);
					msg.edit({ embeds: [embed] });
				});
				*/
				return;
			}
			return embed;
		} else if (page > maxPage) {
			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Weapons List__')
				.setColor('#00FF97')
				.addFields(
					{
						name: 'hol up',
						value: `We only have **${maxPage}** pages right now! More will come soon.`,
					})
				.setFooter('>:(');
			if (message) {
				message.channel.send({ embeds: [embed] });
			}
			return embed;
		} else {
			const error = 'Incorrect syntax. Use b!weapons (Page Number)';
			if (message) {
				message.channel.send(error);
				return;
			}
			return error;
		}
	},
};