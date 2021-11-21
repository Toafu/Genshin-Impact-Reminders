const getChar = require('./getChars');
const characters = getChar.getChars();
const getWeapon = require('./getWeapons');
const weapons = getWeapon.getWeapons();
const today = require('./today');

const getTimeZone = zone => {
	let server;
	let offset;

	if (zone.length > 0) {
		server = zone[0].server.name;
		offset = zone[0].server.offset;
	} else {
		server = 'NA';
		offset = -5;
	}

	const zoneInfo = {
		server,
		offset,
	};
	return zoneInfo;
};
exports.getTimeZone = getTimeZone;

const getTime = (server, offset) => {
	const day = today.todayIs(offset);
	const agendaday = today.todayIs(offset - 4);
	const time = today.timeIs(offset);
	const hours = String(time.getHours()).padStart(2, '0');
	const minutes = String(time.getMinutes()).padStart(2, '0');

	const title = `Welcome to your Genshin Impact agenda.\nToday is ${day}, ${hours}:${minutes} ${server} server time.\nStill out of resin? Oh well ¯\\_(ツ)_/¯`;
	const logo = 'https://media.discordapp.net/attachments/424627903876169729/838122787083649055/4936.png?width=720&height=405';

	const timeInfo = {
		day,
		agendaday,
		title,
		logo,
	};
	return timeInfo;
};
exports.getTime = getTime;

const getNothingFields = () => {
	const nocharstoday = {
		name: 'None of your characters\' talent materials can be farmed today (or you aren\'t tracking any yet!).',
		value: 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>',
	};

	const nowepstoday = {
		name: 'None of your weapons\' ascension materials can be farmed today (or you aren\'t tracking any yet!).',
		value: 'Why not do some ley lines or... artifact farm? <:peepoChrist:841881708815056916>',
	};

	const nothing = {
		name: 'You aren\'t tracking anything yet!',
		value: 'Run b!add or b!equip to start tracking stuff!',
	};

	const nothingFields = {
		nocharstoday,
		nowepstoday,
		nothing,
	};
	return nothingFields;
};
exports.getNothingFields = getNothingFields;

const getMaterials = day => {
	const materials = [];
	for (let i = 0; i < characters.length; i++) {
		if (characters[i].days.includes(day) && !materials.includes(`${characters[i].talent}`)) {
			if (characters[i].name === 'Traveler') {
				continue;
			}
			materials.push(`${characters[i].talent}`);
		}
	}
	for (let i = 0; i < weapons.length; i++) {
		if (weapons[i].days.includes(day) && !materials.includes(weapons[i].mat)) {
			materials.push(weapons[i].mat);
		}
	}

	const availablematerials = {
		name: '__At a Glance: Today\'s Materials__',
		value: materials.join('\n'),
	};

	return availablematerials;
};
exports.getMaterials = getMaterials;

const getFunctions = (day, page, availablematerials, nocharstoday, nowepstoday, customtitle, customtext) => {
	const gettodaysChars = (todaysChars, charresult) => {
		for (let i = 0; i < charresult[0].savedCharacters.length; i++) {
			if (charresult[0].savedCharacters[i].days.includes(day)) {
				todaysChars.push(charresult[0].savedCharacters[i]);
			}
		}
	};

	const gettodaysWeps = (todaysWeps, wepresult) => {
		for (let i = 0; i < wepresult[0].savedWeapons.length; i++) {
			if (wepresult[0].savedWeapons[i].days.includes(day)) {
				todaysWeps.push(wepresult[0].savedWeapons[i]);
			}
		}
	};

	const sortChars = todaysChars => {
		todaysChars.sort((tal1, tal2) => (tal1.talent > tal2.talent) ? 1 : -1);
	};

	const sortWeps = todaysWeps => {
		todaysWeps.sort((wep1, wep2) => (wep1.mat > wep2.mat) ? 1 : -1);
	};

	const getfinalcharlist = (charagenda, page) => {
		let finalcharlist = [];
		for (let i = (page * 10) - 10; i < page * 10; i++) {
			if (charagenda[i]) {
				finalcharlist.push(charagenda[i]);
			}
		}
		if (finalcharlist.length === 0) {
			return 'No more characters to view';
		}
		return finalcharlist.join('\n');
	};

	const getfinalweplist = (wepagenda, page) => {
		let finalweplist = [];
		for (let i = (page * 10) - 10; i < page * 10; i++) {
			if (wepagenda[i]) {
				finalweplist.push(wepagenda[i]);
			}
		}
		if (finalweplist.length === 0) {
			return 'No more weapons to view';
		}
		return finalweplist.join('\n');
	};

	const getlocations = (todaysChars, todaysWeps) => {
		let loclist = [];
		if (todaysChars.length > 0) {
			todaysChars.forEach(character => {
				if (!loclist.includes(character.location)) {
					loclist.push(character.location);
				}
			});
		}
		if (todaysWeps.length > 0) {
			todaysWeps.forEach(weapon => {
				if (!loclist.includes(weapon.location)) {
					loclist.push(weapon.location);
				}
			});
		}
		loclist.sort((loc1, loc2) => loc1 > loc2 ? 1 : -1);
		loclist = loclist.join('\n');
		return loclist;
	};

	const getfields = (agendaembed, charagenda, wepagenda, finalcharlist, finalweplist, charfield, wepfield, locfield) => {
		const charname = '__Today\'s Talents__';
		const wepname = '__Today\'s Weapons__';

		finalcharlist = getfinalcharlist(charagenda, page);
		charfield = {
			name: charname,
			value: finalcharlist,
		};
		finalweplist = getfinalweplist(wepagenda, page);
		wepfield = {
			name: wepname,
			value: finalweplist,
		};
		agendaembed.fields = [];
		agendaembed.addFields(availablematerials);
		if (finalcharlist.length > 0) {
			agendaembed.addFields(charfield);
		} else {
			agendaembed.addFields(nocharstoday);
		}
		if (finalweplist.length > 0) {
			agendaembed.addFields(wepfield);
		} else {
			agendaembed.addFields(nowepstoday);
		}
		if (charfield || wepfield) {
			agendaembed.addFields(locfield);
		}
		if (customtext) {
			agendaembed.addField(customtitle, customtext);
		}
	};

	const functions = {
		gettodaysChars,
		gettodaysWeps,
		sortChars,
		sortWeps,
		getfinalcharlist,
		getfinalweplist,
		getlocations,
		getfields,
	};
	return functions;
};
exports.getFunctions = getFunctions;