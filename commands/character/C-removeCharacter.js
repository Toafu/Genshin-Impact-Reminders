const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	slash: 'both',
	name: 'untrack',
	aliases: 'remove',
	category: 'Characters',
	description: 'Removes a character from your agenda. `all` wipes your list. Slashes for bulk remove. (1/Qiqi/14)',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '<id or character name>',
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

		const query = text.toLowerCase();
		let index;

		if (query === 'all') {
			await savedCharacterSchema.findOneAndDelete({
				_id: id,
			});
			const removeallembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor(author)
				.addField('Removing All Characters', 'You are no longer tracking any characters.');
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
				if (item === 'childe') {
					index = characters.findIndex(person => person.name.toLowerCase() === 'tartaglia');
				} else if (item === 'ayaya') {
					index = characters.findIndex(person => person.name.toLowerCase() === 'ayaka');
				} else {
					index = characters.findIndex(person => person.name.toLowerCase() === item);
				}
			} else {
				index = querytest;
			}

			if(index >= 0 && index < characters.length) {
				await savedCharacterSchema.findOneAndUpdate({
					_id: id,
				}, {
					$pull: { savedCharacters: characters[index] },
				}, {
					upsert: true,
				}).exec();
				success.push(`**${characters[index].name}** ${getEmotes.getEmote(characters[index].element)}`);
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
			embed.addField('Removing Characters', `You are no longer tracking ${success}`);
		}
		if (fail.length > 0) {
			fail = fail.join('\n');
			embed.addField('We couldn\'t add these characters due to a typo or invalid ID:', fail)
				.setFooter('Use the  tracking  command if you need help with spelling or finding IDs. Use slashes to remove multiple people (b!remove 12/Venti).');
		}
		if (message) {
			message.channel.send({ embeds: [embed] });
			return;
		}
		msgInt.reply({ embeds: [embed] });
	},
};