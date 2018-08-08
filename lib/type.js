
module.exports = {
    /**
     * f.ex. 1 day 2 hours and 3 minutes
     */
    TimePeriod: function(value) {
        this.value = value || {};

        this.set = function(timeUnit, value) {
            if (timeUnit in this.value) {
                this.value[timeUnit] += value;
            } else {
                this.value[timeUnit] = value;
            }
        }
        return this;
    },

    /**
     * f.ex. before, after, at
     */
    Operation: function(value, apply, precedence) {
        this.value = value || {};
        this.apply = apply;
        this.precedence = precedence;

        this.isUnary = function() {
            return this.apply.length == 1;
        }

        return this;
    },

    /**
     * f.ex. now, tomorrow, 29.07.2018
     */
    TimePoint: function(value) {
        this.value = value;
        return this;
    }, 
    
    /**
     * f.ex. 12:35:20
     */
    Number: function(value) {
        this.value = null == value || typeof value == 'undefined' ? {} : value;

        this.set = function(timeUnit, value) {
            this.value[timeUnit] = value;
        }

        return this;
    },

    timeUnits: new Set(['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'])
};