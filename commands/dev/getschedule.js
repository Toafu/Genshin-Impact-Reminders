const scheduleSchema = require('@schemas/schedule-schema');

module.exports = {
	category: 'Development',
	description: 'Check a user\'s schedule data',
	minArgs: 0,
	maxArgs: 1,
	expectedArgs: '<ID>',
	callback: async ({ message, args }) => {
		let id = message.author.id;
		if (args[0]) {
			id = args[0];
		}
		const query = { _id: id };
		const result = await scheduleSchema.find(query);
		if (result[0]) {
			console.log(result);
		} else {
			console.log(`No schedule for ${id} found`);
		}
	}
}