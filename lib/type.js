
module.exports = {
    /**
     * f.ex. 1 day 2 hours and 3 minutes
     */
    TIME_PERIOD: 'timePeriod',

    /**
     * f.ex. before, after, at
     */
    OPERATION: 'operation',

    /**
     * f.ex. now, tomorrow, 29.07.2018
     */
    TIME_POINT: 'timePoint',
    
    /**
     * f.ex. 12:35:20
     */
    NUMBER: 'number', 

    timeUnits: new Set(['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'])
};