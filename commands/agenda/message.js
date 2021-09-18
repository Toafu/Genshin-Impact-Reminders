const Discord = require('discord.js');
const savedMessageSchema = require('@schemas/custommessage-schema');

module.exports = {
	slash: 'both',
	name: 'message',
	category: 'Agenda',
	description: 'Add a custom message to the bottom of the agenda. No arguments will show your saved message.',
	minArgs: 0,
	maxArgs: 200,
	expectedArgs: '(Message)',
	//testOnly: true,
	callback: async ({ message, args, text, interaction: msgInt }) => {
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

		if (args.length > 0) {
			const customtext = text;
			if (customtext.toLowerCase() === 'clear') {
				await savedMessageSchema.findOneAndDelete({
					_id: id,
				});
				const clearembed = new Discord.MessageEmbed()
					.setTitle(`${author}, you have removed your custom message.`)
					.setColor('#00FF97')
					.setDescription('This field will be omitted from your agenda.');
				if (message) {
					message.channel.send({ embeds: [clearembed] });
				} else {
					msgInt.reply({ embeds: [clearembed] });
				}

				return;
			}

			if (customtext.length > 200) {
				if (message) {
					message.channel.send('Your custom message is too big! Please limit it to 200 characters.');
				} else {
					msgInt.reply('Your custom message is too big! Please limit it to 200 characters.');
				}
				return;
			}
			await savedMessageSchema.findOneAndUpdate({
				_id: id,
			}, {
				savedMessage: customtext,
			}, {
				upsert: true,
			});
			const updatedembed = new Discord.MessageEmbed()
				.setTitle('Updated Custom Message Text')
				.setColor('#00FF97')
				.setDescription(`${author}, this message will now always appear at the bottom of your agenda: \n\n "${customtext}"`);
			if (message) {
				message.channel.send({ embeds: [updatedembed] });
			} else {
				msgInt.reply({ embeds: [updatedembed] });
			}

		} else {
			const result = await savedMessageSchema.find({ _id: id });
			if (result.length === 0) {
				const nothingembed = new Discord.MessageEmbed()
					.setTitle(`${author}, you currently do not have a custom message set.`)
					.setColor('#00FF97')
					.setDescription('Add one with `b!message` and it will appear at the bottom of your agenda.');
				if (message) {
					message.channel.send({ embeds: [nothingembed] });
				} else {
					msgInt.reply({ embeds: [nothingembed] });
				}

			} else {
				const showembed = new Discord.MessageEmbed()
					.setTitle(`${author}, this message is currently showing at the bottom of your agenda:`)
					.setColor('#00FF97')
					.setDescription(result[0].savedMessage);
				if (message) {
					message.channel.send({ embeds: [showembed] });
				} else {
					msgInt.reply({ embeds: [showembed] });
				}

			}
		}
	},
};