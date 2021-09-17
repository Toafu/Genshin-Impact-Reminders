const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const savedMessageSchema = require('@schemas/custommessage-schema');
const timezoneSchema = require('@schemas/timezone-schema');
const scheduleSchema = require('@schemas/schedule-schema');
const momentTimezone = require('moment-timezone');
const ahelp = require('@helper/agendahelper');

module.exports = {
	slash: 'both',
	name: 'schedule',
	category: 'Agenda',
	description: 'Set the time you\'ll receive your agenda daily.',
	minArgs: 0,
	maxArgs: 2,
	expectedArgs: '<hh mm or off> <timezone or gmt offset>',
	testOnly: true,
	init: (client) => {
		const checkForPosts = async () => {
			const now = new Date;
			const query = {
				'date.hour': now.getHours(), //For Heroku
				//'date.hour': now.getHours() + 5,
				'date.minute': now.getMinutes(),
			};

			const result = await scheduleSchema.find(query);

			if (result.length > 0) {
				const id = result[0]._id;

				const zone = await timezoneSchema.find({ _id: id });
				const { server, offset } = ahelp.getTimeZone(zone);
				const { day, title, logo } = ahelp.getTime(server, offset);
				const { nocharstoday, nowepstoday, nothing } = ahelp.getNothingFields();

				const user = await client.users.fetch(id).catch(console.error);

				const nothingtodayembed = new Discord.MessageEmbed()
					.setTitle(title)
					.setThumbnail(logo)
					.setAuthor(user.username)
					.setColor('#00FF97')
					.addField('You don\'t need to farm today (or you aren\'t tracking anything yet!).', 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>');

				const availablematerials = ahelp.getMaterials(day);

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

				let page;
				const { gettodaysChars, gettodaysWeps, sortChars, sortWeps, getfinalcharlist, getfinalweplist, getlocations } = ahelp.getFunctions(day, page, availablematerials, nocharstoday, nowepstoday, customtitle, customtext);

				const charname = '__Today\'s Talents__';
				const wepname = '__Today\'s Weapons__';
				const locname = '__Places to Go__';

				if (charresult.length === 0 && wepresult.length === 0) { // If MongoDB has nothing on the user
					const nonexistantembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor(user.username)
						.setColor('#00FF97')
						.addFields(nothing);
					if (customtext) {
						nonexistantembed.addField(customtitle, customtext);
					}
					client.users.fetch(id).then(user => {
						user.send({ embeds: [nonexistantembed] });
					});
				} else if (charresult.length === 0 && wepresult.length > 0) { // If MongoDB can find only weapons
					gettodaysWeps(todaysWeps, wepresult);
					if (todaysWeps.length === 0) {
						client.users.fetch(id).then(user => {
							user.send({ embeds: [nothingtodayembed] });
						});
						return;
					}
					sortWeps(todaysWeps);
					const wepagenda = [];
					todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}.**`));
					const maxPage = Math.ceil(todaysWeps.length / 10);
					for (page = 1; page <= maxPage; page++) {
						const finalweplist = getfinalweplist(wepagenda, page);
						const loclist = getlocations(todaysChars, todaysWeps);

						const wepfield = {
							name: wepname,
							value: finalweplist,
						};

						const locfield = {
							name: locname,
							value: loclist,
						};

						const footer = `Page ${page} of ${maxPage}`;

						const agendaembed = new Discord.MessageEmbed()
							.setTitle(title)
							.setThumbnail(logo)
							.setAuthor(user.username)
							.setFooter(footer)
							.setColor('#00FF97')
							.addFields(nocharstoday, wepfield, locfield);
						if (customtext) {
							agendaembed.addField(customtitle, customtext);
						}
						client.users.fetch(id).then(user => {
							user.send({ embeds: [agendaembed] });
						});
					}
				} else if (charresult.length > 0 && wepresult.length === 0) { // If MongoDB can find only characters
					gettodaysChars(todaysChars, charresult);
					if (todaysChars.length === 0) {
						client.users.fetch(id).then(user => {
							user.send({ embeds: [nothingtodayembed] });
						});
						return;
					}
					sortChars(todaysChars);
					const charagenda = [];
					todaysChars.forEach(character => charagenda.push(`•**${character.talent}** for **${character.name}.**`));
					const maxPage = Math.ceil(todaysChars.length / 10);
					for (page = 1; page <= maxPage; page++) {
						const finalcharlist = getfinalcharlist(charagenda, page);
						if (charagenda.length > 0) {
							const loclist = getlocations(todaysChars, todaysWeps);

							const charfield = {
								name: charname,
								value: finalcharlist,
							};

							const locfield = {
								name: locname,
								value: loclist,
							};

							const footer = `Page ${page} of ${maxPage}`;

							const agendaembed = new Discord.MessageEmbed()
								.setTitle(title)
								.setThumbnail(logo)
								.setAuthor(user.username)
								.setFooter(footer)
								.setColor('#00FF97')
								.addFields(charfield, nowepstoday, locfield);
							if (customtext) {
								agendaembed.addField(customtitle, customtext);
							}
							client.users.fetch(id).then(user => {
								user.send({ embeds: [agendaembed] });
							});
						} else if (finalcharlist.length === 0) {
							client.users.fetch(id).then(user => {
								user.send({ embeds: [nothingtodayembed] });
							});
						}
					}
				} else { //If MongoDB found both characters and weapons
					gettodaysChars(todaysChars, charresult);
					gettodaysWeps(todaysWeps, wepresult);

					if (todaysChars.length === 0 && todaysWeps.length === 0) {
						client.users.fetch(id).then(user => {
							user.send({ embeds: [nothingtodayembed] });
						});
						return;
					}

					sortChars(todaysChars);
					sortWeps(todaysWeps);

					const charagenda = [];
					const wepagenda = [];

					todaysChars.forEach(character => charagenda.push(`•**${character.talent}** for **${character.name}.**`));
					todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}.**`));
					let maxPage;
					if (charagenda.length > wepagenda.length) {
						maxPage = Math.ceil(todaysChars.length / 10);
					} else {
						maxPage = Math.ceil(todaysWeps.length / 10);
					}
					for (page = 1; page <= maxPage; page++) {
						const finalcharlist = getfinalcharlist(charagenda, page);
						const finalweplist = getfinalweplist(wepagenda, page);
						const loclist = getlocations(todaysChars, todaysWeps);

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

						const agendaembed = new Discord.MessageEmbed()
							.setTitle(title)
							.setThumbnail(logo)
							.setAuthor(user.username)
							.setFooter(footer)
							.setColor('#00FF97')
							.addFields(charfield, wepfield, locfield);
						client.users.fetch(id).then(user => {
							user.send({ embeds: [agendaembed] });
						});
					}
				}
			}

			setTimeout(checkForPosts, 1000 * 60);
		};

		checkForPosts();
	},
	callback: async ({ message, args, text, interaction: msgInt }) => {
		const { author } = message;
		const { id } = author;

		const validatehour = hour => {
			if (hour < 0) {
				hour += 24;
			} else if (hour > 23) {
				hour -= 24;
			}
		};

		if (args.length === 0) {
			const query = { _id: id };
			const result = await scheduleSchema.find(query);
			const embed = new Discord.MessageEmbed()
				.setTitle('Check Scheduled Time');
			if (result.length > 0) {
				const hour = result[0].date.hour;
				const minute = String(result[0].date.minute).padStart(2, '0');
				const offset = result[0].date.offset * -1;
				let displayhour = hour + offset;
				validatehour(displayhour);
				displayhour = String(displayhour).padStart(2, '0');
				let GMToffset;
				if (offset > -1) {
					GMToffset = `+${offset}`;
				} else {
					GMToffset = offset;
				}
				embed.setDescription(`Your agenda will be DM'd to you at **${displayhour}:${minute} GMT${GMToffset}**.`);
			} else {
				embed.setDescription('Your agenda hasn\'t been scheduled yet! Run **b!schedule <HH:mm (24h)> <Timezone/GMT Offset>** to automatically receive a daily agenda.');
			}
			if (message) {
				message.channel.send({ embeds: [embed] });
			} else {
				msgInt.reply({ embeds: [embed] });
			}
			return;
		}

		if (text.toLowerCase() === 'off') {
			await scheduleSchema.findOneAndDelete({
				_id: id,
			});
			const stopembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(message.author.username)
				.addFields(
					{
						name: 'Unsubscribing From Daily Reminder',
						value: 'You will no longer receive your daily agenda in your DMs.',
					});
			if (message) {
				message.channel.send({ embeds: [stopembed] });
			} else {
				msgInt.reply({ embeds: [stopembed] });
			}
			return;
		}

		const [time, timeZone] = args;
		if (time && !timeZone) {
			message.reply('Please input a valid time zone or a GMT offset.');
			return;
		}
		let GMToffset;
		let offset;

		if (timeZone.includes('GMT+') || timeZone.includes('GMT-')) {
			const extractOffset = timeZone.split(/[+-]+/);
			if (timeZone.includes('+')) {
				GMToffset = +extractOffset[1];
				offset = GMToffset * -1;
			} else if (timeZone.includes('-')) {
				GMToffset = +extractOffset[1] * -1;
				offset = GMToffset * -1;
			}
		} else {
			const validTimeZones = momentTimezone.tz.names();
			if (!validTimeZones.includes(timeZone)) {
				message.reply('Unknown timezone! Please use a valid GMT offset or one of the following: <https://gist.github.com/AlexzanderFlores/d511a7c7e97b4c3ae60cb6e562f78300>');
				return;
			}

			const scheduleDate = momentTimezone.tz(
				`${time}`,
				'HH:mm',
				timeZone,
			);
			offset = momentTimezone.tz.zone(timeZone).utcOffset(scheduleDate) / 60; //Positive is behind UTC/Negative in front
			GMToffset = offset * -1;
		}

		if (GMToffset > -1) {
			GMToffset = String(`+${GMToffset}`);
		}

		const extractTime = time.split(':');
		let hour = Number(extractTime[0]);
		if (hour < 0 || hour > 23) {
			if (message) {
				message.reply('Invalid time! Please use a valid hour.');
			} else {
				msgInt.reply('Invalid time! Please use a valid hour.');
			}
			return;
		}
		const minute = Number(extractTime[1]);
		if (minute < 0 || minute > 59) {
			if (message) {
				message.reply('Invalid time! Please use a valid minute.');
			} else {
				msgInt.reply('Invalid time! Please use a valid minute.');
			}
			return;
		}

		const startembed = new Discord.MessageEmbed()
			.setColor('#00FF97')
			.setAuthor(message.author.username)
			.addFields(
				{
					name: 'Scheduling Daily Reminder',
					value: `You will receive your agenda in your DMs at **${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} GMT${GMToffset}**.`,
				});
		if (message) {
			message.channel.send({ embeds: [startembed] });
		} else {
			msgInt.send({ embeds: [startembed] });
		}

		hour += offset;
		validatehour(hour);

		const schedule = {
			hour,
			minute,
			offset,
		};

		await scheduleSchema.findOneAndUpdate({
			_id: id,
		}, {
			$set: { date: schedule },
		}, {
			upsert: true,
		});
	},
};