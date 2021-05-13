const mongo = require('../mongo');
const savedCharacterSchema = require('../schemas/savedcharacter-schema');
const getChar = require('../getChars');
const characters = getChar.getChars();

module.exports = {
	commands: 'updatedb', //Can include all aliases of a command
	minArgs: 0,
	maxArgs: 0,
	callback: async message => {
		if (message.author.id.toString() === '269910487133716480') {
			await mongo().then(async mongoose => {
				try {
					for (let i = 0; i < characters.length; i++) {
						const query = { 'savedCharacters.name': { $all: [ characters[i].name ] } };
						const update = { $set: { 'savedCharacters.$.id' : characters[i].id } };
						await savedCharacterSchema.updateMany(query, update);
					}
					message.channel.send('Successfully updated database.');

				} finally {
					mongoose.connection.close();
				}
			});
		} else {
			message.channel.send('You do not have permission to run this command.');
		}
	},
};