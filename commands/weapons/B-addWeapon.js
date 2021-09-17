const Discord = require('discord.js');
const savedWeaponSchema = require('@schemas/savedweapon-schema');
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	slash: 'both',
	name: 'equip',
	aliases: 'addweapon',
	category: 'Weapons',
	description: 'Adds a weapon to your agenda. `all` equips everything. Slashes for bulk equip.',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '(id or weapon name)',
	testOnly: true,
	callback: async ({ message, text, interaction: msgInt }) => {
		let id;
		if (message) {
			id = message.author.id;
		} else {
			id = msgInt.user.id;
		}

		let author;
		if (message) {
			author = message.author.username;
		} else {
			author = msgInt.user.username;
		}

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
			const addallweaponsembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(author)
				.addField('Adding All Weapons', 'I hope you realized what you just did.');
			if (message) {
				message.channel.send({ embeds: [addallweaponsembed] });
				return;
			}
			msgInt.reply({ embeds: [addallweaponsembed] });
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
					$addToSet: { savedWeapons: weapons[index] },
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
			embed.addField('Adding Weapons', `You have equipped ${success}`);
		}
		if (fail.length > 0) {
			fail = fail.join('\n');
			embed.addField('We couldn\'t add these weapons due to a typo or invalid ID:', fail)
				.setFooter('Use the  weapons  command if you need help with spelling or finding IDs. Use slashes to add multiple weapons (b!equip 24/The Flute).');
		}
		if (message) {
			message.channel.send({ embeds: [embed] });
			return;
		}
		msgInt.reply({ embeds: [embed] });
	},
};