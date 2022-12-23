const Discord = require('discord.js');
const { MessageActionRow, MessageButton } = Discord;
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	slash: 'both',
	name: 'weapons',
	category: 'Weapons',
	description: 'Shows list of supported weapons with their ID\'s.',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(page number)',
	//testOnly: true,
	callback: async ({ message, args, text, interaction: msgInt, channel }) => {
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

		const updateEmbed = (embed, page) => {
			const name = 'A→Z\n[ID] [Name] [Rarity]';
			embed.setFooter({ text: `Page ${page} of ${maxPage}` });
			list = getlist(page);
			embed.fields = [];
			embed.addFields({ name: name, value: list });
		};

		const maxPage = Math.ceil(weapons.length / 20);

		if (text.toLowerCase() === 'all' && message) {
			const name = 'A→Z\n[ID] [Name] [Element]';

			for (let page = 1; page <= maxPage; page++) {
				let list = getlist(page);
				const embed = new Discord.MessageEmbed()
					.setTitle('__Supported Weapons List__')
					.setColor('#00FF97')
					.setFooter({ text: `Page ${page} of ${maxPage}` })
					.addFields({ name: name, value: list });
				message.channel.send({ embeds: [embed] });
			}
			return;
		}

		let page = 1;
		if (args && args.length > 0) {
			page = +args[0];
		}

		if (page > 0 && page <= maxPage) {
			const name = 'A→Z\n[ID] [Name] [Rarity]';
			let list = getlist(page);

			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Weapons List__')
				.setColor('#00FF97')
				.addFields({ name: name, value: list })
				.setFooter({ text: `Page ${page} of ${maxPage}` });

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('first_page')
						.setLabel('First Page')
						.setStyle('PRIMARY')
				)
				.addComponents(
					new MessageButton()
						.setCustomId('prev_page')
						.setLabel('Previous Page')
						.setStyle('PRIMARY')
				)
				.addComponents(
					new MessageButton()
						.setCustomId('next_page')
						.setLabel('Next Page')
						.setStyle('PRIMARY')
				)
				.addComponents(
					new MessageButton()
						.setCustomId('last_page')
						.setLabel('Last Page')
						.setStyle('PRIMARY')
				);

			let filter;
			if (message) {
				await message.channel.send({
					embeds: [embed],
					components: [row],
				});

				filter = (btnInt) => {
					return message.author.id === btnInt.user.id;
				};
			} else {
				await msgInt.reply({
					embeds: [embed],
					components: [row],
				});

				filter = (btnInt) => {
					return msgInt.user.id === btnInt.user.id;
				};
			}

			const collector = channel.createMessageComponentCollector({
				filter,
				idle: 1000 * 10,
			});

			collector.on('collect', async i => {
				if (i.customId === 'first_page') {
					page = 1;
				};
				if (i.customId === 'prev_page') {
					if (--page < 1) page = 1;
				};
				if (i.customId === 'next_page') {
					if (++page > maxPage) page = maxPage;
				};
				if (i.customId === 'last_page') {
					page = maxPage;
				};
				updateEmbed(embed, page);
				await i.update({ embeds: [embed], components: [row] });
			});
			return;
		} else if (page > maxPage) {
			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Weapons List__')
				.setColor('#00FF97')
				.addFields(
					{
						name: 'hol up',
						value: `We only have **${maxPage}** pages right now! More will come soon.`,
					})
				.setFooter({ text: '>:(' });
			if (message) {
				message.channel.send({ embeds: [embed] });
				return;
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