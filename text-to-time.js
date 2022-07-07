const evaluate = require('./lib/evaluate.js');

const clearText = (text) => {
    
    // Relative???
    const words = ['en', 'dentro'];
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (text.includes(word)) {
            text = text + ' now';
        } else {
            text = text
        }
    }

    // phrases to words
    text = text.replace('a las', 'at')
    text = text.replace('media hora', '30 minutes')
    
    return {
        text,
    }
}

class textToTime {
    constructor(text) {
        this.text = text;
        this._now = new Date().getTime();
        this._timeZone = 'UTC';
    }
    /**
     * Date.getTime()
     * @param {Date} now 
     * @returns 
     */
    now(now) {
        if (now instanceof Date) {
            this._now = now.getTime();
        } else if (typeof now == 'number') {
            this._now = now;
        }
        return this;
    }

    /**
     * Sets the timezone (doesnt check if valid)
     * @param {String} timeZone 
     * @returns 
     */
    timeZone(tz) {
        this._timeZone = tz;
        return this;
    }
    
    /**
     * 
     * @param {Date} date 
     * @returns 
     */
    dateFormat(date) {
        this._dateFormat = date;
        return this;
    }

    evaluate = (expression, callback) => {
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

    static async toTime(string) {
        const {text} = clearText(string);
        return new Promise((res, rej) => {
            const C = new textToTime(text)
            C.evaluate(C.text, (err, result) => {
                if (err) rej(err);
                res(result);
            })
        })
    }
}

module.exports = textToTime;