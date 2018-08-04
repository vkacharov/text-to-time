"use strict";

const wtn = require('words-to-numbers');

const synonyms = require('./synonym.js');
const dates = require('./dateUtil.js');
const DateManipulator = dates.DateManipulator;
const types = require('./type.js');
const operations = require('./operation.js');

const timeUnits = types.timeUnits;

const timePoints = {
	now: options => new DateManipulator(options.now, options.timeZone).getTime(), 
	tomorrow: options => new DateManipulator(options.now, options.timeZone).add({days: 1}).getTime(),
	yesterday: options => new DateManipulator(options.now, options.timeZone).subtract({days: 1}).getTime(),
	today: options => new DateManipulator(options.now, options.timeZone).getTime()
}

function transformTimePeriod(expression, index) {
	let e = expression[index];
	if (!isNaN(e)) {
		let value = parseInt(e);
		let timeUnit = expression[index + 1];
		if (timeUnits.has(timeUnit)) {
			let timePeriod = {
				value: {}, 
				size: 2, 
				type: types.TIME_PERIOD
			};
			timePeriod.value[timeUnit] = value;
			return timePeriod;
		}
	}
	
	return null;
}

function transformOperation(expression, index) {
	let e = expression[index];
	if (e in operations) {
		return {
			value: e, 
			size: 1, 
			apply: operations[e].apply,
			type: types.OPERATION, 
			precedence: operations[e].precedence, 
			unary: operations[e].unary
		}
	}

	return null; 
}

function transformTimePoint(expression, index, options) {
	let e = expression[index];
	if (e in timePoints) {
		return {
			value: timePoints[e](options), 
			size: 1, 
			type: types.TIME_POINT
		}
	}

	return null;
}

function transformNumber(expression, index) {
	let e = expression[index];
	if (!isNaN(e)) {
		return {
			value: parseInt(e), 
			type: types.NUMBER, 
			size: 1
		}
	}
}

function transformDate(expression, index, options) {
	let e = expression[index];
	let regex = new RegExp('\\d{1,2}\\.\\d{1,2}\\.\\d{4}', 'g');
	if (regex.test(e)) {
		let transformedDate = dates.parseNormalizedDate(e);
		transformedDate.months -= 1;
		let value = new DateManipulator(transformedDate, options.timeZone).getTime();
		return {
			type: types.TIME_POINT, 
			size: 1,
			value: value
		}
	}
	return null;
}

function transform(expression, options) {
	let split = expression.split(/\s+/);

	let transformedExpression = [];
	let transformFunctions = [
		transformTimePeriod, 
		transformOperation, 
		transformTimePoint, 
		transformNumber,
		transformDate];
	let index = 0;

	while (index < split.length) {
		let transformed = null;
		let i = 0;
		while (i < transformFunctions.length && transformed == null ) {
			transformed = transformFunctions[i](split, index, options);
			++i;
		}
		
		if (transformed) {
			transformedExpression.push(transformed);
			index += transformed.size;
		} else {
			throw new Error('invalid format at word ' + (index + 1));
		}
	}

	return transformedExpression;
}

function baseSanitizatonPreTransform(expression) {
	return expression.toLowerCase();
}

function replaceSynonymsPreTransform(expression) {
	let split = expression.split(/\s+/);
	let replacedExpression = [];
	split.forEach(n => {
		let synonym = synonyms.get(n);
		if (synonym) {
			replacedExpression.push(synonym);
		} else {
			replacedExpression.push(n);
		}
	});

	return replacedExpression.join(' ');
}

function wordsToNumbersPreTransform(expression) {
	return wtn.wordsToNumbers(expression);
}

function normalizeDatesPreTransform(expression) {
	return dates.normalizeDates(expression);
}

function normalizeNumbersPreTransform(expression) {
	return expression.replace(/:/g, ' ');
}

function normalizeNumbersPostTransform(expression) {
	let units = ['seconds', 'minutes', 'hours'];
	let normalized = [];
	let index = 0;
	let currentNumber = null;
	let currentUnits = units.slice();

	expression.forEach(n => {
		if (n.type == types.NUMBER) {
			if (currentUnits.length == 0) {
				throw new Error('invalid format');
			}
			
			let currentTimeUnit = currentUnits.pop();
			let currentValue = n.value;

			if (!currentNumber) {
				currentNumber = {
					type: types.NUMBER,
					value: {} 
				}
			}
			currentNumber.value[currentTimeUnit] = currentValue;
		} else {
			if (currentNumber) {
				normalized.push(currentNumber);
				currentNumber = null;
				currentUnits = units.slice();
			}
			normalized.push(n);
		}
	});
	
	if (currentNumber) {
		normalized.push(currentNumber);
	}

	return normalized;
}

function normalizeTimePeriodsPostTransform(expression) {
	let normalized = [];
	let previousTimePeriod = false;
	expression.forEach(n => {
		if (n.type == types.TIME_PERIOD) {
			if (previousTimePeriod) {
				let and = {
					type: types.OPERATION,
					value: 'and', 
					precedence: operations['and'].precedence, 
					apply: operations['and'].apply
				};

				normalized.push(and);
			}
			previousTimePeriod = true;
		} else {
			previousTimePeriod = false;
		}
		normalized.push(n);
	});

	return normalized;
}

function toPostfixPostTransform(transformedExpression) {
	let stack = [];
	let result = [];
	
	transformedExpression.forEach(n => {
		if (n.type == types.TIME_PERIOD || n.type == types.TIME_POINT || n.type == types.NUMBER) {
			result.push(n);
		}
		
		if (n.type == types.OPERATION) {
			while (stack.length > 0) {
				let operation = stack[stack.length - 1];
				if (operation.precedence > n.precedence) {
					result.push(stack.pop());
				} else {
					break;
				}
			}
			stack.push(n);
		}
	});
	
	while (stack.length > 0) {
		result.push(stack.pop());
	}
	
	return result;
}

function transformExpression(text, options) {
	let preTransformedExpression = text;
	[
		baseSanitizatonPreTransform,
		wordsToNumbersPreTransform, 
		replaceSynonymsPreTransform, 
		normalizeDatesPreTransform,
		normalizeNumbersPreTransform
	].forEach(preTransform => {
		preTransformedExpression = preTransform(preTransformedExpression, options);
	});
	
	let transformedExpression = transform(preTransformedExpression, options);
	
	[
		normalizeNumbersPostTransform, 
		normalizeTimePeriodsPostTransform, 
		toPostfixPostTransform
	].forEach(postTransform => {
		transformedExpression = postTransform(transformedExpression, options);
	})

	return transformedExpression;
}

function evaluate(expression, options) {
	let postfix = transformExpression(expression, options);
	let stack = [];
	
	postfix.forEach(n => {
		if (n.type == types.OPERATION) {
			if (n.unary) {
				let x = stack.pop();
				var r = n.apply(x);
			} else {
				let y = stack.pop();
				let x = stack.pop();
				var r = n.apply(x, y, options.timeZone);				
			}
			stack.push(r);
		} else {
			stack.push(n);
		}
	});
	
	if (stack.length == 1) {
		return stack.pop().value;
	} else {
		throw new Error('invalid format');
	}
}

module.exports.evaluate = evaluate;