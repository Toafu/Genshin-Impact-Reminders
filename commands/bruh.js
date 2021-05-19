const Discord = require('discord.js');
module.exports = {
	commands: 'bruh',
	minArgs: 0,
	maxArgs: 0,
	callback: message => {
		const embed = new Discord.MessageEmbed()
			.setTitle('bruh')
			.setColor('#00FF97')
			.addFields(
				{
					name: 'Well well',
					value: 'This is a certified bruh moment™',
					inline: true,
				});
		message.channel.send(embed);
	},
};
