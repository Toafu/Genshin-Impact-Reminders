/* eslint-disable no-shadow-restricted-names */
const mongo = require('@root/mongo');
const Discord = require('discord.js');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	commands: ['removeweapon', 'unequip'],
	minArgs: 1,
	maxArgs: 2,
	expectedArgs: '<ID/Weapon Name>',
	callback: async (message, arguments, text) => {
		const { author } = message;
		const { id } = author;

		const query = text;
		let index;

		if (query === 'all') {
			await mongo().then(async mongoose => {
				try {
					await savedWeaponSchema.findOneAndDelete({
						_id: id,
					});
				} finally {
					mongoose.connection.close();
				}
			});
			const removeallembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(message.author.username)
				.addFields(
					{
						name: 'Removing All Weapons',
						value: 'You unequipped all weapons.',
						inline: true,
					});
			message.channel.send(removeallembed);
		} else {
			const querytest = Number(query);
			if (Number.isNaN(querytest) === true) {
				index = weapons.findIndex(person => person.name.toLowerCase() === query);
			} else {
				index = querytest;
			}

			if(index >= 0 && index < weapons.length) {
				await mongo().then(async mongoose => {
					try {
						await savedWeaponSchema.findOneAndUpdate({
							_id: id,
						}, {
							$pull: { savedWeapons: weapons[index] },
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
							name: 'Removing Weapon',
							value: `You have unequipped **${weapons[index].name}** (${weapons[index].stars})}`,
							inline: true,
						});
				message.channel.send(embed);
			} else {
				message.channel.send(`Please use a valid ID [\`0-${weapons.length - 1}\`] or weapon name.`);
			}
		}
	},
};