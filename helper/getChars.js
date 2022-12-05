const fs = require('fs'); //contains readFile()

const characterRead = (name, element, talent, days, id, img, boss, stone, resource, loot, location, role, stat, focus, tip, weekly) => {
	return {
		name,
		element,
		talent,
		days,
		img,
		id,
		boss,
		stone,
		resource,
		loot,
		location,
		role,
		stat,
		focus,
		tip,
		weekly,
	};
};
const getChars = () => {
	const characters = [];
	fs.readFile('GenshinCharacters.txt', (err, data) => {
		if (err) throw err;
		const text = data.toString();
		const word = text.split(/[\n\t\r]+/);
		let i = 0;

		while (word.length > 0) {
			characters[i] = (characterRead(word[0], word[1], word[2], word[3], i, word[4], word[5], word[6], word[7], word[8], word[9], word[10], word[11], word[12], word[13], word[14]));
			word.splice(0, 15);
			i += 1;
		}
		// const json = JSON.stringify(characters);
		// fs.writeFile('characters.json', json, 'utf8', (err) => { if (err) console.log(err); })
	});
	return characters; //Returns an array containing each character as an object.
};
exports.getChars = getChars;
//getChars();