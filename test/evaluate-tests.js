const assert = require('assert');

describe('evaluate', function() {
    describe('test relative time periods', function() {
        let t3 = require('../text-to-time.js');

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
        let t3 = require('../text-to-time.js');

        let date = new Date(Date.UTC(2018, 6, 24, 16, 15, 0, 0));
        let expected = date.getTime();

        let equivalentDates = [
            '24.07.2018 at 16:15:00',
            'on 24.07.2018 at 16:15:00',
            '16:15:00 on 24.07.2018', 
            '07.24.2018 at 16:15',
            '24/07/2018 at quarter past 16',
            '07/24/2018 at 15 minutes past 16',
            '15 minutes after 24 July 2018 at 16',
            '45 minutes before 24 Jul 2018 at 17',
            '5 minutes from July 24 2018 at 16:10',
            '15 minutes before Jul 24 2018 at half past 16', 
            '2018-07-24 at quarter past sixteen',
            'on 2018-07-24 at quarter past sixteen',
            'July 24, 2018 at 15 minutes past 16'
        ];
        equivalentDates.forEach(d => {
            it ('"' + d + '" should be equivalent to 24.07.2018 at 16:15:00', function() {
                t3().evaluate(d, (err, evaluated) => {
                    assert.equal(evaluated.timestamp, expected);
                });
                
            });
        });
    });

    describe('test am/pm', function() {
        let t3 = require('../text-to-time.js');

        let todayAtHours = (hours) => {
            let now = new Date();
            let date = new Date(Date.UTC(now.getFullYear(), now.getUTCMonth(), now.getUTCDate(), hours));
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
                t3().now(new Date().getTime()).evaluate(d.value, (err, evaluated) => {
                    assert.equal(evaluated.timestamp, d.expected);
                });
            });
        });
    });

    describe('test date format', function() {
        let t3 = require('../text-to-time.js');
        
        let date = new Date(Date.UTC(2018, 6, 4));
        let expected = date.getTime();

        let equivalentDates = [
            {text: '04.07.2018', format: 'DD.MM.YYYY'}, 
            {text: '4.7.2018', format: 'D.M.YYYY'}, 
            {text: '4 July 2018', fotmat: 'D MMM YYYY'}, 
            {text: '2018 on July 4th', format: 'YYYY on MMM Dth'}, 
            {text: '0:0:0 on 7/4/2018', format: 'M/D/YYYY'},
        ];

        equivalentDates.forEach(d => {
            it('"' + d.text + '" should be equivalent to 04.07.2018', function() {
                t3().dateFormat(d.format).evaluate(d.text, (err, evaluated) => {
                    assert.equal(evaluated.timestamp, expected);
                });
                
            });
        });
    });

    describe('test time zone', function() {
        let t3 = require('../text-to-time.js');

        let date = new Date(Date.UTC(2018, 4, 6, 16, 15, 24));
        let expected = date.getTime();
        
        let equivalentDates = [
            {text: '06 May 2018 at 19:15:24', timeZone: 'Europe/Sofia'}, 
            {text: '06 May 2018 at 18:15:24', timeZone: 'Europe/Berlin'},
            {text: '06 May 2018 at 17:15:24', timeZone: 'Europe/Dublin'},
            {text: '06 May 2018 at 16:15:24', timeZone: 'UTC'},
        ];

        equivalentDates.forEach(d => {
            it ('"' + d.text + '" in ' + d.timeZone + ' should be equvalent to 06 May 2018 at 16:15:24 UTC', function() {
                t3().timeZone(d.timeZone).evaluate(d.text, (err, evaluated) => {
                    assert.equal(evaluated.timestamp, expected);
                    assert.equal(evaluated.timeZone, d.timeZone);
                });
            });
        });
    });

    describe('test errors' , function() {
        let t3 = require('../text-to-time.js');

        let wrongExpressions = [
            '1 hour 4 minutes before 3 hours', 
            'before today', 
            '2 hours and 05.01.2018'
        ];

        wrongExpressions.forEach(w => {
            it (w + ' is invalid', function() {
                t3().evaluate(w, (err) => {
                    assert(err);
                });
            });
        });
    }); 
});