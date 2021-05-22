const Discord = require('discord.js');
const { mongo } = require('mongoose');
const commandPrefixSchema = require('@schemas/command-prefix-schema');

module.exports = {
	commands: 'help',
	minArgs: 0,
	maxArgs: 0,
	callback: async message => {

		const guildId = message.guild.id;

		await mongo().then(async mongoose => {
			try {
				const result = await commandPrefixSchema.find({
					_id: guildId,
				});
				let prefix;
				if (result) {
					prefix = result[0].prefix;
				} else {
					prefix = 'b!';
				}

				const embed = new Discord.MessageEmbed()
					.setTitle(`Help/Command List (Current Prefix ${prefix})`)
					.setDescription(`
				**help** - Displays this window\n
				**bruh** - bruh moment\n
				**characters (Page Number — Default 1)** - Displays supported characters\n
				**charinfo/cinfo [ID/Character Name]** - Displays information about a certain character\n
				**tracking (Page Number — Default 1)** - Displays a list of which characters you are currently tracking\n
				**add/track [ID/Character Name]** - Start tracking a character\n
				**remove/untrack [ID/Character Name/all]** - Stop tracking a character ( \`all\` WIPES your characters list. Be careful.)\n
				**weapons (Page Number — Default 1)** - Displays supported weapons\n
				**weaponinfo/winfo [ID/Weapon Name]** - Displays information about a certain weapon\n
				**arsenal** - Displays a list of which weapons you are curently tracking\n
				**addweapon/equip [ID/Weapon Name]** - Start tracking a weapon\n
				**removeweapon/unequip [ID/Weapon Name/all]** - Stop tracking a weapon (\`all\` WIPES your weapons list. Be careful.)\n
				**agenda (Page Number - Default 1)** - View what materials you can farm for your tracked characters and weapons\n
				**message (Message)** - Add a custom message to the bottom of the agenda. Inputting no arguments will show your saved message\n
				**setprefix** [prefix] - You need administrator perms to do this one`,
					)
					.setColor('#00FF97')
					.addFields(
						{
							name: 'This bot is a __**Work In Progress**__ and is centered around **NA** server time!',
							value: 'Stuff is probably not going to work. Please contact `Toafu#4965` if something doesn\'t work as expected.',
							inline: true,
						});
				message.channel.send(embed);
			} finally {
				mongoose.connection.close();
			}
		});
	},
};