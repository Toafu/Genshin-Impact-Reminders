/* eslint-disable no-shadow-restricted-names */
const Discord = require('discord.js');
const mongo = require('@root/mongo');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const savedMessageSchema = require('@schemas/custommessage-schema');
const today = require('@helper/today');

module.exports = {
	commands: 'agenda',
	minArgs: 0,
	maxArgs: 1,
	callback: async (message, arguments) => {
		const day = today.todayIs();
		const time = today.timeIs();
		const hours = String(time.getHours()).padStart(2, '0');
		const minutes = String(time.getMinutes()).padStart(2, '0');

		const title = `Welcome to your Genshin Impact agenda.\nToday is ${day}, ${hours}:${minutes} NA server time.\nStill out of resin? Oh well ¯\\_(ツ)_/¯`;
		const logo = 'https://media.discordapp.net/attachments/424627903876169729/838122787083649055/4936.png?width=720&height=405';

		const { author } = message;
		const { id } = author;

		const nocharstoday = {
			name: 'None of your characters\' talent materials can be farmed today (or you aren\'t tracking any yet!).',
			value: 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>',
			inline: false,
		};

		const nowepstoday = {
			name: 'None of your weapons\' ascension materials can be farmed today (or you aren\'t tracking any yet!).',
			value: 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>',
			inline: false,
		};

		const nothing = {
			name: 'You aren\'t tracking anything yet!',
			value: 'Run b!add or b!equip to start tracking stuff!',
			inline: true,
		};

		const nothingtodayembed = new Discord.MessageEmbed()
			.setTitle(title)
			.setThumbnail(logo)
			.setAuthor(message.author.username)
			.setColor('#00FF97')
			.addFields(
				{
					name: 'You don\'t need to farm today (or you aren\'t tracking anything yet!).',
					value: 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>',
					inline: false,
				});

		const gettodaysChars = (todaysChars, charresult) => {
			for (let i = 0; i < charresult[0].savedCharacters.length; i++) {
				if(charresult[0].savedCharacters[i].days.includes(day)) {
					todaysChars.push(charresult[0].savedCharacters[i]);
				}
			}
		};

		const gettodaysWeps = (todaysWeps, wepresult) => {
			for (let i = 0; i < wepresult[0].savedWeapons.length; i++) {
				if(wepresult[0].savedWeapons[i].days.includes(day)) {
					todaysWeps.push(wepresult[0].savedWeapons[i]);
				}
			}
		};

		const sortChars = todaysChars => {
			todaysChars.sort((tal1, tal2) => (tal1.talent > tal2.talent) ? 1 : -1);
		};

		const sortWeps = todaysWeps => {
			todaysWeps.sort((wep1, wep2) => (wep1.mat > wep2.mat) ? 1 : -1);
		};

		const getfinalcharlist = (finalcharlist, charagenda) => {
			for (let i = (page * 10) - 10; i < page * 10; i++) {
				if (charagenda[i]) {
					finalcharlist.push(charagenda[i]);
				}
				if (finalcharlist.length === 0) {
					finalcharlist = 'No more characters to view';
				}
			}
			return finalcharlist;
		};

		const getfinalweplist = (finalweplist, wepagenda) => {
			for (let i = (page * 10) - 10; i < page * 10; i++) {
				if (wepagenda[i]) {
					finalweplist.push(wepagenda[i]);
				}
				if (finalweplist.length === 0) {
					finalweplist = 'No more weapons to view';
				}
			}
			return finalweplist;
		};

		let page;
		if (arguments.length === 0) {
			page = 1;
		} else {
			page = +arguments[0];
		}
		let maxPage;

		await mongo().then(async mongoose => {
			try {
				const query = { _id: id };
				const charresult = await savedCharacterSchema.find(query);
				const todaysChars = [];

				const wepresult = await savedWeaponSchema.find(query);
				const todaysWeps = [];

				const msgresult = await savedMessageSchema.find(query);
				let customtext;
				let custommessage;

				if (msgresult.length > 0) {
					customtext = msgresult[0].savedMessage;
					custommessage = {
						name: 'Your Custom Message',
						value: customtext,
						inline: false,
					};
				}

				if (charresult.length === 0 && wepresult.length === 0 && custommessage) { // If MongoDB has nothing on the user
					const nonexistantembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(message.author.username)
						.setColor('#00FF97')
						.addFields(nothing, custommessage);
					message.channel.send(nonexistantembed);
				} else if (charresult.length === 0 && wepresult.length === 0 && !custommessage) {
					const nonexistantembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(message.author.username)
						.setColor('#00FF97')
						.addFields(nothing);
					message.channel.send(nonexistantembed);
				} else if (charresult.length === 0 && wepresult.length > 0) { // If MongoDB can only find weapons
					gettodaysWeps(todaysWeps, wepresult);
					if (todaysWeps === 0) {
						message.channel.send(nothingtodayembed);
						return;
					}
					sortWeps(todaysWeps);
					const wepagenda = [];
					todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}.**`));
					maxPage = Math.ceil(todaysWeps.length / 10);
					let finalweplist = [];
					finalweplist = getfinalweplist(finalweplist, wepagenda);

					const wepfield = {
						name: 'Today\'s Weapons',
						value: finalweplist,
						inline: false,
					};

					const footer = `Page ${page} of ${maxPage}`;

					if (page > 0 && page <= maxPage) {
						if (wepagenda.length > 0 && custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(nocharstoday, wepfield, custommessage);
							message.channel.send(agendaembed);
						} else if (wepagenda.length > 0 && !custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(nocharstoday, wepfield);
							message.channel.send(agendaembed);
						} else if (finalweplist.length === 0) {
							message.channel.send(nothingtodayembed);
						}
					} else if (page > maxPage) {
						const invalidpageembed = new Discord.MessageEmbed()
							.setTitle(title)
							.setColor('#00FF97')
							.addFields(
								{
									name: 'hol up',
									value: `Your agenda only has **${maxPage}** page(s) today.`,
									inline: true,
								})
							.setFooter('>:(');
						message.channel.send(invalidpageembed);
					} else {
						message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
					}

				} else if (charresult.length > 0 && wepresult.length === 0) { // If MongoDB can only find characters
					gettodaysChars(todaysChars, charresult);
					if (todaysChars === 0) {
						message.channel.send(nothingtodayembed);
						return;
					}
					sortChars(todaysChars);
					const charagenda = [];
					todaysChars.forEach(character => charagenda.push(`•**${character.talent}** books for **${character.name}.**`));
					maxPage = Math.ceil(todaysChars.length / 10);
					let finalcharlist = [];
					finalcharlist = getfinalcharlist(finalcharlist, charagenda);

					const charfield = {
						name: 'Today\'s Talents',
						value: finalcharlist,
						inline: true,
					};

					const footer = `Page ${page} of ${maxPage}`;

					if (page > 0 && page <= maxPage) {
						if (charagenda.length > 0 && custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(charfield, nowepstoday, custommessage);
							message.channel.send(agendaembed);
						} else if (charagenda.length > 0 && !custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(charfield, nowepstoday);
							message.channel.send(agendaembed);
						} else if (finalcharlist.length === 0) {
							message.channel.send(nothingtodayembed);
						}
					} else if (page > maxPage) {
						const invalidpageembed = new Discord.MessageEmbed()
							.setTitle(title)
							.setColor('#00FF97')
							.addFields(
								{
									name: 'hol up',
									value: `Your agenda only has **${maxPage}** page(s) today.`,
									inline: true,
								})
							.setFooter('>:(');
						message.channel.send(invalidpageembed);
					} else {
						message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
					}

				} else { //MongoDB found both characters and weapons
					gettodaysChars(todaysChars, charresult);

					gettodaysWeps(todaysWeps, wepresult);

					if (todaysChars.length === 0 && todaysWeps === 0) {
						message.channel.send(nothingtodayembed);
						return;
					}

					sortChars(todaysChars);
					sortWeps(todaysWeps);

					const charagenda = [];
					const wepagenda = [];

					todaysChars.forEach(character => charagenda.push(`•**${character.talent}** books for **${character.name}.**`));
					todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}.**`));

					if (charagenda.length > wepagenda.length) {
						maxPage = Math.ceil(todaysChars.length / 10);
					} else {
						maxPage = Math.ceil(todaysWeps.length / 10);
					}

					let finalcharlist = [];
					let finalweplist = [];

					finalcharlist = getfinalcharlist(finalcharlist, charagenda);

					finalweplist = getfinalweplist(finalweplist, wepagenda);

					const charfield = {
						name: 'Today\'s Talents',
						value: finalcharlist,
						inline: true,
					};

					const wepfield = {
						name: 'Today\'s Weapons',
						value: finalweplist,
						inline: false,
					};

					const footer = `Page ${page} of ${maxPage}`;

					if (page > 0 && page <= maxPage) {
						if (finalcharlist.length > 0 && finalweplist.length > 0 && custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(charfield, wepfield, custommessage);
							message.channel.send(agendaembed);
						} else if (finalcharlist.length > 0 && finalweplist.length > 0 && !custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(charfield, wepfield);
							message.channel.send(agendaembed);
						} else if (finalcharlist.length > 0 && finalweplist.length === 0 && custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(charfield, nowepstoday, custommessage);
							message.channel.send(agendaembed);
						} else if (finalcharlist.length > 0 && finalweplist.length === 0 && !custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(charfield, nowepstoday);
							message.channel.send(agendaembed);
						} else if (finalcharlist.length === 0 && finalweplist.length > 0 && custommessage) {
							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(message.author.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(nocharstoday, wepfield, custommessage);
							message.channel.send(agendaembed);
						}
					} else if (finalcharlist.length === 0 && finalweplist.length > 0 && !custommessage) {
						const agendaembed = new Discord.MessageEmbed()
							.setTitle(title)
							.setThumbnail(logo)
							.setAuthor(message.author.username)
							.setFooter(footer)
							.setColor('#00FF97')
							.addFields(nocharstoday, wepfield);
						message.channel.send(agendaembed);
					} else if (page > maxPage) {
						const invalidpageembed = new Discord.MessageEmbed()
							.setTitle('__Supported Character List__')
							.setColor('#00FF97')
							.addFields(
								{
									name: 'hol up',
									value: `Your agenda only has **${maxPage}** page(s) today.`,
									inline: true,
								})
							.setFooter('>:(');
						message.channel.send(invalidpageembed);
					} else {
						message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
					}
				}
			} finally {
				mongoose.connection.close();
			}
		});
	},
};