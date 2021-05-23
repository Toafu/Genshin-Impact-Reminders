const Discord = require('discord.js');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	name: 'equip',
	aliases: 'addweapon',
	category: 'Weapons',
	description: 'Adds a weapon to your agenda. `all` equips everything.',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '<ID/Weapon Name>',
	callback: async ({ message, text }) => {
		const { author } = message;
		const { id } = author;

		let query = text.toLowerCase();
		query = query.replace(/[’‘]/g, '\'');
		let index;

		if (query === 'all') {
			await savedWeaponSchema.findOneAndUpdate({
				_id: id,
			}, {
				$addToSet: { savedWeapons: weapons },
			}, {
				upsert: true,
			});
			const addallweaponembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(message.author.username)
				.addFields(
					{
						name: 'Adding All Weapons',
						value: 'I hope you realized what you just did.',
						inline: true,
					});
			message.channel.send(addallweaponembed);
		} else {
			const querytest = Number(query);
			if (Number.isNaN(querytest) === true) {
				index = weapons.findIndex(weapon => weapon.name.toLowerCase() === query);
			} else {
				index = querytest;
			}

			if(index >= 0 && index < weapons.length) {
				await savedWeaponSchema.findOneAndUpdate({
					_id: id,
				}, {
					$addToSet: { savedWeapons: weapons[index] },
				}, {
					upsert: true,
				}).exec();
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
		}
	},
};