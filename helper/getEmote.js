const emotes = {
	Anemo: '<:Anemo:839972357765333042>',
	Cryo: '<:Cryo:839972794199703562>',
	Hydro: '<:Hydro:839972794207961089>',
	Electro: '<:Electro:839972793738985554>',
	Dendro: '<:Dendro:839972794010959883>',
	Pyro: '<:Pyro:839972794170474507>',
	Geo: '<:Geo:839972794095239169>',
	Decarabian: '<:Decarabian:844756143951970314>',
	Chain: '<:Chain:844756143997714492>',
	Tooth: '<:Tooth:844756143225176105>',
	Guyun: '<:Guyun:844756143724691536>',
	Elixir: '<:Elixir:844756143431614485>',
	Aerosiderite: '<:Aerosiderite:844756142752137286>',
};

const getEmote = string => {
	let words = string.toString().split(/[\n\t\r\s]+/);
	for (let i = 0; i < words.length; i++) {
		switch (words[i]) {
		case 'Anemo':
			words[i] = emotes.Anemo;
			break;
		case 'Cryo':
			words[i] = emotes.Cryo;
			break;
		case 'Hydro':
			words[i] = emotes.Hydro;
			break;
		case 'Electro':
			words[i] = emotes.Electro;
			break;
		case 'Dendro':
			words[i] = emotes.Dendro;
			break;
		case 'Pyro':
			words[i] = emotes.Pyro;
			break;
		case 'Geo':
			words[i] = emotes.Geo;
			break;
		case 'Decarabian\'s':
			words[i] = `Decarabian's Stones ${emotes.Decarabian}`;
			words.splice(i + 1, 1);
			break;
		case 'Dandelion':
			words[i] = `Dandelion Gladiator Chains ${emotes.Chain}`;
			words.splice(i + 1, 2);
			break;
		case 'Boreal':
			words[i] = `Boreal Wolf's Teeth ${emotes.Tooth}`;
			words.splice(i + 1, 2);
			break;
		case 'Guyun':
			words[i] = `Guyun Stones ${emotes.Guyun}`;
			words.splice(i + 1, 1);
			break;
		case 'Mist Veiled Elixir':
			words[i] = `Mist Veiled Elixir ${emotes.Elixir}`;
			words.splice(i + 1, 2);
			break;
		case 'Aerosiderite':
			words[i] = `Aerosiderite ${emotes.Aerosiderite}`;
			break;
		}
	}

	words = words.toString();
	words = words.replace(/,/g, ' ');
	return words;
};
exports.getEmote = getEmote;

const test = 'Dandelion Gladiator Chains';
const result = getEmote(test);
console.log(result);