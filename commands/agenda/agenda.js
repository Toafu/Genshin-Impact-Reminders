const Discord = require('discord.js');
const { MessageActionRow, MessageButton } = Discord;
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const savedMessageSchema = require('@schemas/custommessage-schema');
const timezoneSchema = require('@schemas/timezone-schema');
const ahelp = require('@helper/agendahelper');

module.exports = {
	slash: 'both',
	name: 'agenda',
	category: 'Agenda',
	description: 'View what materials you can farm for your tracked characters and weapons. Default page 1.',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(page number)',
	callback: async ({ message, args, interaction: msgInt, channel }) => {
		let id;
		let author;
		if (message) {
			id = message.author.id;
			author = message.author.username;
		} else {
			id = msgInt.user.id;
			author = msgInt.user.username;
		}

		const zone = await timezoneSchema.find({ _id: id });
		const { server, offset } = ahelp.getTimeZone(zone);
		const { day, title, logo } = ahelp.getTime(server, offset);
		const { nocharstoday, nowepstoday, nothing } = ahelp.getNothingFields();

		const nothingtodayembed = new Discord.MessageEmbed()
			.setTitle(title)
			.setThumbnail(logo)
			.setAuthor({ name: author })
			.setColor('#00FF97')
			.addField('You don\'t need to farm today.', 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>');

		const availablematerials = ahelp.getMaterials(day);

		let page;
		if (!args[0]) {
			page = 1;
		} else {
			page = +args[0];
		}

		const query = { _id: id };
		const charresult = await savedCharacterSchema.find(query);
		const todaysChars = [];

		const wepresult = await savedWeaponSchema.find(query);
		const todaysWeps = [];

		const msgresult = await savedMessageSchema.find(query);
		let customtext;
		let customtitle;

		if (msgresult[0]) {
			customtext = msgresult[0].savedMessage;
			customtitle = '__Your Custom Message__';
		}

		const nonexistantembed = new Discord.MessageEmbed()
			.setTitle(title)
			.setThumbnail(logo)
			.setAuthor({ name: author })
			.setColor('#00FF97')
			.addFields(nothing);
		if (customtext) {
			nonexistantembed.addField(customtitle, customtext);
		}

		const { gettodaysChars, gettodaysWeps, sortChars, sortWeps, getfinalcharlist, getfinalweplist, getlocations, getfields } = ahelp.getFunctions(day, availablematerials, nocharstoday, nowepstoday, customtitle, customtext);

		const charname = '__Today\'s Talents__';
		const wepname = '__Today\'s Weapons__';
		const locname = '__Places to Go__';

		const agendaembed = new Discord.MessageEmbed()
			.setTitle(title)
			.setThumbnail(logo)
			.setAuthor({ name: author })
			.setColor('#00FF97');

		if (!charresult[0] && !wepresult[0]) { //No record of user
			if (message) {
				message.channel.send({ embeds: [nonexistantembed] });
			} else {
				msgInt.reply({ embeds: [nonexistantembed] });
			}
			return;
		} else if (charresult[0] && !wepresult[0]) { //If user's character tracking list exists
			if (!charresult[0].savedCharacters[0] && !wepresult[0]) {
				if (message) {
					message.channel.send({ embeds: [nonexistantembed] });
				} else {
					msgInt.reply({ embeds: [nonexistantembed] });
				}
				return;
			}
		} else if (wepresult[0] && !charresult[0]) { //If user's weapon tracking list exists
			if (!wepresult[0].savedWeapons[0] && !charresult[0]) {
				if (message) {
					message.channel.send({ embeds: [nonexistantembed] });
				} else {
					msgInt.reply({ embeds: [nonexistantembed] });
				}
				return;
			}
		} else if (charresult[0] && wepresult[0]) { //Both user's tracking lists exist
			if (!charresult[0].savedCharacters[0] && !wepresult[0].savedWeapons[0]) {
				if (message) {
					message.channel.send({ embeds: [nonexistantembed] });
				} else {
					msgInt.reply({ embeds: [nonexistantembed] });
				}
				return;
			}
		}

		const charagenda = [];
		let finalcharlist;
		let charfield = {};
		if (charresult[0]) {
			gettodaysChars(todaysChars, charresult);
			if (todaysChars.length === 0) {
				agendaembed.addFields(nocharstoday);
			} else {
				sortChars(todaysChars);
				todaysChars.forEach(character => charagenda.push(`•**${character.talent}** for **${character.name}**`));
				finalcharlist = getfinalcharlist(charagenda, page);
				charfield = {
					name: charname,
					value: finalcharlist.join('\n'),
				};
				agendaembed.addFields(charfield);
			}
		}

		const wepagenda = [];
		let finalweplist;
		let wepfield = {};
		if (wepresult[0]) {
			gettodaysWeps(todaysWeps, wepresult);
			if (todaysWeps.length === 0) {
				agendaembed.addFields(nowepstoday);
			} else {
				sortWeps(todaysWeps);
				todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}**`));
				finalweplist = getfinalweplist(wepagenda, page);
				wepfield = {
					name: wepname,
					value: finalweplist.join('\n'),
				};
				agendaembed.addFields(wepfield);
			}
		}

		const maxPage = Math.max(Math.ceil(todaysChars.length / 10), Math.ceil(todaysWeps.length / 10));

		if (maxPage === 0) { //The user is tracking but nothing today
			if (message) {
				message.channel.send({ embeds: [nothingtodayembed] });
			} else {
				msgInt.reply({ embeds: [nothingtodayembed] });
			}
			return;
		}

		const footer = `Page ${page} of ${maxPage}`;

		const loclist = getlocations(todaysChars, todaysWeps);
		const locfield = {
			name: locname,
			value: loclist,
		};
		const invalidpageembed = new Discord.MessageEmbed()
			.setTitle(title)
			.setColor('#00FF97')
			.addField('hol up', `Your agenda only has **${maxPage}** page(s) today.`)
			.setFooter({ text: '>:(' });

		if (page > maxPage) {
			if (message) {
				message.channel.send({ embeds: [invalidpageembed] });
				return;
			}
			msgInt.reply({ embeds: [invalidpageembed] });
			return;
		}

		const agenda = {
			agendaembed,
			charname,
			wepname,
			charagenda,
			wepagenda,
			locfield,
		};

		if (page > 0 && page <= maxPage) {
			agendaembed.setFooter({ text: footer });
			getfields(agenda, page);
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
						embeds: [agendaembed],
						components: [row],
					});

					filter = (btnInt) => {
						return message.author.id === btnInt.user.id;
					};
				} else {
					await msgInt.reply({
						embeds: [agendaembed],
						components: [row],
					});

					filter = (btnInt) => {
						return msgInt.user.id === btnInt.user.id;
					};
				}

				const collector = channel.createMessageComponentCollector({
					filter,
					idle: 1000 * 15,
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
					agendaembed.setFooter({ text: footer });
					getfields(agenda, page);
					await i.update({ embeds: [agendaembed], components: [row] });
				});
			} else {
				if (message) {
					message.channel.send({ embeds: [agendaembed] });
				} else {
					msgInt.reply({ embeds: [agendaembed] });
				}
			}
		}
	}
};