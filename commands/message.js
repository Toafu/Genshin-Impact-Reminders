/* eslint-disable no-shadow-restricted-names */
//const Discord = require('discord.js');
const mongo = require('@root/mongo');
const savedMessageSchema = require('@schemas/custommessage-schema');

module.exports = {
	commands: 'message',
	minArgs: 0,
	maxArgs: null,
	expectedArgs: '<Message>',
	callback:  async (message, arguments, text) => {
		const { author } = message;
		const { id } = author;

		if (arguments.length > 0) {
			const customtext = text;

			if (customtext.length > 200) {
				message.channel.send('Your custom message is too big! Please limit it to 200 characters.');
				return;
			}

			await mongo().then(async mongoose => {
				try {
					await savedMessageSchema.findOneAndUpdate({
						_id: id,
					}, {
						$addToSet: { savedMessage: customtext },
					}, {
						upsert: true,
					});
				} finally {
					mongoose.connection.close();
				}
			});
			message.channel.send('Custom message updated');
		} else {
			await mongo().then(async mongoose => {
				try {
					const result = await savedMessageSchema.find({ _id: id });
					console.log(result);
				} finally {
					mongoose.connection.close();
				}
			});
		}
	},
};