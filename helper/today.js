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
const day = d.getDay();
const todayIs = () => {
	return week[day];
};
exports.todayIs = todayIs;
console.log(todayIs());