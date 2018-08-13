"use strict";

const wtn = require('words-to-numbers');

const synonyms = require('./synonym.js');
const formatUtils = require('./format-util.js');
const DateManipulator = require('./date-manipulator.js').DateManipulator;

const types = require('./type.js');
const Number = types.Number;
const TimePeriod = types.TimePeriod;
const Operation = types.Operation;
const TimePoint = types.TimePoint;
const timeUnits = types.timeUnits;

const operations = require('./operation.js');



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
			let timePeriod = new TimePeriod();
			timePeriod.set(timeUnit, value);
			timePeriod.size = 2;
			return timePeriod;
		}
	}
	
	return null;
}

function transformOperation(expression, index) {
	let e = expression[index];
	if (e in operations) {
		
		let operation = new Operation(e, operations[e].apply, operations[e].precedence);
		operation.size = 1;
		return operation;
	}

	return null; 
}

function transformTimePoint(expression, index, options) {
	let e = expression[index];
	if (e in timePoints) {
		let timePoint = new TimePoint(timePoints[e](options));
		timePoint.size = 1;
		return timePoint;
	}

	return null;
}

function transformNumber(expression, index) {
	let e = expression[index];
	if (!isNaN(e)) {
		let number = new Number(parseInt(e));
		number.size = 1;
		return number;
	}
}

function transformDate(expression, index, options) {
	let e = expression[index];
	let regex = new RegExp('\\d{1,2}\\.\\d{1,2}\\.\\d{4}', 'g');
	if (regex.test(e)) {
		let transformedDate = formatUtils.parseNormalizedDate(e);
		transformedDate.months -= 1;
		let value = new DateManipulator(transformedDate, options.timeZone).getTime();
		let timePoint = new TimePoint(value);
		timePoint.size = 1;
		return timePoint;
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
			return new Error('invalid format at ' + split[index]);
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

function normalizeDatesPreTransform(expression, options) {
	if (options.dateFormat) {
		return expression;
	} else {
		return formatUtils.normalizeDates(expression);
	}
}

function normalizeExplicitlyFormattedDatesPreTransform(expression, options) {
	if (options.dateFormat) {
		return formatUtils.normalizeExplicitlyFormattedDates(expression, options.dateFormat);
	} else {
		return expression;
	}
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
		if (n instanceof Number) {
			if (currentUnits.length == 0) {
				return new Error('invalid format');
			}
			
			let currentTimeUnit = currentUnits.pop();
			let currentValue = n.value;

			if (!currentNumber) {
				currentNumber = new Number();
			}
			currentNumber.set(currentTimeUnit, currentValue);
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
		if (n instanceof TimePeriod) {
			if (previousTimePeriod) {
				let and = new Operation('and', operations['and'].apply, operations['and'].precedence);
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
		if (n instanceof TimePeriod || n instanceof TimePoint || n instanceof Number) {
			result.push(n);
		}
		
		if (n instanceof Operation) {
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
		normalizeExplicitlyFormattedDatesPreTransform,
		replaceSynonymsPreTransform,  
		normalizeDatesPreTransform,
		normalizeNumbersPreTransform
	].forEach(preTransform => {
		preTransformedExpression = preTransform(preTransformedExpression, options);
	});
	
	let transformedExpression = transform(preTransformedExpression, options);

	if (transformedExpression instanceof Error) {
		return transformedExpression;
	}

	let postTransformFunctions = [
		normalizeNumbersPostTransform, 
		normalizeTimePeriodsPostTransform, 
		toPostfixPostTransform
	];
	for (let i = 0; i < postTransformFunctions.length; ++i ) {
		let postTransformationResult = postTransformFunctions[i](transformedExpression, options);

		if (postTransformationResult instanceof Error) {
			return postTransformationResult;
		} else {
			transformedExpression = postTransformationResult;
		}
	}

	return transformedExpression;
}

function evaluate(expression, options, callback) {
	let postfix = transformExpression(expression, options);

	if(postfix instanceof Error) {
		return callback(postfix);
	}
	let stack = [];
	
	for (let i = 0; i < postfix.length; ++i) {
		let n = postfix[i];

		if (n instanceof Operation) {
			if (n.isUnary()) {
				let x = stack.pop();
				var r = n.apply(x);
			} else {
				let y = stack.pop();
				let x = stack.pop();
				var r = n.apply(x, y, options.timeZone);				
			}

			if (r instanceof Error) {
				return callback(r);
			} else {
				stack.push(r);
			}
		} else {
			stack.push(n);
		}
	}
	
	if (stack.length == 1) {
		return callback(undefined, stack.pop().value);
	} else {
		return callback(new Error('invalid format'));
	}
}

module.exports.evaluate = evaluate;