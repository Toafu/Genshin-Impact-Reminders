const fs = require('fs'); //contains readFile()

const characterRead = (name, element, talent, days, id) => {
	return {
		name,
		element,
		talent,
		days,
		id,
	};
};
const getChars = () => {
	const characters = [];
	fs.readFile('GenshinCharacters.txt', (err, data) => {
		if (err) throw err;
		const text = data.toString();
		const word = text.split(/[\n\t\r]+/);
		let i = 0;

		while(word.length > 0) {
			characters[i] = (characterRead(word[0], word[1], word[2], word[3], i));
			word.splice(0, 4);
			i += 1;
		}
		//console.log(characters);
	});
	return characters; //Returns an array containing each character as an object.
};
exports.getChars = getChars;
//getChars();