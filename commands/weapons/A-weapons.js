const Discord = require('discord.js');
const getWeapon = require('@helper/getWeapons.js');
const weapons = getWeapon.getWeapons();

module.exports = {
	name: 'weapons',
	category: 'Weapons',
	description: 'Shows list of supported weapons with their ID\'s. Default page 1.',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(Page Number)',
	callback: ({ message, args }) => {
		let page;
		if (args.length === 0) {
			page = 1;
		} else {
			page = +args[0];
		}
		const maxPage = Math.ceil(weapons.length / 20);
		if (page > 0 && page <= maxPage) {
			const list = [];
			const newlist = [];
			weapons.forEach(weapon => list.push(`[${weapon.id}] **${weapon.name}** (${weapon.stars})`));
			for (let i = (page * 20) - 20; i < page * 20; i++) {
				newlist.push(list[i]);
			}

			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Weapons List__')
				.setColor('#00FF97')
				.addFields(
					{
						name: 'A→Z\n[ID] [Name] [Rarity]',
						value: newlist,
						inline: true,
					})
				.setFooter(`Page ${page} of ${maxPage}`);
			message.channel.send(embed);
		} else if (page > maxPage) {
			const embed = new Discord.MessageEmbed()
				.setTitle('__Supported Weapons List__')
				.setColor('#00FF97')
				.addFields(
					{
						name: 'hol up',
						value: `We only have **${maxPage}** pages right now! More will come soon.`,
						inline: true,
					})
				.setFooter('>:(');
			message.channel.send(embed);
		} else {
			message.channel.send('Incorrect syntax. Use b!weapons (Page Number)');
		}
	},
};