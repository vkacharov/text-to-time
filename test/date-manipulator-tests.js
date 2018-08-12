var assert = require('assert');
var DateManipulator = require('../lib/date-manipulator.js').DateManipulator;

describe('DateManipulator tests', function(){
    describe('constructor', function() {
        let testTimestamp = Date.UTC(2018, 6, 26, 10, 47, 04);
        let testDate = new Date(testTimestamp);
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
            testDate, 
            testTimestamp, 
            testObject,
        ]; 

        equivalentDates.forEach(e => {
            it('"' + JSON.stringify(e) + '" should be equal to ' + expectedTimestamp, function() {
                let evaluated = new DateManipulator(e, 'UTC').getTime();
                assert.equal(evaluated, expectedTimestamp);
            });
        })
    });
});