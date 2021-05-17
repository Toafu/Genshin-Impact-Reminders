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
const time = new Date();
time.setHours(time.getHours() - 5); //For Heroku server
console.log(time.getHours());
const day = time.getDay();
// const daynum = d.getDate();
// console.log(daynum);
// const offset = d.getTimezoneOffset();
// console.log(offset);
const todayIs = () => {
	return week[day];
};
exports.todayIs = todayIs;
const timeIs = () => {
	return time;
};
exports.timeIs = timeIs;
//const timetest = timeIs();
//console.log(`It is currenntly ${timetest.getHours()}:${timetest.getMinutes()}.`);
//console.log(todayIs());