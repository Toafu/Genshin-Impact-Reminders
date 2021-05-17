const fs = require('fs');

const weaponRead = (name, type, stars, id, passive, stat, mat, days, loot1, loot2, obtain) => {
	return {
		name,
		type,
		stars,
		id,
		passive,
		stat,
		mat,
		days,
		loot1,
		loot2,
		obtain,
	};
};
const getWeapons = () => {
	const weapons = [];
	fs.readFile('GenshinWeapons.txt', (err, data) => {
		if (err) throw err;
		const text = data.toString();
		const word = text.split(/[\n\t\r]+/);
		let i = 0;
		while(word.length > 0) {
			weapons[i] = (weaponRead(word[0], word[1], word[2], i, word[3], word[4], word[5], word[6], word[7], word[8], word[9]));
			word.splice(0, 10);
			i += 1;
		}
		console.log(weapons[0]);
	});
	return weapons;
};
exports.getWeapons = getWeapons;
//getWeapons();