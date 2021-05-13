const mongoose = require('mongoose');

const savedCharacterSchema = mongoose.Schema({
	//User ID
	_id: {
		type: String,
		required: true,
	},

	//Characters saved
	savedCharacters: {
		type: Array,
		required: true,
	},
});

module.exports = mongoose.model('saved-characters', savedCharacterSchema);