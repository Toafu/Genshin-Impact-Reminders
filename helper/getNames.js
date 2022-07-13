//Substitutes queried alises with names defined in database

const getName = name => {
	switch (name) {
		case 'childe':
			name = 'tartaglia';
			break;
		case 'ayaya':
			name = 'ayaka';
			break;
		case 'kaedahara kazuha':
			name = 'kazuha';
			break;
		case 'itto':
			name = 'arataki itto';
			break;
		case 'kokomi':
			name = 'sangonomiya kokomi';
			break;
		case 'shinobu':
			name = 'kuki shinobu';
			break;
		case 'heizou':
			name = 'shikanoin heizou';
			break;
	}
	return name;
}
exports.getName = getName;