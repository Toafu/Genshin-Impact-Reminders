const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema({
	_id: {
		type: String,
		required: true,
	},

	date: {
		type: Object,
		required: true,
	},
});

module.exports = mongoose.model('saved-schedule', scheduleSchema);