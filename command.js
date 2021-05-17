//const { prefix } = require('./config.json');
const prefix = 'b!';

module.exports = (client, aliases, callback) => {
	if (typeof aliases === 'string') { // If the type of alias is exactly a string
		aliases = [aliases]; // 'ping' -> ['ping']
	}

	client.on('message', message => {
		const { content } = message;

		aliases.forEach(alias => {
			const command = `${prefix}${alias}`;

			if (content.startsWith(`${command} `) || content === command) {
				console.log(`Running the command: ${content}`);
				callback(message);
			}
		});
	});
};