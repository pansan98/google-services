let before_time = 5;
let start = '2022-06-03';
let end = '2022-07-31';
let body_weight = {
	start: 54.6,
	end: 45
}

const notify = () => {
	if(check()) {
		const calendar = CalendarApp.getAllCalendars();
		const my_schedule = schedule(calendar);
		if(my_schedule) {
			const push_message = message(my_schedule);
			console.log(push_message);
			push(push_message);
		}
  }
}

const schedule = (calendars, date, one = true) => {
	if(!date) date = new Date();
	const schedules = [];

	for(let k in calendars) {
		const events = calendars[k].getEventsForDay(date);
		if(events.length) {
			for(let e in events) {
				schedules.push({
					title: events[e].getTitle()
				});
			}
		}
	}

	if(schedules.length) {
		if(one) {
			return schedules[0];
		} else {
			return schedules;
		}
	}

	return null;
}

const message = (schedule) => {
	let message = '';
	message += schedule.title + 'の時間';

	return message;
}

const push = (message) => {
	const token = 'YOUR LINE NOTIFY TOKEN';
	const options = {
		"method": "POST",
		"headers": {
			"Authorization": "Bearer " + token
		},
		"payload": 'message=' + message
	}

	UrlFetchApp.fetch('https://notify-api.line.me/api/notify', options);
}

const check = () => {
	const now = new Date();
	const start_date = new Date(start);
	const end_date = new Date(end);

	if(start_date <= now && now <= end_date) {
		return true;
	}

	return false;
}