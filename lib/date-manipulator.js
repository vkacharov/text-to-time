const moment = require('moment-timezone');

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

    this.setCurrentYear = function() {
        let currentYear = moment().tz(this._timeZone).year();
        this._date.year(currentYear);
    }
    /* Constructor */
    if (typeof input === 'number' || input instanceof Date) {
        this._date = moment.tz(input, timeZone);
    } else if (input.constructor.name == 'dateManipulator') {
        this._date = moment.tz(input.getTime(), timeZone);
    } else if (typeof input === 'object') {
        this._date = moment.tz(input, timeZone);
    }
    this._timeZone = timeZone;
}

module.exports.DateManipulator = dateManipulator;