const mongoose = require('mongoose');
const mongoPath = 'mongodb://localhost:27017/BlobBot';

module.exports = async () => {
	await mongoose.connect(mongoPath, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});
	return mongoose;
};