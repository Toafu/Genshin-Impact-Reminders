const mongoose = require('mongoose');

const savedMessageSchema = mongoose.Schema({
	//User ID
	_id: {
		type: String,
		required: true,
	},

	//Custom message
	savedMessage: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('saved-message', savedMessageSchema);