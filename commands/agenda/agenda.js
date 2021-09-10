const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const savedMessageSchema = require('@schemas/custommessage-schema');
const timezoneSchema = require('@schemas/timezone-schema');
const ahelp = require('@helper/agendahelper');

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
		const { server, offset } = ahelp.getTimeZone(zone);
		const { day, title, logo } = ahelp.getTime(server, offset);
		const { nocharstoday, nowepstoday, nothing } = ahelp.getNothingFields();

		const nothingtodayembed = new Discord.MessageEmbed()
			.setTitle(title)
			.setThumbnail(logo)
			.setAuthor(message.author.username)
			.setColor('#00FF97')
			.addField('You don\'t need to farm today (or you aren\'t tracking anything yet!).', 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>');

		const availablematerials = ahelp.getMaterials(day);

		let page;
		if (args.length === 0) {
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

		if (msgresult.length > 0) {
			customtext = msgresult[0].savedMessage;
			customtitle = '__Your Custom Message__';
		}

		const { gettodaysChars, gettodaysWeps, sortChars, sortWeps, getfinalcharlist, getfinalweplist, getlocations, getfields } = ahelp.getFunctions(day, page, availablematerials, nocharstoday, nowepstoday, customtitle, customtext);

		const charname = '__Today\'s Talents__';
		const wepname = '__Today\'s Weapons__';
		const locname = '__Places to Go__';

		const leftleftfilter = (reaction, user) => { return reaction.emoji.name === '⏮️' && user.id === id; };
		const leftfilter = (reaction, user) => { return reaction.emoji.name === '◀️' && user.id === id; };
		const rightfilter = (reaction, user) => { return reaction.emoji.name === '▶️' && user.id === id; };
		const rightrightfilter = (reaction, user) => { return reaction.emoji.name === '⏭️' && user.id === id; };

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
			message.channel.send({ embeds: [nonexistantembed] });
		} else if (charresult.length === 0 && wepresult.length > 0) { // If MongoDB can find only weapons
			gettodaysWeps(todaysWeps, wepresult);
			if (todaysWeps.length === 0) {
				message.channel.send({ embeds: [nothingtodayembed] });
				return;
			}
			sortWeps(todaysWeps);
			const wepagenda = [];
			todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}.**`));
			const maxPage = Math.ceil(todaysWeps.length / 10);
			let finalweplist = getfinalweplist(wepagenda, page);
			const loclist = getlocations(todaysChars, todaysWeps);

			let wepfield = {
				name: wepname,
				value: finalweplist,
			};

			const locfield = {
				name: locname,
				value: loclist,
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
					const msg = await message.channel.send({ embeds: [agendaembed] });
					/*
					if (maxPage > 1) {
						await msg.react('⏮️');
						await msg.react('◀️');
						await msg.react('▶️');
						await msg.react('⏭️');

						const leftleft = msg.createReactionCollector(leftleftfilter, { idle: 30000, dispose: true });
						const left = msg.createReactionCollector(leftfilter, { idle: 30000, dispose: true });
						const right = msg.createReactionCollector(rightfilter, { idle: 30000, dispose: true });
						const rightright = msg.createReactionCollector(rightrightfilter, { idle: 30000, dispose: true });

						leftleft.on('collect', r => {
							r.users.remove(message.author.id);
							page = 1;
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							finalweplist = getfinalweplist(wepagenda, page);
							wepfield = {
								name: wepname,
								value: finalweplist,
							};
							agendaembed.fields = [];
							agendaembed.addFields(nocharstoday, wepfield, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							msg.edit({ embeds: [agendaembed] });
						});

						left.on('collect', r => {
							r.users.remove(message.author.id);
							page--;
							if (page < 1) {
								page = 1;
							}
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							finalweplist = getfinalweplist(wepagenda, page);
							wepfield = {
								name: wepname,
								value: finalweplist,
							};
							agendaembed.fields = [];
							agendaembed.addFields(nocharstoday, wepfield, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							msg.edit({ embeds: [agendaembed] });
						});

						right.on('collect', r => {
							r.users.remove(message.author.id);
							page++;
							if (page > maxPage) {
								page = maxPage;
							}
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							finalweplist = getfinalweplist(wepagenda, page);
							wepfield = {
								name: wepname,
								value: finalweplist,
							};
							agendaembed.fields = [];
							agendaembed.addFields(nocharstoday, wepfield, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							msg.edit({ embeds: [agendaembed] });
						});

						rightright.on('collect', r => {
							r.users.remove(message.author.id);
							page = maxPage;
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							finalweplist = getfinalweplist(wepagenda, page);
							wepfield = {
								name: wepname,
								value: finalweplist,
							};
							agendaembed.fields = [];
							agendaembed.addFields(nocharstoday, wepfield, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							msg.edit({ embeds: [agendaembed] });
						});
					}
					*/
				} else if (finalweplist.length === 0) {
					message.channel.send({ embeds: [nothingtodayembed] });
				}
			} else if (page > maxPage) {
				if (maxPage === 0) {
					message.channel.send({ embeds: [nothingtodayembed] });
				} else {
					const invalidpageembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setColor('#00FF97')
						.addFields(
							{
								name: 'hol up',
								value: `Your agenda only has **${maxPage}** page(s) today.`,
							})
						.setFooter('>:(');
					message.channel.send({ embeds: [invalidpageembed] });a
				}
			} else {
				message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
			}

		} else if (charresult.length > 0 && wepresult.length === 0) { // If MongoDB can find only characters
			gettodaysChars(todaysChars, charresult);
			if (todaysChars.length === 0) {
				message.channel.send({ embeds: [nothingtodayembed] });
				return;
			}
			sortChars(todaysChars);
			const charagenda = [];
			todaysChars.forEach(character => charagenda.push(`•**${character.talent}** for **${character.name}.**`));
			const maxPage = Math.ceil(todaysChars.length / 10);
			const finalcharlist = getfinalcharlist(charagenda, page);
			const loclist = getlocations(todaysChars, todaysWeps);

			let charfield = {
				name: charname,
				value: finalcharlist,
			};

			const locfield = {
				name: locname,
				value: loclist,
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
					const msg = await message.channel.send({ embeds: [agendaembed] });
					/*
					if (maxPage > 1) {
						await msg.react('⏮️');
						await msg.react('◀️');
						await msg.react('▶️');
						await msg.react('⏭️');

						const leftleft = msg.createReactionCollector(leftleftfilter, { idle: 30000, dispose: true });
						const left = msg.createReactionCollector(leftfilter, { idle: 30000, dispose: true });
						const right = msg.createReactionCollector(rightfilter, { idle: 30000, dispose: true });
						const rightright = msg.createReactionCollector(rightrightfilter, { idle: 30000, dispose: true });

						leftleft.on('collect', r => {
							r.users.remove(message.author.id);
							page = 1;
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							finalcharlist = getfinalcharlist(charagenda, page);
							charfield = {
								name: charname,
								value: finalcharlist,
							};
							agendaembed.fields = [];
							agendaembed.addFields(charfield, nowepstoday, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							msg.edit(agendaembed);
						});

						left.on('collect', r => {
							r.users.remove(message.author.id);
							page--;
							if (page < 1) {
								page = 1;
							}
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							finalcharlist = getfinalcharlist(charagenda, page);
							charfield = {
								name: charname,
								value: finalcharlist,
							};
							agendaembed.fields = [];
							agendaembed.addFields(charfield, nowepstoday, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							msg.edit(agendaembed);
						});

						right.on('collect', r => {
							r.users.remove(message.author.id);
							page++;
							if (page > maxPage) {
								page = maxPage;
							}
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							finalcharlist = getfinalcharlist(charagenda, page);
							charfield = {
								name: charname,
								value: finalcharlist,
							};
							agendaembed.fields = [];
							agendaembed.addFields(charfield, nowepstoday, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							msg.edit(agendaembed);
						});

						rightright.on('collect', r => {
							r.users.remove(message.author.id);
							page = maxPage;
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							finalcharlist = getfinalcharlist(charagenda, page);
							charfield = {
								name: charname,
								value: finalcharlist,
							};
							agendaembed.fields = [];
							agendaembed.addFields(charfield, nowepstoday, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							msg.edit(agendaembed);
						});
					}
					*/
				} else if (finalcharlist.length === 0) {
					message.channel.send({ embeds: [nothingtodayembed] });
				}
			} else if (page > maxPage) {
				if (maxPage === 0) {
					message.channel.send({ embeds: [nothingtodayembed] });
				} else {
					const invalidpageembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setColor('#00FF97')
						.addFields(
							{
								name: 'hol up',
								value: `Your agenda only has **${maxPage}** page(s) today.`,
							})
						.setFooter('>:(');
					message.channel.send({ embeds: [invalidpageembed] });
				}
			} else {
				message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
			}

		} else { //If MongoDB found both characters and weapons
			gettodaysChars(todaysChars, charresult);
			gettodaysWeps(todaysWeps, wepresult);

			if (todaysChars.length === 0 && todaysWeps.length === 0) {
				message.channel.send({ embeds: [nothingtodayembed] });
				return;
			}

			sortChars(todaysChars);
			sortWeps(todaysWeps);

			const charagenda = [];
			const wepagenda = [];

			todaysChars.forEach(character => charagenda.push(`•**${character.talent}** for **${character.name}**`));
			todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}**`));

			let maxPage;
			if (charagenda.length > wepagenda.length) {
				maxPage = Math.ceil(todaysChars.length / 10);
			} else {
				maxPage = Math.ceil(todaysWeps.length / 10);
			}

			const finalcharlist = getfinalcharlist(charagenda, page);
			const finalweplist = getfinalweplist(wepagenda, page);
			const loclist = getlocations(todaysChars, todaysWeps);;

			const charfield = {
				name: charname,
				value: finalcharlist,
			};

			const wepfield = {
				name: wepname,
				value: finalweplist,
			};

			const locfield = {
				name: locname,
				value: loclist,
			};

			const footer = `Page ${page} of ${maxPage}`;

			if (page > 0 && page <= maxPage) {
				const agendaembed = new Discord.MessageEmbed()
					.setTitle(title)
					.setThumbnail(logo)
					.setAuthor(message.author.username)
					.setFooter(footer)
					.setColor('#00FF97');
				getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
				const msg = await message.channel.send({ embeds: [agendaembed] });
				/*
				if (maxPage > 1) {
					await msg.react('⏮️');
					await msg.react('◀️');
					await msg.react('▶️');
					await msg.react('⏭️');

					const leftleft = msg.createReactionCollector(leftleftfilter, { idle: 30000, dispose: true });
					const left = msg.createReactionCollector(leftfilter, { idle: 30000, dispose: true });
					const right = msg.createReactionCollector(rightfilter, { idle: 30000, dispose: true });
					const rightright = msg.createReactionCollector(rightrightfilter, { idle: 30000, dispose: true });

					leftleft.on('collect', r => {
						r.users.remove(message.author.id);
						page = 1;
						agendaembed.setFooter(`Page ${page} of ${maxPage}`);
						getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
						msg.edit({ embeds: [agendaembed] });
					});

					left.on('collect', r => {
						r.users.remove(message.author.id);
						page--;
						if (page < 1) {
							page = 1;
						}
						agendaembed.setFooter(`Page ${page} of ${maxPage}`);
						getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
						msg.edit({ embeds: [agendaembed] });
					});

					right.on('collect', r => {
						r.users.remove(message.author.id);
						page++;
						if (page > maxPage) {
							page = maxPage;
						}
						agendaembed.setFooter(`Page ${page} of ${maxPage}`);
						getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
						msg.edit({ embeds: [agendaembed] });
					});

					rightright.on('collect', r => {
						r.users.remove(message.author.id);
						page = maxPage;
						agendaembed.setFooter(`Page ${page} of ${maxPage}`);
						getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
						msg.edit({ embeds: [agendaembed] });
					});
				}
				*/
			} else if (page > maxPage) {
				const invalidpageembed = new Discord.MessageEmbed()
					.setTitle(title)
					.setColor('#00FF97')
					.addFields(
						{
							name: 'hol up',
							value: `Your agenda only has **${maxPage}** page(s) today.`,
						})
					.setFooter('>:(');
				message.channel.send({ embeds: [invalidpageembed] });
			} else {
				message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
			}
		}
	},
};