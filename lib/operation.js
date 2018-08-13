const types = require('./type.js');
const Number = types.Number;
const TimePeriod = types.TimePeriod;
const TimePoint = types.TimePoint;

const DateManipulator = require('./date-manipulator.js').DateManipulator;

function copy(n) {
	return JSON.parse(JSON.stringify(n));
}

function merge(n1, n2, mergeFunction) {
	let merged = copy(n1);
	for (let k in n2) {
		if (k in merged) {
			merged[k] = mergeFunction(merged[k], n2[k]);
		} else {
			merged[k] = mergeFunction(0, n2[k]);
		}
	}

	return merged;
}

var applyAt = function(timePoint, number, timeZone) {
	if (!(number instanceof Number && timePoint instanceof TimePoint)) {
		return new Error('invalid format');
	}

	let newValue = {};

	['hours', 'minutes', 'seconds', 'milliseconds'].forEach(timeUnit => {
		if (timeUnit in number.value) {
			newValue[timeUnit] = number.value[timeUnit];
		} else {
			newValue[timeUnit] = 0;
		}
	});

	let resultTime = new DateManipulator(timePoint.value, timeZone).set(newValue).getTime();
	return new TimePoint(resultTime);
};

module.exports = {
	before: {
		apply: function(timePeriod, timePoint, options, timeZone) {
			if (!(timePeriod instanceof TimePeriod && timePoint instanceof TimePoint)) {
				return new Error('invalid format');
			}

			let resultTime = new DateManipulator(timePoint.value, timeZone).subtract(timePeriod.value).getTime();
			return new TimePoint(resultTime);
		}, 
		precedence: 10
	}, 
	after: {
		apply: function(timePeriod, timePoint, timeZone) {
			if (!(timePeriod instanceof TimePeriod && timePoint instanceof TimePoint)) {
				return new Error('invalid format');
			}

			let resultTime = new DateManipulator(timePoint.value, timeZone).add(timePeriod.value).getTime();
			return new TimePoint(resultTime);
		}, 
		precedence: 10
	},
	and: {
		apply: function(timePeriod1, timePeriod2) {
			if (!(timePeriod1.type instanceof TimePeriod && timePeriod2 instanceof TimePeriod)) {
				return new Error('invalid format');
			}
			let timePeriod = new TimePeriod();

			[timePeriod1, timePeriod2].forEach(n => {
				for (let k in n.value) {
					timePeriod.set(k, n.value[k]);
				}
			});

			return timePeriod;
		}, 
		precedence: 30
	}, 
	at: {
		apply: applyAt,
		precedence: 20
	},
	on: {
		apply: function(number, timePoint, timeZone) {
			if (number) {
				return applyAt(timePoint, number, timeZone);
			} else {
				return timePoint;
			}
		}, 
		precedence: 20
	},
	past: {
		apply: function(timePeriod, number) {
			if (!(timePeriod instanceof TimePeriod && number instanceof Number)) {
				return new Error('invalid format');
			}

			return new Number(merge(number.value, timePeriod.value, (x, y) => x + y ));
		}, 
		precedence: 30
	},
	to: {
		apply: function(timePeriod, number) {
			if (!(timePeriod instanceof TimePeriod && number instanceof Number)) {
				return new Error('invalid format');
			}

			return new Number(merge(number.value, timePeriod.value, (x, y) => x - y ));
		}, 
		precedence: 30
	}, 
	pm: {
		apply: function(number) {
			if (!(number instanceof Number)) {
				return new Error('invalid format');
			}
			
			let hours = number.value.hours < 12 ? number.value.hours + 12 : number.value.hours;
			let value = copy(number.value);
			value.hours = hours;

			return new Number(value);
		},
		precedence: 40
	},
	am: {
		apply: function(number) {
			if (!(number instanceof Number)) {
				return new Error('invalid format');
			}
			
			if (number.value.hours > 12) {
				return new Error('invalid format');
			}

			let hours = number.value.hours != 12 ? number.value.hours : 0;
			let value = copy(number.value);
			value.hours = hours;

			return new Number(value);
		},
		precedence: 40
	}
};