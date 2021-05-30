const Discord = require('discord.js');
const firstMessage = require('./first-message');

module.exports = client => {
	const verificationembed = new Discord.MessageEmbed()
		.setTitle('Before you enter the server...')
		.setDescription('We need to make sure you\'re a person! Just hit that check mark below this message. It may take a short bit for the verification process to complete.')
		.setFooter('You got this!');

	const channelId = '844208376828788771';

	const getEmoji = emojiName => client.emojis.cache.find(emoji => emoji.name === emojiName);

	const emojis = {
		check: '0 Primogem Gang',
	};

	const reactions = [];

	for (const key in emojis) {
		const emoji = getEmoji(key);
		reactions.push(emoji);
	}

	firstMessage(client, channelId, verificationembed, reactions);

	const handleReaction = (reaction, user, add) => {
		if (user.id === '837702868034650174') {
			return;
		}

		const emoji = reaction._emoji.name;

		const { guild } = reaction.message;

		const roleName = emojis[emoji];
		if (!roleName) {
			return;
		}

		const role = guild.roles.cache.find(role => role.name === roleName);
		const member = guild.members.cache.find(member => member.id === user.id);

		if (add) {
			member.roles.add(role);
		} else {
			member.roles.remove(role);
		}
	};

	client.on('messageReactionAdd', (reaction, user) => {
		if (reaction.message.channel.id === channelId) {
			handleReaction(reaction, user, true);
		}
	});

	client.on('messageReactionRemove', (reaction, user) => {
		if (reaction.message.channel.id === channelId) {
			handleReaction(reaction, user, false);
		}
	});
};