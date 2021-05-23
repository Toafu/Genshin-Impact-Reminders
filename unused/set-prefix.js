/* eslint-disable no-shadow-restricted-names */
const mongo = require('@root/mongo');
const commandPrefixSchema = require('@schemas/command-prefix-schema');
const commandBase = require('./command-base');

module.exports = {
	commands: 'setprefix',
	minArgs: 1,
	maxArgs: 1,
	expectedArgs: '<New prefix>',
	permissionError: 'You must be an admin to run this command',
	permissions: 'ADMINISTRATOR',
	callback: async (message, arguments) => {
		await mongo().then(async (mongoose) => {
			try {
				const guildId = message.guild.id;
				const prefix = arguments[0];

				await commandPrefixSchema.findOneAndUpdate(
					{
						_id: guildId,
					}, {
						_id: guildId,
						prefix,
					}, {
						upsert: true,
					});

				message.reply(`You have set the prefix to \`${prefix}\``);

				commandBase.updateCache(guildId, prefix);
			} finally {
				mongoose.connection.close();
			}
		});
	},
};