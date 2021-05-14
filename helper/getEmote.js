const emotes = {
	Anemo: '<:Anemo:839972357765333042>',
	Cryo: '<:Cryo:839972794199703562>',
	Hydro: '<:Hydro:839972794207961089>',
	Electro: '<:Electro:839972793738985554>',
	Dendro: '<:Dendro:839972794010959883>',
	Pyro: '<:Pyro:839972794170474507>',
	Geo: '<:Geo:839972794095239169>',
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
		}
	}
	words = words.toString();
	words = words.replace(/,/g, ' '); //replaceAll doesn't exist
	return words;
};
exports.getEmote = getEmote;

//const test = ['[0] Albedo Geo'];
//console.log(getEmote(test));