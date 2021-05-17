const Discord = require('discord.js');
module.exports = {
	commands: 'help',
	minArgs: 0,
	maxArgs: 0,
	callback: message => {
		const embed = new Discord.MessageEmbed()
			.setTitle('Help/Command List')
			.setColor('#00FF97')
			.addFields(
				{
					name: 'This bot is a __**Work In Progress**__ and is centered around **NA** server time!',
					value: 'Stuff is probably not going to work. Please contact `Toafu#4965` if something doesn\'t work as expected.',
					inline: true,
				},
				{
					name: 'Prefix: `b!`',
					value: `
**help** - Displays this window
**bruh** - bruh moment
**characters [page number]** - Displays supported characters
**info [ID/Character Name]** - Displays information about a certain character
**list (Page Number Optional — Defaults to 1)** - Displays a list of who you are currently tracking
**add [ID/Character Name]** - Start tracking a character
**remove [ID/Character Name]** - Stop tracking a character (b!remove all WIPES your tracking list. Be careful.)
**agenda** - View what materials you can farm for your tracked characters`,
					inline: false,
				});
		message.channel.send(embed);
	},
};