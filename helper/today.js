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

const todayIs = () => {
	const time = new Date();
	time.setHours(time.getHours() - 5); //For Heroku server
	const day = time.getDay();
	return week[day];
};
exports.todayIs = todayIs;

const timeIs = () => {
	const time = new Date();
	time.setHours(time.getHours() - 5); //For Heroku server
	return time;
};
// const timetest = timeIs();
// const hours = String(timetest.getHours()).padStart(2, '0');
// const minutes = String(timetest.getMinutes()).padStart(2, '0');
// console.log(`It is ${hours}:${minutes}`);
exports.timeIs = timeIs;