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
const d = new Date();
const hour = d.setHours(d.getHours() - 5);
console.log(d.getHours());
const day = d.getDay();
// const daynum = d.getDate();
// console.log(daynum);
// const offset = d.getTimezoneOffset();
// console.log(offset);
const todayIs = () => {
	if(hour <= 5) {
		return week[day - 1];
	} else {
		return week[day];
	}
};
exports.todayIs = todayIs;
//console.log(todayIs());