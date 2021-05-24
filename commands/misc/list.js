const Discord = require('discord.js');

module.exports = {
	name: 'list',
	category: 'Misc',
	description: 'List of all commands',
	minArgs: 0,
	maxArgs: 0,
	callback: async message => {

		const embed = new Discord.MessageEmbed()
			.setTitle('Help/Command List (Default Prefix: b!)')
			.setDescription(`
			**list** - Display this list
			**help** - Get more details about each command
			**bruh** - bruh moment
			**characters (Page Number — Default 1)** - Displays supported characters
			**charinfo/cinfo [ID/Character Name]** - Displays information about a certain character
			**tracking (Page Number — Default 1)** - Displays a list of which characters you are currently tracking
			**add/track [ID/Character Name]** - Start tracking a character
			**remove/untrack [ID/Character Name/all]** - Stop tracking a character ( \`all\` WIPES your characters list. Be careful.)
			**weapons (Page Number — Default 1)** - Displays supported weapons
			**weaponinfo/winfo [ID/Weapon Name]** - Displays information about a certain weapon
			**arsenal** - Displays a list of which weapons you are curently tracking
			**addweapon/equip [ID/Weapon Name]** - Start tracking a weapon
			**removeweapon/unequip [ID/Weapon Name/all]** - Stop tracking a weapon (\`all\` WIPES your weapons list. Be careful.)
			**agenda (Page Number - Default 1)** - View what materials you can farm for your tracked characters and weapons
			**message (Message)** - Add a custom message to the bottom of the agenda. Inputting no arguments will show your saved message
			**prefix [prefix]** - Change/view bot prefix
			**settimezone/setserver [NA/EU/ASIA]** - Set the server you play for your agenda`,
			)
			.setColor('#00FF97')
			.addFields(
				{
					name: 'This bot is a __**Work In Progress**__ and is detauls to **NA** server time!',
					value: 'Stuff is probably not going to work. Please contact `Toafu#4965` if something doesn\'t work as expected.',
					inline: true,
				});
		message.channel.send(embed);
	},
};