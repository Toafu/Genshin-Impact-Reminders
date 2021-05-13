/* eslint-disable no-shadow-restricted-names */
/* eslint-disable no-unused-vars */
module.exports = {
	commands:['add', 'addition'], //Can include all aliases of a command
	expectedArgs: '<num1> <num2>',
	permissionError: 'You do not have permissions to run this command',
	minArgs: 2,
	maxArgs: 2,
	callback: (message, arguments, text) => {
		//Todo: Add the numbers
		message.reply('Test');
		//Output: @User, Test
	},
	requiredRoles: ['Math'], //Need the 'Math' role
	permissions: [''], //Discord Permissions
};