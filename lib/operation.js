const types = require('./type.js');
const DateManipulator = require('./dateUtil.js').DateManipulator;

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
	if (number.type != types.NUMBER || timePoint.type != types.TIME_POINT) {
		throw new Error('invalid format');
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
	return {
		type: types.TIME_POINT, 
		value: resultTime
	};
};

module.exports = {
	before: {
		apply: function(timePeriod, timePoint, options, timeZone) {
			if (timePeriod.type != types.TIME_PERIOD || timePoint.type != types.TIME_POINT) {
				throw new Error('invalid format');
			}

			let resultTime = new DateManipulator(timePoint.value, timeZone).subtract(timePeriod.value).getTime();
			return {
				type: types.TIME_POINT, 
				value: resultTime
			};
		}, 
		precedence: 10
	}, 
	after: {
		apply: function(timePeriod, timePoint, timeZone) {
			if (timePeriod.type != types.TIME_PERIOD || timePoint.type != types.TIME_POINT) {
				throw new Error('invalid format');
			}

			let resultTime = new DateManipulator(timePoint.value, timeZone).add(timePeriod.value).getTime();
			return {
				type: types.TIME_POINT, 
				value: resultTime
			};
		}, 
		precedence: 10
	},
	and: {
		apply: function(timePeriod1, timePeriod2) {
			let timePeriod = {
				type: types.TIME_PERIOD, 
				value: {}
			};
			[timePeriod1, timePeriod2].forEach(n => {
				for (let k in n.value) {
					timePeriod.value[k] = n.value[k];
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
			return applyAt(timePoint, number, timeZone);
		}, 
		precedence: 20
	},
	past: {
		apply: function(timePeriod, number) {
			if (timePeriod.type != types.TIME_PERIOD || number.type != types.NUMBER) {
				throw new Error('invalid format');
			}

			return {
				type: types.NUMBER, 
				value: merge(number.value, timePeriod.value, (x, y) => x + y )
			};
		}, 
		precedence: 30
	},
	to: {
		apply: function(timePeriod, number) {
			if (timePeriod.type != types.TIME_PERIOD || number.type != types.NUMBER) {
				throw new Error('invalid format');
			}

			return {
				type: types.NUMBER, 
				value: merge(number.value, timePeriod.value, (x, y) => x - y )
			};
		}, 
		precedence: 30
	}, 
	pm: {
		apply: function(number) {
			if (number.type != types.NUMBER) {
				throw new Error('invalid format');
			}
			
			let hours = number.value.hours < 12 ? number.value.hours + 12 : number.value.hours;
			let value = copy(number.value);
			value.hours = hours;

			return {
				type: types.NUMBER, 
				value: value
			};
		},
		precedence: 40, 
		unary: true
	},
	am: {
		apply: function(number) {
			if (number.type != types.NUMBER) {
				throw new Error('invalid format');
			}
			
			if (number.value.hours > 12) {
				throw new Error('invalid format');
			}

			let hours = number.value.hours != 12 ? number.value.hours : 0;
			let value = copy(number.value);
			value.hours = hours;

			return {
				type: types.NUMBER, 
				value: value
			};
		},
		precedence: 40, 
		unary: true
	}
};