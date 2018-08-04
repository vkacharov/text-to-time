const evaluate = require('./lib/evaluate.js');

const textToTime = function() {
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

    this.evaluate = function(expression) {
        return {
            now: this._now, 
            timeZone: this._timeZone, 
            timestamp: evaluate.evaluate(expression, {
                now: this._now, 
                timeZone: this._timeZone
            })
        }
    }

    return this;
}

module.exports = textToTime;