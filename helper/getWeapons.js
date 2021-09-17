const fs = require('fs');

const weaponRead = (name, type, stars, id, passive, stat, mat, days, loot1, loot2, obtain, img, location) => {
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
		img,
		location,
	};
};
const getWeapons = () => {
	const weapons = [];
	fs.readFile('GenshinWeapons.txt', (err, data) => {
		if (err) throw err;
		const text = data.toString();
		const word = text.split(/[\n\t\r]+/);
		let i = 0;
		while (word.length > 0) {
			weapons[i] = (weaponRead(word[0], word[1], word[2], i, word[3], word[4], word[5], word[6], word[7], word[8], word[9], word[10], word[11]));
			word.splice(0, 12);
			i += 1;
		}
		weapons.forEach(weapon => {
			if (weapon.passive.startsWith('"')) {
				weapon.passive = weapon.passive.substring(1, weapon.passive.length - 1);
			}
		});
		//console.log(weapons[34]);
	});
	return weapons;
};
exports.getWeapons = getWeapons;
//getWeapons();