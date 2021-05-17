const mongoose = require('mongoose');

const savedWeaponSchema = mongoose.Schema({
	//User ID
	_id: {
		type: String,
		required: true,
	},

	//Weapons saved
	savedWeapons: {
		type: Array,
		required: true,
	},
});

module.exports = mongoose.model('saved-weapons', savedWeaponSchema);