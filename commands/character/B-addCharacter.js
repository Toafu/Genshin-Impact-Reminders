const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');
const getNames = require('@helper/getNames');

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
				.addFields({ name: 'Tracking All Characters', value: 'I hope you realized what you just did.' });
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
				index = characters.findIndex(person => person.name.toLowerCase() === getNames.getName(item));
			} else {
				index = querytest;
			}

			if (index >= 0 && index < characters.length) {
				const savedCharData = {
					name: characters[index].name,
					element: characters[index].element,
					talent: characters[index].talent,
					days: characters[index].days,
					id: index,
					location: characters[index].location,
				};
				await savedCharacterSchema.findOneAndUpdate({
					_id: id,
				}, {
					$addToSet: { savedCharacters: savedCharData },
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
			embed.addFields({ name: 'Adding Characters', value: `You are now tracking ${success}` });
		}
		if (fail.length > 0) {
			fail = fail.join('\n');
			embed.addFields({ name: 'We couldn\'t add these characters due to a typo or invalid ID:', value: fail })
				.setFooter({ text: 'Use the  characters  command if you need help with spelling or finding IDs. Use slashes to add multiple people (b!add 0/Venti).' });
		}
		if (message) {
			message.channel.send({ embeds: [embed] });
		} else {
			msgInt.reply({ embeds: [embed] });
		}
	},
};