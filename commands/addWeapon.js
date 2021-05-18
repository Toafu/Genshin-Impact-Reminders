/* eslint-disable no-shadow-restricted-names */
const mongo = require('@root/mongo');
const Discord = require('discord.js');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	commands: ['addweapon', 'equip'],
	minArgs: 1,
	maxArgs: 6,
	expectedArgs: '<ID/Weapon Name>',
	callback: async (message) => {
		const { author } = message;
		const { id } = author;
		let query;
		let index;
		if (message.content.startsWith('b!addweapon ')) {
			query = message.content.replace('b!addweapon ', '').toLowerCase();
		} else if (message.content.startsWith('b!equip ')) {
			query = message.content.replace('b!equip ', '').toLowerCase();
		}

		if (query === 'all') {
			await mongo().then(async mongoose => {
				try {
					await savedWeaponSchema.findOneAndUpdate({
						_id: id,
					}, {
						$addToSet: { savedWeapons: weapons },
					}, {
						upsert: true,
					});
				} finally {
					mongoose.connection.close();
				}
			});
		}

		const querytest = Number(query);
		if (Number.isNaN(querytest) === true) {
			index = weapons.findIndex(weapon => weapon.name.toLowerCase() === query);
		} else {
			index = querytest;
		}

		if(index >= 0 && index < weapons.length) {
			await mongo().then(async mongoose => {
				try {
					await savedWeaponSchema.findOneAndUpdate({
						_id: id,
					}, {
						$addToSet: { savedWeapons: weapons[index] },
					}, {
						upsert: true,
					}).exec();
				} finally {
					mongoose.connection.close();
				}
			});
			const embed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(message.author.username)
				.addFields(
					{
						name: 'Adding Weapon',
						value: `You have equipped **${weapons[index].name}** (${weapons[index].stars})`,
						inline: true,
					});
			message.channel.send(embed);
		} else {
			message.channel.send(`Please use a valid ID [\`0-${weapons.length - 1}\`] or weapon name.`);
		}
	},
};