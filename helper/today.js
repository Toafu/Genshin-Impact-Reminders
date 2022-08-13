const week = {
	//Outputs of getDay() and corresponding day
	0: 'Sunday',
	1: 'Monday',
	2: 'Tuesday',
	3: 'Wednesday',
	4: 'Thursday',
	5: 'Friday',
	6: 'Saturday',
};

const todayIs = (offset) => {
	const time = new Date();
	time.setHours(time.getHours() + offset); //For Heroku server
	//time.setHours(time.getHours() + 5 + offset);
	const day = time.getDay();
	return week[day];
};
exports.todayIs = todayIs;

const timeIs = (offset) => {
	const time = new Date();
	time.setHours(time.getHours() + offset); //For Heroku server
	//time.setHours(time.getHours() + 5 + offset);
	return time;
};
exports.timeIs = timeIs;