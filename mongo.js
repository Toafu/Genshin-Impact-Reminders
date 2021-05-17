const mongoose = require('mongoose');
//const { mongoPath } = require('./config.json');
const mongoPath = `mongodb+srv://Toafu:${process.env.DJS_MONGO}@genshin-impact-reminder.mbg5c.mongodb.net/GI-Tracking-Users?retryWrites=true&w=majority`;

module.exports = async () => {
	await mongoose.connect(mongoPath, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});
	return mongoose;
};