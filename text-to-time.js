const evaluate = require('./lib/evaluate.js');

const instance = function() {
    this._now = new Date().getTime();
    this._timeZone = 'UTC';

    this.timeZone = function(timeZone) {
       this._timeZone = timeZone;
       return this;
    } 

    this.now = function(now) {
        if (now instanceof Date) {
            this._now = now.getTime();
        } else if (typeof now == 'number') {
            this._now = now;
        }

        return this;
    }
    
    this.dateFormat = function(dateFormat) {
        this._dateFormat = dateFormat;
        return this;
    }

    this.evaluate = function(expression, callback) {
        let _now = this._now;
        let _timeZone = this._timeZone;
        let _dateFormat = this._dateFormat;

        evaluate.evaluate(expression, {
            now: _now, 
            timeZone: _timeZone, 
            dateFormat: _dateFormat,
        }, (err, result) => {
            if (err) {
                callback({
                    message: err.message
                });
            } else {
                callback(undefined, {
                    now: _now,
                    timeZone: _timeZone, 
                    timestamp: result
                });
            }
        });
    }

    return this;
}

function textToTime() {
    return new instance();
}
module.exports = textToTime;