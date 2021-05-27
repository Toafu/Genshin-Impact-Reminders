const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const savedMessageSchema = require('@schemas/custommessage-schema');
const timezoneSchema = require('@schemas/timezone-schema');
const today = require('@helper/today');

module.exports = {
	name: 'agenda',
	category: 'Agenda',
	description: 'View what materials you can farm for your tracked characters and weapons. Default page 1.',
	minArgs: 0,
	maxArgs: 1,
	callback: async ({ message, args }) => {
		const { author } = message;
		const { id } = author;

		const zone = await timezoneSchema.find({ _id: id });
		let server;
		let offset;

		if (zone.length > 0) {
			server = zone[0].server.name;
			offset = zone[0].server.offset;
		} else {
			server = 'NA';
			offset = -5;
		}

		const day = today.todayIs(offset);
		const time = today.timeIs(offset);
		const hours = String(time.getHours()).padStart(2, '0');
		const minutes = String(time.getMinutes()).padStart(2, '0');

		const title = `Welcome to your Genshin Impact agenda.\nToday is ${day}, ${hours}:${minutes} ${server} server time.\nStill out of resin? Oh well ¯\\_(ツ)_/¯`;
		const logo = 'https://media.discordapp.net/attachments/424627903876169729/838122787083649055/4936.png?width=720&height=405';


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

		const getlocations = (todaysChars, todaysWeps) => {
			const loclist = [];
			if (todaysChars.length > 0) {
				todaysChars.forEach(character => {
					if (!loclist.includes(character.location)) {
						loclist.push(character.location);
					}
				});
			}
			if (todaysWeps.length > 0) {
				todaysWeps.forEach(weapon => {
					if (!loclist.includes(weapon.location)) {
						loclist.push(weapon.location);
					}
				});
			}
			loclist.sort((loc1, loc2) => loc1 > loc2 ? 1 : -1);
			return loclist;
		};

		let page;
		if (args.length === 0) {
			page = 1;
		} else {
			page = +args[0];
		}
		let maxPage;

		const query = { _id: id };
		const charresult = await savedCharacterSchema.find(query);
		const todaysChars = [];

		const wepresult = await savedWeaponSchema.find(query);
		const todaysWeps = [];

		const msgresult = await savedMessageSchema.find(query);
		let customtext;
		let customtitle;

		if (msgresult.length > 0) {
			customtext = msgresult[0].savedMessage;
			customtitle = '__Your Custom Message__';
		}

		if (charresult.length === 0 && wepresult.length === 0) { // If MongoDB has nothing on the user
			const nonexistantembed = new Discord.MessageEmbed()
				.setTitle(title)
				.setThumbnail(logo)
				.setAuthor(message.author.username)
				.setColor('#00FF97')
				.addFields(nothing);
			if (customtext) {
				nonexistantembed.addField(customtitle, customtext);
			}
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
			const loclist = getlocations(todaysChars, todaysWeps);

			const wepfield = {
				name: '__Today\'s Weapons__',
				value: finalweplist,
				inline: false,
			};

			const locfield = {
				name: '__Places to Go__',
				value: loclist,
				inline: false,
			};

			const footer = `Page ${page} of ${maxPage}`;

			if (page > 0 && page <= maxPage) {
				if (wepagenda.length > 0) {
					const agendaembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(message.author.username)
						.setFooter(footer)
						.setColor('#00FF97')
						.addFields(nocharstoday, wepfield, locfield);
					if (customtext) {
						agendaembed.addField(customtitle, customtext);
					}
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
			const loclist = getlocations(todaysChars, todaysWeps);

			const charfield = {
				name: 'Today\'s Talents',
				value: finalcharlist,
				inline: true,
			};

			const locfield = {
				name: '__Places to Go__',
				value: loclist,
				inline: false,
			};

			const footer = `Page ${page} of ${maxPage}`;

			if (page > 0 && page <= maxPage) {
				if (charagenda.length > 0) {
					const agendaembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(message.author.username)
						.setFooter(footer)
						.setColor('#00FF97')
						.addFields(charfield, nowepstoday, locfield);
					if (customtext) {
						agendaembed.addField(customtitle, customtext);
					}
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

			const loclist = getlocations(todaysChars, todaysWeps);

			const charfield = {
				name: '__Today\'s Talents__',
				value: finalcharlist,
				inline: true,
			};

			const wepfield = {
				name: '__Today\'s Weapons__',
				value: finalweplist,
				inline: false,
			};

			const locfield = {
				name: '__Places to Go__',
				value: loclist,
				inline: false,
			};

			const footer = `Page ${page} of ${maxPage}`;

			if (page > 0 && page <= maxPage) {
				if (finalcharlist.length > 0 && finalweplist.length > 0) {
					const agendaembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(message.author.username)
						.setFooter(footer)
						.setColor('#00FF97')
						.addFields(charfield, wepfield, locfield);
					if (customtext) {
						agendaembed.addField(customtitle, customtext);
					}
					message.channel.send(agendaembed);
				} else if (finalcharlist.length > 0 && finalweplist.length === 0) {
					const agendaembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(message.author.username)
						.setFooter(footer)
						.setColor('#00FF97')
						.addFields(charfield, nowepstoday, locfield);
					if (customtext) {
						agendaembed.addField(customtitle, customtext);
					}
					message.channel.send(agendaembed);
				} else if (finalcharlist.length === 0 && finalweplist.length > 0) {
					const agendaembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(message.author.username)
						.setFooter(footer)
						.setColor('#00FF97')
						.addFields(nocharstoday, wepfield, locfield);
					if (customtext) {
						agendaembed.addField(customtitle, customtext);
					}
					message.channel.send(agendaembed);
				}
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
	},
};