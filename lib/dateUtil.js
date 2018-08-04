const moment = require('moment-timezone');

const formats = {
    dot: {
        regex: '(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})', 
        parse: (arr) => {
            return arr[1] + "." + arr[2] + "." + arr[3];
        }
    },
    slash: {
        regex: '(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})',
        parse: (arr) => {
            return arr[1] + "." + arr[2] + "." + arr[3];
        }
    }, 
    hyphen: {
        regex: '(\\d{4})-(\\d{1,2})-(\\d{1,2})',
        parse: (arr) => {
            return arr[3] + "." + arr[2] + "." + arr[1];
        }
    }, 
    dayMonth: {
        regex: '\\d{1,2}\\s+(january|february|march|april|may|june|july|august|september|october|november|december)\\s+\\d{4}',
        parse: (arr) => {
            let date = new Date(arr[0]);
            return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
        }
    },
    monthDay: {
        regex: '(january|february|march|april|may|june|july|august|september|october|november|december)\\s+\\d{1,2}\\s+\\d{4}',
        parse: (arr) => {
            let date = new Date(arr[0]);
            return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
        }
    }
};

function normalizeDates(text) {
    let replaced = text;
    for (let f in formats) {
        let format = formats[f];
        let regexp = RegExp(format.regex);
        let arr = regexp.exec(replaced);

        if (arr) {
            replaced = replaced.replace(arr[0], format.parse(arr));
        }
    }
   
    return replaced;
}

function parseNormalizedDate(text) {
    let split = text.split('.');
    let year = split[2];

    // resolve the day and month
    let day, month;
    let potentialDay = split[0];
    let potentialMonth = split[1];

    if (potentialDay <= 31) {
        if (potentialMonth <= 12) {
            day = potentialDay;
            month = potentialMonth;
        } else {
            if (potentialDay <= 12 && potentialMonth <= 31) {
                month = potentialDay;
                day = potentialMonth;
            }
        }
    }

    if (typeof(day) != 'undefined' && typeof(month) != 'undefined') {
        return {
            days: parseInt(day), 
            months: parseInt(month),
            years: parseInt(year)
        }
    }
}

function dateManipulator(input, timeZone) {
    this.add = function(values) {
        this._date.add(values);
        return this;
    }

    this.subtract = function(values) {
        this._date.subtract(values);
        return this;
    }

    this.set = function(values) {
        this._date.set(values);
        return this;
    }

    this.getTime = function() {
        return this._date.valueOf();
    }

    /* Constructor */
    if (typeof input === 'number' || input instanceof Date) {
        this._date = moment(input);
    } else if (input.constructor.name == 'dateManipulator') {
        this._date = moment(input.getTime());
    } else if (typeof input === 'object') {
        this._date = moment(input);
    }

    this._date.tz(timeZone);
}

module.exports.normalizeDates = normalizeDates;
module.exports.parseNormalizedDate = parseNormalizedDate;
module.exports.DateManipulator = dateManipulator;