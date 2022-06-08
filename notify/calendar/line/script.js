let before_time = 5;
let start = '2022-06-03';
let end = '2022-07-31';
let body_weight = {
	start: 56.4,
	end: 45
}
let interval_day = 4;

const setTrigger = () => {
	// 実行日時を指定する
	const trigger = new Date();
	trigger.setHours(19);
	trigger.setMinutes(55);

	ScriptApp.newTrigger('notify').timeBased().at(trigger).create();

	const snack = new Date();
	snack.setHours(09);
	snack.setMinutes(00);

	ScriptApp.newTrigger('snack_notify').timeBased().at(snack).create();
}

const snack_notify = () => {
	const now = new Date();
	const week = now.getDay();
	if(week === 1 || week === 3 || week === 5) {
		let message = "\n" + 'おかしの日';
		push(message);
	}
}

const notify = () => {
	let _check = check();
	let _close = closing_day();
	if(_check && !_close) {
		const calendar = CalendarApp.getAllCalendars();
		const my_schedule = schedule(calendar);
		if(my_schedule) {
			const push_message = message(my_schedule);
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

	let [weight, day] = current_weight();
	message += "\n" + day + '日目';
	message += "\n現在の体重:" + weight + 'kg';

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

const current_weight = () => {
	let start_date = new Date(start);
	let end_date = new Date(end);
	let now = new Date();

	let _need_mns = Math.round((body_weight.start - body_weight.end) * 10) / 10;

	let _total_d = Math.floor(((end_date.getTime() - start_date.getTime()) / 1000 / 60 / 60 / 24));
	let _remain_d = Math.floor(((end_date.getTime() - now.getTime()) / 1000 / 60 / 60 / 24));
	let _progress_d = _total_d - _remain_d;

	let _range = Math.floor(((_progress_d / _total_d) * 100) * 10) / 10;
	let _mns = Math.floor(((_range / 100) * _need_mns) * 10) / 10;
	let _current = body_weight.start - _mns;

	return [_current, _progress_d];
}

const closing_day = () => {
	let start_date = new Date(start);
	let end_date = new Date(end);
	let now = new Date();

	let _total_d = Math.floor(((end_date.getTime() - start_date.getTime()) / 1000 / 60 / 60 / 24));
	let _remain_d = Math.floor(((end_date.getTime() - now.getTime()) / 1000 / 60 / 60 / 24));
	let _progress_d = _total_d - _remain_d;

	let interval_days = [];
	let i = interval_day;
	while(i < _total_d) {
		interval_days.push(i);
		i += interval_day;
	}

	return interval_days.includes(_progress_d);
}

// TODO ゴミトリガーを消す