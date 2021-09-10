const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getEmotes = require('@helper/getEmote');

module.exports = {
	name: 'tracking',
	category: 'Characters',
	description: 'View which characters you are tracking. Defaults to page 1.',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(Page Number)',
	callback: async ({ message, args }) => {
		const { author } = message;
		const { id } = author;

		const emptyembed = new Discord.MessageEmbed()
			.setTitle(`${author.username}'s Tracking List`)
			.setColor('#00FF97')
			.addFields(
				{
					name: `${author.username}, this list is empty.`,
					value: 'You currently aren\'t tracking anyone. Add some characters with b!add <ID/Character>.',
				});

		const result = await savedCharacterSchema.find({
			_id: id,
		});

		if (result.length > 0) {
			const dblist = result[0].savedCharacters;
			const trackList = [];
			let page;
			dblist.forEach(person => trackList.push(person));
			if (args.length === 0) {
				page = 1;
			} else {
				page = +args[0];
			}

			const getlist = page => {
				let list = [];
				for (let i = (page * 20) - 20; i < page * 20; i++) {
					if (trackList[i]) {
						list.push(`[${trackList[i].id}] **${trackList[i].name}** ${getEmotes.getEmote(trackList[i].element)}`);
					}
				}
				list = list.join('\n');
				return list;
			};

			trackList.sort((char1, char2) => (char1.name > char2.name) ? 1 : -1);
			const maxPage = Math.ceil(trackList.length / 20);
			let list = getlist(page);

			if (list.length > 0 && page <= maxPage) {
				const name = 'You are currently spending countless hours building:';
				const embed = new Discord.MessageEmbed()
					.setTitle(`${author.username}'s Tracking List`)
					.setColor('#00FF97')
					.setFooter(`Page ${page} of ${maxPage}`)
					.addField(name, list);
				const msg = await message.channel.send({ embeds: [embed] });
				/*
				if (maxPage > 1) {
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
				}
				*/
			} else if (page > maxPage) {
				const maxpageembed = new Discord.MessageEmbed()
					.setTitle(`${author.username}'s Tracking List`)
					.setColor('#00FF97')
					.addFields(
						{
							name: 'hol up',
							value: `You only have **${maxPage}** page(s) worth of tracked characters!`,
						})
					.setFooter('>:(');
				message.channel.send({ embeds: [maxpageembed] });
			} else {
				message.channel.send({ embeds: [emptyembed] });
			}
		} else {
			message.channel.send({ embeds: [emptyembed] });
		}
	},
};