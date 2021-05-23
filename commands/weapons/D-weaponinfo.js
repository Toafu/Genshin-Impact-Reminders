const Discord = require('discord.js');
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();
const getEmotes = require('@helper/getEmote');

module.exports = {
	name: 'weaponinfo',
	aliases: 'winfo',
	category: 'Weapons',
	description: 'Shows detailed information about a specific weapon',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '<ID/Weapon Name>',
	callback: ({ message, text }) => {
		let index;
		let query = text.toLowerCase();
		query = query.replace(/[’‘]/g, '\'');

		const querytest = Number(query);
		if (Number.isNaN(querytest) === true) {
			index = weapons.findIndex(person => person.name.toLowerCase() === query);
		} else {
			index = querytest;
		}

		if (index >= 0 && index < weapons.length) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`**${weapons[index].name}** (${weapons[index].stars}) [ID: ${weapons[index].id}]`)
				.setImage(weapons[index].img)
				.setColor('#00FF97')
				.addFields(
					{
						name: 'Type',
						value: `${weapons[index].type}`,
						inline: true,
					},
					{
						name: 'Passive Stat',
						value: `${weapons[index].stat}`,
						inline: true,
					},
					{
						name: 'How to Obtain',
						value: `${weapons[index].obtain}`,
						inline: true,
					},
					{
						name: 'Passive Ability',
						value: `${weapons[index].passive}`,
						inline: false,
					},
					{
						name: 'Ascension Info',
						value: `•To ascend ${weapons[index].name}, you'll need **${getEmotes.getEmote(weapons[index].mat)}** from domains on **${weapons[index].days.replace(/["]+/g, '')}**, and **${weapons[index].loot1}** and **${weapons[index].loot2}** from normal enemies.`,
						inline: false,
					});
			message.channel.send(embed);
		} else {
			message.channel.send(`Please use a valid ID [\`0-${weapons.length - 1}\`] or weapon name.`);
		}
	},
};