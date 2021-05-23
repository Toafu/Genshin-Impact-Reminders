const Discord = require('discord.js');
const savedMessageSchema = require('@schemas/custommessage-schema');

module.exports = {
	name: 'message',
	category: 'Agenda',
	description: 'Add a custom message to the bottom of the agenda. No arguments will show your saved message.',
	minArgs: 0,
	maxArgs: 200,
	expectedArgs: '(Message)',
	callback:  async ({ message, args, text }) => {
		const { author } = message;
		const { id } = author;

		let result;

		if (args.length > 0) {
			const customtext = text;

			if (customtext.toLowerCase() === 'clear') {
				await savedMessageSchema.findOneAndDelete({
					_id: id,
				});
				const clearembed = new Discord.MessageEmbed()
					.setTitle(`${message.author.username}, you have removed your custom message.`)
					.setColor('#00FF97')
					.setDescription('This field will be omitted from your agenda.');
				message.channel.send(clearembed);
				return;
			}

			if (customtext.length > 200) {
				message.channel.send('Your custom message is too big! Please limit it to 200 characters.');
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
				.setDescription(`${message.author.username}, this message will now always appear at the bottom of your agenda: \n\n "${customtext}"`);
			message.channel.send(updatedembed);
		} else {
			result = await savedMessageSchema.find({ _id: id });
			if (result.length === 0) {
				const nothingembed = new Discord.MessageEmbed()
					.setTitle(`${message.author.username}, you currently do not have a custom message set.`)
					.setColor('#00FF97')
					.setDescription('Add one with `b!message` and it will appear at the bottom of your agenda.');
				message.channel.send(nothingembed);
			} else {
				const showembed = new Discord.MessageEmbed()
					.setTitle(`${message.author.username}, this message is currently showing at the bottom of your agenda:`)
					.setColor('#00FF97')
					.setDescription(result[0].savedMessage);
				message.channel.send(showembed);
			}
		}
	},
};