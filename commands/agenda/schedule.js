const Discord = require('discord.js');
const scheduleSchema = require('@schemas/schedule-schema');
const momentTimezone = require('moment-timezone');

module.exports = {
	name: 'schedule',
	category: 'Agenda',
	description: 'Set the time you\'ll receive your agenda daily.',
	minArgs: 1,
	maxArgs: 2,
	expectedArgs: '<HH:MM (24h) or "off"> <Timezone>',
	testOnly: true,
	init: (client) => {
		const checkForPosts = async () => {
			const now = new Date;
			const query = {
				date: { hour: now.getHours(), minute: now.getMinutes() },
			};

			const result = await scheduleSchema.find(query);

			if (result.length > 0) {
				const id = result[0]._id;
				client.users.fetch(id).then(user => {
					user.send('wow this works');
				});
			}

			setTimeout(checkForPosts, 1000 * 60);
		};

		checkForPosts();
	},
	callback: async ({ message, args, text }) => {
		const { author } = message;
		const { id } = author;

		if (text.toLowerCase() === 'off') {
			await scheduleSchema.findOneAndDelete({
				_id: id,
			});
			const stopembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(message.author.username)
				.addFields(
					{
						name: 'Removing Daily Reminder',
						value: 'You will no longer receive your daily agenda in your DMs.',
					});
			message.channel.send(stopembed);
			return;
		}

		const [time, timeZone] = args;

		const validTimeZones = momentTimezone.tz.names();
		if (!validTimeZones.includes(timeZone)) {
			message.reply('Unknown timezone! Please use one of the following: <https://gist.github.com/AlexzanderFlores/d511a7c7e97b4c3ae60cb6e562f78300>');
			return;
		}

		// const scheduleDate = momentTimezone.tz( //For Heroku
		// 	`${time}`,
		// 	'HH:mm',
		// 	timeZone,
		// );
		//const hour = extractTime[0] + offset;
		//const offset = momentTimezone.tz.zone(timeZone).utcOffset(scheduleDate) / 60;

		const extractTime = time.split(':');
		const hour = +extractTime[0];
		const minute = +extractTime[1];

		const schedule = {
			hour,
			minute,
		};

		message.channel.send('Your agenda will now appear daily in your DMs.');

		await scheduleSchema.findOneAndUpdate({
			_id: id,
		}, {
			$set: { date: schedule },
		}, {
			upsert: true,
		});
	},
};