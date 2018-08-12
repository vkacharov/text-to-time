var assert = require('assert');
const formatUtils = require('../lib/format-util.js');

describe('format-util tests', function() {
    describe('formatted dates', function() {
        let equivalentFormats = [
            {text: '2018-08-01', dateFormat: 'YYYY-MM-DD', expected: '01.08.2018'},
            {text: '2018-8-1', dateFormat: 'YYYY-M-D', expected: '1.8.2018'},
            {text: '01.08.2018', dateFormat: 'DD.MM.YYYY', expected: '01.08.2018'},
            {text: '1.8.2018', dateFormat: 'D.M.YYYY', expected: '1.8.2018'},
            {text: '18.12.2018', dateFormat: 'D.M.YYYY', expected: '18.12.2018'},
            {text: '01082018', dateFormat: 'DDMMYYYY', expected: '01.08.2018'},
            {text: '01 august 2018', dateFormat: 'DD MMM YYYY', expected: '01.8.2018'},
            {text: '2018-8-1', dateFormat: 'YYYY-M-D', expected: '1.8.2018'},
            {text: 'day 1 of month 8 in year 2018', dateFormat: 'day D of month M in year YYYY', expected: '1.8.2018'},
            {text: 'the year was 2018 the day was 01 and the month was 08', dateFormat: 'the year was YYYY the day was DD and the month was MM', expected: '01.08.2018'},
            {text: 'in the month of august 2018, day 1', dateFormat: 'in the month of MMM YYYY, day D', expected: '1.8.2018'},
            {text: 'In The month Of August 2018, day 1', dateFormat: 'in the month of MMM YYYY, day D', expected: '1.8.2018'},
        ];
                    
        equivalentFormats.forEach(f => {
            it('"' + f.text + '" in format "' + f.dateFormat + '" should be equivalent to ' + f.expected, function() {
                let normalized = formatUtils.normalizeExplicitlyFormattedDates(f.text, f.dateFormat);
                assert.equal(normalized, f.expected); 
            });
        });
    }); 
});