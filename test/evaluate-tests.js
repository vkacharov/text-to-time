var assert = require('assert');
var t3 = require('../text-to-time.js');

describe('evaluate', function() {
    describe('test relative time periods', function() {
        var now = new Date().getTime();

        let equivalentToNowExpressions = [
            'now', 
            'today',
            '1 day before tomorrow', 
            '1 day from yesterday', 
            '1 minute after 60 seconds before now', 
            '1 hour before 60 minutes after now', 
            '1 day after yesterday', 
            '1 year before 6 months after 6 months after today'
        ];

        equivalentToNowExpressions.forEach(e => {
            it ('"' + e + '" should be equivalent to now', function() {
                t3().now(now).evaluate(e, (err, evaluated) => {
                    assert.equal(evaluated.timestamp, now);
                });
                
            });
        });
    });

    describe('test absolute dates', function(){
        let date = new Date();
        date.setDate(24);
        date.setMonth(6);
        date.setYear(2018);
        date.setHours(16,15,0,0);
        
        let expected = date.getTime();
        let equivalentDates = [
            '24.07.2018 at 16:15:00',
            '16:15:00 on 24.07.2018', 
            '07.24.2018 at 16:15',
            '24/07/2018 at quarter past 16',
            '07/24/2018 at 15 minutes past 16',
            '15 minutes after 24 July 2018 at 16',
            '45 minutes before 24 Jul 2018 at 17',
            '5 minutes from July 24 2018 at 16:10',
            '15 minutes before Jul 24 2018 at half past 16', 
            '2018-07-24 at quarter past sixteen',
        ];
        equivalentDates.forEach(d => {
            it ('"' + d + '" should be equivalent to 24.07.2018 at 16:15:00', function() {
                t3().now(new Date().getTime()).timeZone('').evaluate(d, (err, evaluated) => {
                    assert.equal(evaluated.timestamp, expected);
                });
                
            });
        });
    });

    describe('test am/pm', function() {

        let todayAtHours = (hours) => {
            let date = new Date();
            date.setHours(hours, 0, 0, 0);
            return date.getTime();
        }

        let equivalentDates = [
            {value: 'today at 4', expected: todayAtHours(4)},
            {value: 'today at 4 am', expected: todayAtHours(4)}, 
            {value: 'today at 16', expected: todayAtHours(16)}, 
            {value: 'today at 4 pm', expected: todayAtHours(16)},
            {value: 'today at 16 pm', expected: todayAtHours(16)}, 
            {value: 'today at 12 pm', expected: todayAtHours(12)}, 
            {value: 'today at 12 am', expected: todayAtHours(0)} 
        ];

        equivalentDates.forEach(d => {
            it ('"' + d.value + '" should be equivalent to ' + d.expected, function() {
                t3().now(new Date().getTime()).timeZone('').evaluate(d.value, (err, evaluated) => {
                    assert.equal(evaluated.timestamp, d.expected);
                });
            });
        });
    });

    describe('test errors' , function() {
        let wrongExpressions = [
            '1 hour 4 minutes before 3 hours', 
            'before today', 
            '2 hours and 05.01.2018'
        ];

        wrongExpressions.forEach(w => {
            it (w + ' is invalid', function() {
                t3().evaluate(w, (err, evaluated) => {
                    assert(err);
                });
            });
        });
    }); 
});