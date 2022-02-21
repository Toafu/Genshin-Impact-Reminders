const Discord = require('discord.js');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	slash: 'both',
	name: 'unequip',
	aliases: 'removeweapon',
	category: 'Weapons',
	description: 'Removes a weapon to your agenda. `all` wipes your list. Slashes for bulk unequip. (24/The Flute)',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '<id or weapon name>',
	//testOnly: true,
	callback: async ({ message, text, interaction: msgInt }) => {
		let id;
		let author;
		if (message) {
			id = message.author.id;
			author = message.author.username;
		} else {
			id = msgInt.user.id;
			author = msgInt.user.username;
		}

		let query = text.toLowerCase();
		query = query.replace(/[’‘]/g, '\'');
		let index;

		if (query === 'all') {
			await savedWeaponSchema.findOneAndDelete({
				_id: id,
			});
			const removeallembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(author)
				.addField('Removing All Weapons', 'You unequipped all weapons.');
			if (message) {
				message.channel.send({ embeds: [removeallembed] });
			} else {
				msgInt.reply({ embeds: [removeallembed] });
			}
			return;
		}

		let queries;
		if (query.includes('/')) {
			queries = query.split('/');
		} else {
			queries = [query];
		}

		let success = [];
		let fail = [];
		for (const item of queries) {
			const querytest = Number(item);
			if (Number.isNaN(querytest) === true) {
				index = weapons.findIndex(weapon => weapon.name.toLowerCase() === item || weapon.name.toLowerCase() === `the ${item}`);
			} else {
				index = querytest;
			}

			if (index >= 0 && index < weapons.length) {
				await savedWeaponSchema.findOneAndUpdate({
					_id: id,
				}, {
					$pull: { savedWeapons: weapons[index] },
				}, {
					upsert: true,
				}).exec();
				success.push(`**${weapons[index].name}** (${weapons[index].stars})`);
			} else {
				fail.push(item);
			}
		}

		if (success.length === 2) {
			success = success.toString().replace(',', ' and ');
		} else if (success.length > 2) {
			success[success.length - 1] = 'and ' + success[success.length - 1];
			success = success.toString().replace(/,/g, ', ');
		}

		const embed = new Discord.MessageEmbed()
			.setColor('#00FF97')
			.setAuthor(author);
		if (success.length > 0) {
			embed.addField('Removing Weapons', `You have unequipped ${success}`);
		}
		if (fail.length > 0) {
			fail = fail.join('\n');
			embed.addField('We couldn\'t remove these weapons due to a typo or invalid ID:', fail)
				.setFooter('Use the  arsenal  command if you need help with spelling or finding IDs. Use slashes to remove multiple weapons (b!unequip 24/The Flute).');
		}
		if (message) {
			message.channel.send({ embeds: [embed] });
			return;
		}
		msgInt.reply({ embeds: [embed] });
	},
};