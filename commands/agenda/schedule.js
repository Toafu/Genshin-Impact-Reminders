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
	//testOnly: true,
	init: (client) => {
		const checkForPosts = async () => {
			const now = new Date;
			const query = {
				'date.hour': now.getHours(), //For Heroku
				//'date.hour': now.getHours() + 4,
				'date.minute': now.getMinutes(),
			};

			console.log(`Searching for scheduled agenda at ${now.getHours()}:${now.getMinutes()}`);

			const result = await scheduleSchema.find(query);

			if (result.length > 0) {
				for (let i = 0; i < result.length; i++) {
					const id = result[i]._id;
					console.log(`Found agenda for ${id} at ${now.getHours()}:${now.getMinutes()}`);

					const channel = client.channels.cache.get('929745519876640789');
					channel.send(`Attempting to send automated agenda to ${id}`);
					
					const zone = await timezoneSchema.find({ _id: id });
					const { server, offset } = ahelp.getTimeZone(zone);
					const { day, title, logo } = ahelp.getTime(server, offset);
					const { nocharstoday, nowepstoday, nothing } = ahelp.getNothingFields();

					const user = await client.users.fetch(id).catch(console.error);

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

					const nonexistantembed = new Discord.MessageEmbed()
						.setTitle(title)
						.setThumbnail(logo)
						.setAuthor({ name: user.username })
						.setColor('#00FF97')
						.addFields(nothing);
					if (customtext) {
						nonexistantembed.addField(customtitle, customtext);
					}

					const { gettodaysChars,
						gettodaysWeps,
						sortChars,
						sortWeps,
						getfinalcharlist,
						getfinalweplist,
						getlocations,
						getfields } = ahelp.getFunctions(day, availablematerials, nocharstoday, nowepstoday, customtitle, customtext);

					const charname = '__Today\'s Talents__';
					const wepname = '__Today\'s Weapons__';
					const locname = '__Places to Go__';

					if (!charresult[0] && !wepresult[0]) { //No record of user
						user.send({ embeds: [nonexistantembed] }).catch(console.error);
						return;
					}

					const charagenda = [];
					if (charresult[0]) {
						gettodaysChars(todaysChars, charresult);
						if (todaysChars.length > 0) {
							sortChars(todaysChars);
							todaysChars.forEach(character => charagenda.push(`•**${character.talent}** for **${character.name}**`));
						}
					}

					const wepagenda = [];
					if (wepresult[0]) {
						gettodaysWeps(todaysWeps, wepresult);
						if (todaysWeps.length > 0) {
							sortWeps(todaysWeps);
							todaysWeps.forEach(character => wepagenda.push(`•**${character.mat}** for **${character.name}**`));
						}
					}

					const loclist = getlocations(todaysChars, todaysWeps);
					const locfield = {
						name: locname,
						value: loclist,
					};

					const maxPage = Math.max(Math.ceil(todaysChars.length / 10), Math.ceil(todaysWeps.length / 10));

					for (let page = 1; page <= maxPage; ++page) {
						const agendaembed = new Discord.MessageEmbed()
							.setTitle(title)
							.setThumbnail(logo)
							.setAuthor({ name: user.username })
							.setColor('#00FF97');

						const agenda = {
							agendaembed,
							charname,
							wepname,
							charagenda,
							wepagenda,
							locfield,
						};

						agendaembed.setFooter({ text: `Page ${page} of ${maxPage}` });
						getfields(agenda, page);
						user.send({ embeds: [agendaembed] }).catch(console.error);
					}
				} //For each person
			}
			setTimeout(checkForPosts, 1000 * 60);
		};
		checkForPosts();
	},
	callback: async ({ message, args, text, interaction: msgInt }) => {
		let id;
		let author;
		if (message) {
			id = message.author.id;
			author = message.author.username;
		} else {
			id = msgInt.user.id;
			author = msgInt.user.username;
		}

		if (args.length === 0) {
			const query = { _id: id };
			const result = await scheduleSchema.find(query);
			const embed = new Discord.MessageEmbed()
				.setTitle('Check Scheduled Time');
			if (result.length > 0) {
				const hour = result[0].date.hour;
				const minute = String(result[0].date.minute).padStart(2, '0');
				const offset = result[0].date.offset * -1;
				let displayhour = (hour + 24 + offset) % 24; //+24 since we don't want negative modulus
				displayhour = String(displayhour).padStart(2, '0');
				let GMToffset = offset;
				if (offset > -1) {
					GMToffset = `+${offset}`;
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
				.setAuthor({ name: author })
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
			console.log(`Calculated offset is ${offset}`);
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
		const minute = Number(extractTime[1]);
		if (isNaN(minute) || isNaN(hour)) {
			if (message) {
				message.reply('Invalid format! Make sure to use \`HH:mm\` formatting.');
			} else {
				msgInt.reply('Invalid format! Make sure to use \`HH:mm\` formatting.');
			}
			return;
		}
		if (hour < 0 || hour > 23) {
			if (message) {
				message.reply('Invalid time! Please use a valid hour.');
			} else {
				msgInt.reply('Invalid time! Please use a valid hour.');
			}
			return;
		}
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
			.setAuthor({ name: author })
			.addFields(
				{
					name: 'Scheduling Daily Reminder',
					value: `You will receive your agenda in your DMs at **${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} GMT${GMToffset}**.`,
				});
		if (message) {
			message.channel.send({ embeds: [startembed] });
		} else {
			msgInt.reply({ embeds: [startembed] });
		}

		const schedule = {
			hour: (hour + 24 + offset) % 24,
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