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
		const msg = await message.channel.send('Updating database...');
		if (message.author.id.toString() === '269910487133716480') {
			for (let i = 0; i < characters.length; i++) {
				const savedCharData = {
					name: characters[i].name,
					element: characters[i].element,
					talent: characters[i].talent,
					days: characters[i].days,
					id: i,
					location: characters[i].location,
				};
				const query = { 'savedCharacters.name': { $all: [characters[i].name] } };
				const update = { $set: { 'savedCharacters.$': savedCharData } };
				await savedCharacterSchema.updateMany(query, update);
			}
			for (let i = 0; i < weapons.length; i++) {
				const savedWepData = {
					name: weapons[i].name,
					stars: weapons[i].stars,
					id: i,
					mat: weapons[i].mat,
					days: weapons[i].days,
					location: weapons[i].location,
				};
				const query = { 'savedWeapons.name': { $all: [weapons[i].name] } };
				const update = { $set: { 'savedWeapons.$': savedWepData } };
				await savedWeaponSchema.updateMany(query, update);
			}
			msg.edit('Successfully updated database.');
		} else {
			message.channel.send('You do not have permission to run this command.');
		}
	},
};