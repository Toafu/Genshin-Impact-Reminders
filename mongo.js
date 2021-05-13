//mongodb://localhost:27017
//C:\Program Files\MongoDB\Server\4.4\bin\
//mongod.exe
const mongoose = require('mongoose');
const { mongoPath } = require('./config.json');

module.exports = async () => {
	await mongoose.connect(mongoPath, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});
	return mongoose;
};