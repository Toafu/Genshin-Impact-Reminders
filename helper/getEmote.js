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
	Sigh: '<:Sigh:854063994989838386>',
	Plume: '<:Plume:854063994830848010>',
	Claw: '<:Claw:854063994666090516>',
	Locket: '<:Locket:854063994716291092>',
	Tail: '<:Tail:854063994871873606>',
	Ring: '<:Ring:854063994885505074>',
	Tusk: '<:Tusk:854063994960871465>',
	Shadow: '<:Shadow:854063994813284412>',
	Shard: '<:Shard:854063994829537290>',
	Branch: '<:Branch:854063993761169418>',
	Crown: '<:Crown:854063994352304179>',
	Scale: '<:Scale:854063994742898758>',
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
			case 'Mist':
				words[i] = `Mist Veiled Elixir ${emotes.Elixir}`;
				words.splice(i + 1, 2);
				break;
			case 'Aerosiderite':
				words[i] = `Aerosiderite ${emotes.Aerosiderite}`;
				break;
			case 'Dvalin\'s':
				if (words[i + 1] === 'Sigh') {
					words[i + 1] = `Sighs ${emotes.Sigh}`;
				} else if (words[i + 1] === 'Plumes') {
					words[i + 1] = `Plume ${emotes.Plume}`;
				} else if (words[i + 1] === 'Claw') {
					words[i + 1] = `Claws ${emotes.Claw}`;
				}
				break;
			case 'Ring':
				words[i] = `Rings of Boreas ${emotes.Ring}`;
				words.splice(i + 1, 2);
				break;
			case 'Spirit':
				words[i] = `Spirit Lockets of Boreas ${emotes.Locket}`;
				words.splice(i + 1, 3);
				break;
			case 'Tail':
				words[i] = `Tails of Boreas ${emotes.Tail}`;
				words.splice(i + 1, 2);
				break;
			case 'Tusk':
				words[i] = `Tusks of Monoceros Caeli ${emotes.Tusk}`;
				words.splice(i + 1, 3);
				break;
			case 'Shard':
				words[i] = `Shards of a Foul Legacy ${emotes.Shard}`;
				words.splice(i + 1, 4);
				break;
			case 'Shadow':
				words[i] = `Shadows of the Warrior ${emotes.Shadow}`;
				words.splice(i + 1, 3);
				break;
			case 'Dragon':
				words[i] = `Dragon Lord's Crowns ${emotes.Crown}`;
				words.splice(i + 1, 2);
				break;
			case 'Bloodjade':
				words[i] = `Bloodjade Branches ${emotes.Branch}`;
				words.splice(i + 1, 1);
				break;
			case 'Gilded':
				words[i] = `Gilded Scales ${emotes.Scale}`;
				words.splice(i + 1, 1);
				break;
		}
	}

	words = words.toString();
	words = words.replace(/,/g, ' ');
	return words;
};
exports.getEmote = getEmote;