const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	category: 'Development',
	description: 'Checks database to make sure stored information matches local source information.',
	minArgs: 0,
	maxArgs: 0,
	callback: async ({ message }) => {
		if (message.author.id.toString() === '269910487133716480') {
			for (let i = 0; i < characters.length; i++) {
				const query = { 'savedCharacters.name': { $all: [ characters[i].name ] } };
				const update = { $set: { 'savedCharacters.$' : characters[i] } };
				await savedCharacterSchema.updateMany(query, update);
			}
			for (let i = 0; i < weapons.length; i++) {
				const query = { 'savedWeapons.name': { $all: [ weapons[i].name ] } };
				const update = { $set: { 'savedWeapons.$' : weapons[i] } };
				await savedWeaponSchema.updateMany(query, update);
			}
			message.channel.send('Successfully updated database.');
		} else {
			message.channel.send('You do not have permission to run this command.');
		}
	},
};