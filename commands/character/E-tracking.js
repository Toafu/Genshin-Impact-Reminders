const Discord = require('discord.js');
const { MessageActionRow, MessageButton } = Discord;
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getEmotes = require('@helper/getEmote');

module.exports = {
	slash: 'both',
	name: 'tracking',
	category: 'Characters',
	description: 'View which characters you are tracking.',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(Page Number)',
	//testOnly: true,
	callback: async ({ message, args, interaction: msgInt, channel }) => {
		//Take an empty array and push the current page's entries. Convert to string to make Discord.js happy.
		const getlist = (page, trackList) => {
			let list = [];
			for (let i = (page * 20) - 20; i < page * 20; i++) {
				if (trackList[i]) {
					list.push(`[${trackList[i].id}] **${trackList[i].name}** ${getEmotes.getEmote(trackList[i].element)}`);
				}
			}
			list = list.join('\n');
			return list;
		};

		const updateEmbed = (embed, page, maxPage, trackList) => {
			embed.setFooter({ text: `Page ${page} of ${maxPage}` });
			list = getlist(page, trackList);
			embed.fields = [];
			embed.addField('You are currently spending countless hours building:', list);
		};

		let id;
		let author;
		if (message) {
			id = message.author.id;
			author = message.author.username;
		} else {
			id = msgInt.user.id;
			author = msgInt.user.username;
		}

		const title = `${author}'s Tracking List`;

		const emptyembed = new Discord.MessageEmbed()
			.setTitle(title)
			.setColor('#00FF97')
			.addFields(
				{
					name: `${author}, this list is empty.`,
					value: 'You currently aren\'t tracking anyone. Add some characters with b!add <ID/Character>.',
				});

		const result = await savedCharacterSchema.find({
			_id: id,
		});

		let page = 1;
		if (args[0]) {
			page = +args[0];
		}

		if (result.length > 0) {
			const dblist = result[0].savedCharacters;
			const trackList = [];
			dblist.forEach(person => trackList.push(person));

			trackList.sort((char1, char2) => (char1.name > char2.name) ? 1 : -1);
			const maxPage = Math.ceil(trackList.length / 20);
			let list = getlist(page, trackList);

			if (list.length > 0 && page <= maxPage) {
				const name = 'You are currently spending countless hours building:';
				const embed = new Discord.MessageEmbed()
					.setTitle(title)
					.setColor('#00FF97')
					.setFooter({ text: `Page ${page} of ${maxPage}` })
					.addField(name, list);

				if (maxPage > 1) {
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
						updateEmbed(embed, page, maxPage, trackList);
						await i.update({ embeds: [embed], components: [row] });
					});
				} else {
					if (message) {
						message.channel.send({ embeds: [embed] });
					} else {
						msgInt.reply({ embeds: [embed] });
					}
				}
				return;
			} else if (page > maxPage) {
				const maxpageembed = new Discord.MessageEmbed()
					.setTitle(title)
					.setColor('#00FF97')
					.addFields(
						{
							name: 'hol up',
							value: `You only have **${maxPage}** page(s) worth of tracked characters!`,
						})
					.setFooter({ text: '>:(' });
				if (message) {
					message.channel.send({ embeds: [maxpageembed] });
				} else {
					msgInt.reply({ embeds: [maxpageembed] });
				}
				return;
			}
		}
		if (message) {
			message.channel.send({ embeds: [emptyembed] });
		} else {
			msgInt.reply({ embeds: [emptyembed] });
		}
	},
};