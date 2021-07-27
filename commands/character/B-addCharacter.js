const Discord = require('discord.js');
const savedCharacterSchema = require('@schemas/savedcharacter-schema');
const getChar = require('@helper/getChars');
const characters = getChar.getChars();
const getEmotes = require('@helper/getEmote');

module.exports = {
	name: 'track',
	aliases: 'add',
	category: 'Characters',
	description: 'Adds a character to your agenda. `all` adds everyone. Use slashes for bulk add. (b!add 12/Venti)',
	minArgs: 1,
	maxArgs: -1,
	expectedArgs: '<ID/Character Name>',
	callback: async ({ message, text }) => {
		const { author } = message;
		const { id } = author;

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
				.setAuthor(message.author.username)
				.addFields(
					{
						name: 'Tracking All Characters',
						value: 'I hope you realized what you just did.',
					});
			message.channel.send(addallcharsembed);
		} else {
			let queries;
			if (query.includes('/')) {
				queries = query.split('/');
			} else {
				queries = [query];
			}

			let success = [];
			const fail = [];
			for (const item of queries) {
				const querytest = Number(item);
				if (Number.isNaN(querytest) === true) {
					if (item === 'childe') {
						index = 26;
					} else if (item === 'ayaya') {
						index = 2;
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
				.setAuthor(message.author.username);
			if (success.length > 0) {
				embed.addField('Adding Characters', `You are now tracking ${success}`);
			}
			if (fail.length > 0) {
				embed.addField('We couldn\'t add these characters due to a typo or invalid ID:', fail)
					.setFooter('Use the  characters  command if you need help with spelling or finding IDs. Use slashes to add multiple people (b!add 12/Venti).');
			}
			message.channel.send(embed);
		}
	},
};