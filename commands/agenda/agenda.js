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
	//testOnly: true,
	callback: async ({ message, args, interaction: msgInt, channel }) => {
		let id;
		if (message) {
			id = message.author.id;
		} else {
			id = msgInt.user.id;
		}

		let author;
		if (message) {
			author = message.author.username;
		} else {
			author = msgInt.user.username;
		}

		const zone = await timezoneSchema.find({ _id: id });
		const { server, offset } = ahelp.getTimeZone(zone);
		const { day, title, logo } = ahelp.getTime(server, offset);
		const { nocharstoday, nowepstoday, nothing } = ahelp.getNothingFields();

		const nothingtodayembed = new Discord.MessageEmbed()
			.setTitle(title)
			.setThumbnail(logo)
			.setAuthor(author)
			.setColor('#00FF97')
			.addField('You don\'t need to farm today (or you aren\'t tracking anything yet!).', 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>');

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

		if (msgresult.length > 0) {
			customtext = msgresult[0].savedMessage;
			customtitle = '__Your Custom Message__';
		}

		const { gettodaysChars, gettodaysWeps, sortChars, sortWeps, getfinalcharlist, getfinalweplist, getlocations, getfields } = ahelp.getFunctions(day, page, availablematerials, nocharstoday, nowepstoday, customtitle, customtext);

		const charname = '__Today\'s Talents__';
		const wepname = '__Today\'s Weapons__';
		const locname = '__Places to Go__';

		if (charresult.length === 0 && wepresult.length === 0) { // If MongoDB has nothing on the user
			const nonexistantembed = new Discord.MessageEmbed()
				.setTitle(title)
				.setThumbnail(logo)
				.setAuthor(author)
				.setColor('#00FF97')
				.addFields(nothing);
			if (customtext) {
				nonexistantembed.addField(customtitle, customtext);
			}
			if (message) {
				message.channel.send({ embeds: [nonexistantembed] });
			} else {
				msgInt.reply({ embeds: [nonexistantembed] });
			}
		} else if (charresult.length === 0 && wepresult.length > 0) { // If MongoDB can find only weapons
			gettodaysWeps(todaysWeps, wepresult);
			if (todaysWeps.length === 0) {
				if (message) {
					message.channel.send({ embeds: [nothingtodayembed] });
				} else {
					msgInt.reply({ embeds: [nothingtodayembed] });
				}
				return;
			}
			sortWeps(todaysWeps);
			const wepagenda = [];
			todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}.**`));
			const maxPage = Math.ceil(todaysWeps.length / 10);

			let finalweplist = getfinalweplist(wepagenda, page);
			const loclist = getlocations(todaysChars, todaysWeps);

			const invalidpageembed = new Discord.MessageEmbed()
				.setTitle(title)
				.setColor('#00FF97')
				.addField('hol up', `Your agenda only has **${maxPage}** page(s) today.`)
				.setFooter('>:(');

			let wepfield = {
				name: wepname,
				value: finalweplist,
			};

			const locfield = {
				name: locname,
				value: loclist,
			};

			const footer = `Page ${page} of ${maxPage}`;

			if (maxPage === 0) {
				if (message) {
					message.channel.send({ embeds: [nothingtodayembed] });
				} else {
					msgInt.reply({ embeds: [nothingtodayembed] });
				}
				return;
			}

			if (page > 0 && page <= maxPage) {
				if (wepagenda.length > 0) {
					const agendaembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(author)
						.setFooter(footer)
						.setColor('#00FF97')
						.addFields(nocharstoday, wepfield, locfield);
					if (customtext) {
						agendaembed.addField(customtitle, customtext);
					}

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
							time: 1000 * 10,
						});

						collector.on('collect', async i => {
							if (i.customId === 'first_page') {
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
								await i.update({ embeds: [agendaembed], components: [row] });
							};
							if (i.customId === 'prev_page') {
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
								await i.update({ embeds: [agendaembed], components: [row] });
							};
							if (i.customId === 'next_page') {
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
								await i.update({ embeds: [agendaembed], components: [row] });
							};
							if (i.customId === 'last_page') {
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
								await i.update({ embeds: [agendaembed], components: [row] });
							};
						});
					} else {
						if (message) {
							message.channel.send({ embeds: [agendaembed] });
						} else {
							msgInt.reply({ embeds: [agendaembed] });
						}
					}	
				} else if (finalweplist.length === 0) {
					if (message) {
						message.channel.send({ embeds: [nothingtodayembed] });
					} else {
						msgInt.reply({ embeds: [nothingtodayembed] });
					}
				}
			} else if (page > maxPage) {
				if (message) {
					message.channel.send({ embeds: [invalidpageembed] });
				} else {
					msgInt.reply({ embeds: [invalidpageembed] });
				}
			} else {
				if (message) {
					message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
				} else {
					msgInt.reply('Incorrect syntax. Use b!agenda (Page Number)');
				}
			}
		} else if (charresult.length > 0 && wepresult.length === 0) { // If MongoDB can find only characters
			gettodaysChars(todaysChars, charresult);
			if (todaysChars.length === 0) {
				if (message) {
					message.channel.send({ embeds: [nothingtodayembed] });
				} else {
					msgInt.reply({ embeds: [nothingtodayembed] });
				}
				return;
			}
			sortChars(todaysChars);
			const charagenda = [];
			todaysChars.forEach(character => charagenda.push(`•**${character.talent}** for **${character.name}**`));
			const maxPage = Math.ceil(todaysChars.length / 10);
			let finalcharlist = getfinalcharlist(charagenda, page);
			const loclist = getlocations(todaysChars, todaysWeps);

			const invalidpageembed = new Discord.MessageEmbed()
				.setTitle(title)
				.setColor('#00FF97')
				.addField('hol up', `Your agenda only has **${maxPage}** page(s) today.`)
				.setFooter('>:(');

			let charfield = {
				name: charname,
				value: finalcharlist,
			};

			const locfield = {
				name: locname,
				value: loclist,
			};

			const footer = `Page ${page} of ${maxPage}`;

			if (maxPage === 0) {
				if (message) {
					message.channel.send({ embeds: [nothingtodayembed] });
				} else {
					msgInt.reply({ embeds: [nothingtodayembed] });
				}
				return;
			}

			if (page > 0 && page <= maxPage) {
				if (charagenda.length > 0) {
					const agendaembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(author)
						.setFooter(footer)
						.setColor('#00FF97')
						.addFields(charfield, nowepstoday, locfield);
					if (customtext) {
						agendaembed.addField(customtitle, customtext);
					}

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
							time: 1000 * 10,
						});

						collector.on('collect', async i => {
							if (i.customId === 'first_page') {
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
								await i.update({ embeds: [agendaembed], components: [row] });
							};
							if (i.customId === 'prev_page') {
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
								await i.update({ embeds: [agendaembed], components: [row] });
							};
							if (i.customId === 'next_page') {
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
								await i.update({ embeds: [agendaembed], components: [row] });
							};
							if (i.customId === 'last_page') {
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
								await i.update({ embeds: [agendaembed], components: [row] });
							};
						});
					} else {
						if (message) {
							message.channel.send({ embeds: [agendaembed] });
						} else {
							msgInt.reply({ embeds: [agendaembed] });
						}
					}
				} else if (finalcharlist.length === 0) {
					if (message) {
						message.channel.send({ embeds: [nothingtodayembed] });
					} else {
						msgInt.reply({ embeds: [nothingtodayembed] });
					}
				}
			} else if (page > maxPage) {
				if (message) {
					message.channel.send({ embeds: [invalidpageembed] });
				} else {
					msgInt.reply({ embeds: [invalidpageembed] });
				}
			} else {
				if (message) {
					message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
				} else {
					msgInt.reply('Incorrect syntax. Use b!agenda (Page Number)');
				}
			}

		} else { //If MongoDB found both characters and weapons
			gettodaysChars(todaysChars, charresult);
			gettodaysWeps(todaysWeps, wepresult);

			if (todaysChars.length === 0 && todaysWeps.length === 0) {
				if (message) {
					message.channel.send({ embeds: [nothingtodayembed] });
				} else {
					msgInt.reply({ embeds: [nothingtodayembed] });
				}
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
			const loclist = getlocations(todaysChars, todaysWeps);

			const invalidpageembed = new Discord.MessageEmbed()
				.setTitle(title)
				.setColor('#00FF97')
				.addField('hol up', `Your agenda only has **${maxPage}** page(s) today.`)
				.setFooter('>:(');

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
					.setAuthor(author)
					.setFooter(footer)
					.setColor('#00FF97');
				getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);

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
						time: 1000 * 10,
					});

					collector.on('collect', async i => {
						if (i.customId === 'first_page') {
							page = 1;
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
							await i.update({ embeds: [agendaembed], components: [row] });
						};
						if (i.customId === 'prev_page') {
							page--;
							if (page < 1) {
								page = 1;
							}
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
							await i.update({ embeds: [agendaembed], components: [row] });
						};
						if (i.customId === 'next_page') {
							page++;
							if (page > maxPage) {
								page = maxPage;
							}
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
							await i.update({ embeds: [agendaembed], components: [row] });
						};
						if (i.customId === 'last_page') {
							page = maxPage;
							agendaembed.setFooter(`Page ${page} of ${maxPage}`);
							getfields(agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield);
							await i.update({ embeds: [agendaembed], components: [row] });
						};
					});
				} else {
					if (message) {
						message.channel.send({ embeds: [agendaembed] });
					} else {
						msgInt.reply({ embeds: [agendaembed] });
					}
				}
			} else if (page > maxPage) {
				if (message) {
					message.channel.send({ embeds: [invalidpageembed] });
				} else {
					msgInt.reply({ embeds: [invalidpageembed] });
				}
			} else {
				if (message) {
					message.channel.send('Incorrect syntax. Use b!agenda (Page Number)');
				} else {
					msgInt.reply('Incorrect syntax. Use b!agenda (Page Number)');
				}
			}
		}
	},
};