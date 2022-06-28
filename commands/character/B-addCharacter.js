const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	slash: 'both',
	name: 'track',
	aliases: 'add',
	category: 'Characters',
	description: 'Adds a character to your agenda. `all` adds everyone. Slashes for bulk add.',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '<id or character name>',
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

		const query = text.toLowerCase();
		let index;

		if (query === 'all') {
			await savedCharacterSchema.findOneAndUpdate({
				_id: id,
			}, {
				$addToSet: { savedCharacters: characters },
			}, {
				upsert: true,
			});

			const addallcharsembed = new Discord.MessageEmbed()
				.setColor('#00FF97')
				.setAuthor({ name: author })
				.addField('Tracking All Characters', 'I hope you realized what you just did.');
			if (message) {
				message.channel.send({ embeds: [addallcharsembed] });
			} else {
				msgInt.reply({ embeds: [addallcharsembed] });
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
				switch (item) { //Special cases (especially Inazuma names)
					case 'childe':
						index = characters.findIndex(person => person.name.toLowerCase() === 'tartaglia');
						break;
					case 'ayaya':
						index = characters.findIndex(person => person.name.toLowerCase() === 'ayaka');
						break;
					case 'kaedahara kazuha':
						index = characters.findIndex(person => person.name.toLowerCase() === 'kazuha');
						break;
					case 'itto':
						index = characters.findIndex(person => person.name.toLowerCase() === 'arataki itto');
						break;
					case 'kokomi':
						index = characters.findIndex(person => person.name.toLowerCase() === 'sangonomiya kokomi');
						break;
					case 'shinobu':
						index = characters.findIndex(person => person.name.toLowerCase() === 'kuki shinobu');
						break;
					default:
						index = characters.findIndex(person => person.name.toLowerCase() === query);
				}
			} else {
				index = querytest;
			}

			if (index >= 0 && index < characters.length) {
				await savedCharacterSchema.findOneAndUpdate({
					_id: id,
				}, {
					$addToSet: { savedCharacters: characters[index] },
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
			.setAuthor({ name: author });
		if (success.length > 0) {
			embed.addField('Adding Characters', `You are now tracking ${success}`);
		}
		if (fail.length > 0) {
			fail = fail.join('\n');
			embed.addField('We couldn\'t add these characters due to a typo or invalid ID:', fail)
				.setFooter({ text: 'Use the  characters  command if you need help with spelling or finding IDs. Use slashes to add multiple people (b!add 0/Venti).' });
		}
		if (message) {
			message.channel.send({ embeds: [embed] });
		} else {
			msgInt.reply({ embeds: [embed] });
		}
	},
};