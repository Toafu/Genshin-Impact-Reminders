const mongoose = require('mongoose');

const timezoneSchema = mongoose.Schema({
	_id: {
		type: String,
		required: true,
	},

	server: {
		type: Object,
		required: true,
	},
});

module.exports = mongoose.model('saved-server', timezoneSchema);