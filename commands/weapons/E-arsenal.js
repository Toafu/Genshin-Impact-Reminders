const Discord = require('discord.js');
const savedWeaponSchema = require('@schemas/savedweapon-schema');

module.exports = {
	name: 'arsenal',
	category: 'Weapons',
	description: 'View which weapons you are tracking. Defaults to page 1.',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '(Page Number)',
	callback: async ({ message, args }) => {
		const { author } = message;
		const { id } = author;

		const emptyembed = new Discord.MessageEmbed()
			.setTitle(`${author.username}'s Weapons List`)
			.setColor('#00FF97')
			.addFields(
				{
					name: `${author.username}, this list is empty.`,
					value: 'You currently have no weapons equipped. Add some weapons with b!equip <ID/Weapon Name>.',
					inline: true,
				});

		const result = await savedWeaponSchema.find({
			_id: id,
		});
		if (result.length > 0) {
			const dblist = result[0].savedWeapons;
			const trackList = [];
			let page;
			dblist.forEach(weapon => trackList.push(weapon));
			if (args.length === 0) {
				page = 1;
			} else {
				page = +args[0];
			}

			const list = [];
			const newlist = [];
			trackList.sort((wep1, wep2) => (wep1.id > wep2.id) ? 1 : -1);
			const maxPage = Math.ceil(trackList.length / 15);
			trackList.forEach(weapon => list.push(`[${weapon.id}] **${weapon.name}** (${weapon.stars})`));

			for (let i = (page * 15) - 15; i < page * 15; i++) {
				newlist.push(list[i]);
			}
			if (list.length > 0 && page <= maxPage) {
				const embed = new Discord.MessageEmbed()
					.setTitle(`${author.username}'s Weapons List`)
					.setColor('#00FF97')
					.setFooter(`Page ${page} of ${maxPage}`)
					.addFields(
						{
							name: 'You are currently spending countless hours upgrading:',
							value: newlist,
							inline: true,
						});
				message.channel.send(embed);
			} else if (list.length === 0) {
				message.channel.send(emptyembed);
			} else if (page > maxPage) {
				const maxpageembed = new Discord.MessageEmbed()
					.setTitle(`${author.username}'s Tracking List`)
					.setColor('#00FF97')
					.addFields(
						{
							name: 'hol up',
							value: `You only have **${maxPage}** page(s) worth of tracked weapons!`,
							inline: false,
						})
					.setFooter('>:(');
				message.channel.send(maxpageembed);
			} else {
				message.channel.send(emptyembed);
			}
		} else {
			message.channel.send(emptyembed);
		}
	},
};