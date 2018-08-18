const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthsRegex = '(' + months.join('|') + ')';

const formats = {
    dot: {
        regex: '(\\d{1,2})\\.(\\d{1,2})(\\.(\\d{4}))?', 
        parse: (arr) => {
            let fullYear = getCurrentYear();
            if (arr[4]) {
                fullYear = arr[4];
            }
            return arr[1] + "." + arr[2] + "." + fullYear;
        }
    },
    slash: {
        regex: '(\\d{1,2})\\/(\\d{1,2})(\\/(\\d{4}))?',
        parse: (arr) => {
            return arr[1] + "." + arr[2] + "." + arr[4];
        }
    }, 
    hyphen: {
        regex: '(\\d{4})-(\\d{1,2})-(\\d{1,2})',
        parse: (arr) => {
            return arr[3] + "." + arr[2] + "." + arr[1];
        }
    }, 
    dayMonth: {
        regex: '(\\d{1,2})\\s+' + monthsRegex + '(\\s*,?\\s*(\\d{4}))?',
        parse: (arr) => {
            let date = new Date(arr[0]);
            let fullYear = date.getFullYear();
            console.log('arr', arr);
            if (typeof arr[4] == 'undefined') {
                fullYear = getCurrentYear();
            }
            return date.getDate() + '.' + (date.getMonth() + 1) + '.' + fullYear;
        }
    },
    monthDay: {
        regex: monthsRegex + '\\s+(\\d{1,2})(\\s*,?\\s*(\\d{4}))?',
        parse: (arr) => {
            let date = new Date(arr[0]);
            let fullYear = date.getFullYear();
            console.log('arr', arr);
            if (typeof arr[4] == 'undefined') {
                fullYear = getCurrentYear();
            }
            return date.getDate() + '.' + (date.getMonth() + 1) + '.' + fullYear;
        }
    }
};

const masks = new Map([
    ['DD', {regex: '(\\d{2})', type:'days'}],
    ['D', {regex: '(\\d{1,2})', type:'days'}],
    ['MMM', {regex: monthsRegex, type: 'months'}],
    ['MM', {regex: '(\\d{2})', type:'months'}],
    ['M', {regex: '(\\d{1,2})', type:'months'}],
    ['YYYY', {regex: '(\\d{4})', type:'years'}],
]);

function getCurrentYear() {
    return new Date().getFullYear().toString();
}
function normalizeDates(text) {
    let replaced = text;
    for (let f in formats) {
        let format = formats[f];

        let regexp = RegExp(format.regex);
        let arr = regexp.exec(replaced);
        if (arr) {
            replaced = replaced.replace(arr[0], format.parse(arr));
            console.log(replaced);
        }
    }
   
    return replaced;
}

function normalizeExplicitlyFormattedDates(text, format) {
    let formatRegex = format;
    
    let masksArr = [];
    for (let [mask, rg] of masks) {
        if (formatRegex.includes(mask)) {
            let maskIndex = format.indexOf(mask);
            let maskType = rg.type;
            formatRegex = formatRegex.replace(mask, rg.regex);
            masksArr.push({index:maskIndex, type:maskType});
        }
    }
    
    masksArr.sort((m1, m2) => {return m1.index - m2.index});
    let maskGroups = {};
    for (let i = 0; i < masksArr.length; ++i) {
        maskGroups[masksArr[i].type] = i;
    }
    
    let regexp = RegExp(formatRegex, 'gi');
    var a;
    let normalizedText = text;
    while ((a = regexp.exec(normalizedText)) != null) {
        let matched = a[0];
        let matchedMonth = a[maskGroups['months'] + 1];
        let resolvedMonth = resolveMonthNumber(matchedMonth);
        let normalized = a[maskGroups['days'] + 1] + '.' + resolvedMonth + '.' + a[maskGroups['years'] + 1];
        normalizedText = normalizedText.replace(matched, normalized);
    }

    return normalizedText;
}

function resolveMonthNumber(matchedMonth) {
    let monthNumber = months.indexOf(matchedMonth.toLowerCase());
    let resolvedMonth = matchedMonth;

    if (monthNumber >= 0) {
        resolvedMonth = monthNumber + 1;
    }

    return resolvedMonth.toString();
}

function parseExplicitlyFormattedDate(text) {
    let split = text.split('.');
    return {
        days: parseInt(split[0]),
        months: parseInt(split[1]), 
        years: parseInt(split[2])
    };
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

module.exports.normalizeDates = normalizeDates;
module.exports.parseNormalizedDate = parseNormalizedDate;

module.exports.normalizeExplicitlyFormattedDates = normalizeExplicitlyFormattedDates;
module.exports.parseExplicitlyFormattedDate = parseExplicitlyFormattedDate;