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

    /* Constructor */
    if (typeof input === 'number' || input instanceof Date) {
        this._date = moment.tz(input, timeZone);
    } else if (input.constructor.name == 'dateManipulator') {
        this._date = moment.tz(input.getTime(), timeZone);
    } else if (typeof input === 'object') {
        this._date = moment.tz(input, timeZone);
    }
}

module.exports.DateManipulator = dateManipulator;