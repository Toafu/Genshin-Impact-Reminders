module.exports = {
	name: 'react',
	category: 'Development',
	description: 'Test reaction collector.',
	minArgs: 0,
	maxArgs: 0,
	callback: async ({ message }) => {
		let i = 5;
		const msg = await message.channel.send(i);

		await msg.react('848299128269963284');
		await msg.react('848299127900733443');
		await msg.react('848305820658696233');
		await msg.react('848299128420564992');

		const { author } = message;
		const { id } = author;

		const leftleftfilter = (reaction, user) => { return reaction.emoji.name === 'blobleftleft' && user.id === id; };
		const leftfilter = (reaction, user) => { return reaction.emoji.name === 'blobleft' && user.id === id; };
		const rightfilter = (reaction, user) => { return reaction.emoji.name === 'blobright' && user.id === id; };
		const rightrightfilter = (reaction, user) => { return reaction.emoji.name === 'blobrightright' && user.id === id; };

		const leftleftcollector = msg.createReactionCollector(leftleftfilter, { time: 30000, dispose: true });
		const leftcollector = msg.createReactionCollector(leftfilter, { time: 30000, dispose: true });
		const rightcollector = msg.createReactionCollector(rightfilter, { time: 30000, dispose: true });
		const rightrightcollector = msg.createReactionCollector(rightrightfilter, { time: 30000, dispose: true });

		leftleftcollector.on('collect', r => {
			r.users.remove(message.author.id);
			i -= 2;
			msg.edit(i);
		});

		leftcollector.on('collect', r => {
			r.users.remove(message.author.id);
			i--;
			msg.edit(i);
		});

		rightcollector.on('collect', r => {
			r.users.remove(message.author.id);
			i++;
			msg.edit(i);
		});

		rightrightcollector.on('collect', r => {
			r.users.remove(message.author.id);
			i += 2;
			msg.edit(i);
		});
	},
};