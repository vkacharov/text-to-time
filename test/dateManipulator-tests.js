var assert = require('assert');
var DateManipulator = require('../lib/dateUtil.js').DateManipulator;

describe('DateManipulator tests', function(){
    describe('constructor', function() {
        let testDate = new Date('2018-07-26 10:47:04');
        let testTimestamp = testDate.getTime();
        let testObject = {
            years: 2018, 
            months: 6, 
            days: 26, 
            hours: 10, 
            minutes: 47, 
            seconds: 4, 
            milliseconds: 0
        };
        let expectedTimestamp = testTimestamp;

        let equivalentDates = [
            {value: testDate, expected: expectedTimestamp}, 
            {value: testDate, expected: expectedTimestamp}, 
            {value: testObject, expected: expectedTimestamp}
        ]; 

        equivalentDates.forEach(e => {
            it('"' + JSON.stringify(e.value) + '" should be equal to ' + expectedTimestamp, function() {
                var evaluated = new DateManipulator(e.value).getTime();
                assert.equal(evaluated, e.expected);
            });
        })
    });
});