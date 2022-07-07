<div align="center">
	<h1>text-to-time</h1>
   <a href="https://www.npmjs.com/package/@ifraan_/text-to-time"><img src="https://badgen.net/npm/v/@ifraan_/text-to-time?color=red" alt="NPM-Version"/></a>
   <a href="https://www.npmjs.com/package/@ifraan_/text-to-time"><img src="https://badgen.net/npm/dt/@ifraan_/text-to-time?color=red" alt="NPM-Downloads"/></a>
   <a href="https://github.com/iFraan/text-to-time"><img src="https://badgen.net/github/stars/iFraan/text-to-time?color=green" alt="Github Stars"/></a>
   <a href="https://github.com/iFraan/text-to-time/issues"><img src="https://badgen.net/github/issues/iFraan/text-to-time?color=green" alt="Issues"/></a>
</div>

## The soul purpose of this fork its to translate the 'free form text' to spanish. 
Publishing since it may come in handy for some.
## Installation
### Dependencies
``
moment moment-timezone words-to-numbers
``

To install use:
```shell
npm i @ifraan_/text-to-time
```

Example code
```js
const text = 'ahora';
try {
    const timestamp = await T.toTime(text);
    console.log(timestamp)
    /* { now: 1657214873022, timeZone: 'UTC', timestamp: 1657214873022 } */
} catch (err) {
    console.log(err)
    /* invalid word [word] */
}
```

# OLD README FOR REFERENCE
## Text to Time
Evaluates free-form, unstructured text to a timestamp. Capable of calculating time expressions like 'before', 'after', 'ago', and so on. Returns an object containing the timestamp calcuated from the text. 

Possible use cases:
* Regular date and time parsing
* Extracting and calculating dates from unstructured text
* Skills for speech-enable asistents like Alexa or Google Home

To install, use
```
npm install text-to-time
```

## Usage
Let's start with the basics
```javascript
const t3 = require('text-to-time');
let callback = (err, evaluated) => {
    if (err) {
        console.error(err);
    } else {
        console.log(evaluated);
    }
};
t3().evaluate('now', callback);
```
`evaluate()` is the main function of Text to Time. It takes in the text and a callback function. The callback argument `evaluated` is the result of the evaluation in the following format:

```
{
    timestamp: the timestamp evaluated from the expression, 
    now: the current timestamp, for relative expressions,
    timeZone: the time zone used to evaluate the expression
}
```

## Relative expressions
Text to Time evaluates expressions relative to the current time. Let's assume the current moment is `2018-08-04 22:00:00 UTC`. 

```javascript
t3().evaluate('now', callback);
// { timestamp: 1533335400000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('yesterday', callback);
// { timestamp: 1533333600000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('tomorrow', callback);
// { timestamp: 1533506400000, now: 1533420000000, timeZone: 'UTC' }
```

### .now()
Use `now()` to change the current time related to which the expression is evaluated.

```javascript
t3().evaluate('yesterday', callback);
// { timestamp: 1533333600000, now: 1533420000000, timeZone: 'UTC' }

let someDifferentNow = 1533335400000; // 2017-08-09 12:15:00 UTC 
t3().now(someDifferentNow).evaluate('yesterday', callback); 
// { timestamp: 1502194500000, now: 1502280900000, timeZone: 'UTC' }
```

## Absolute time
Text to Time evaluates expressions describing precise point in time. It supports all kinds of expressions. 

```javascript
t3().evaluate('2018-08-01 at 13:22:10', callback);
// { timestamp: 1533043330000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('3:25:00 AM on 08/22/2018', callback);
// { timestamp: 1534821900000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('3:25:00 AM on 17 June 2018', callback);
// { timestamp: 1529119500000, now: 1533420000000, timeZone: 'UTC' }

```

Because they define absolute point in time `now()` is not used in these expressions. 

### .timeZone()
Use `.timeZone()` to set the time zone of the expression.
```javascript
t3().evaluate('today at 4', callback);
// { timestamp: 1533355200000, now: 1533420000000, timeZone: 'UTC' }

t3().timeZone('America/New_York').evaluate('today at 4', callback);
// { timestamp: 1533369600000, now: 1533420000000, timeZone: 'America/New_York' }

```

## Time operations
Text to Time calculates time operations like *ago*, *before*, *after*, *at*, *on*, *past*. 

```javascript
t3().evaluate('3 days ago', callback);
// { timestamp: 1533160800000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('15 minutes before tomorrow at 1 PM', callback);
// { timestamp: 1533473100000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('quarter to 11 PM on 04.08.2018', callback);
// { timestamp: 1533336300000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('3 hours after now', callback);
// { timestamp: 1533430800000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('half past 3 AM on 22.08.2018', callback);
// { timestamp: 1534822200000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('5 days and 5 hours from yesterday', callback);
// { timestamp: 1533783600000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('3 hours before 01 August 2018 at 13:00', callback);
// { timestamp: 1533031200000, now: 1533420000000, timeZone: 'UTC' }
```

## Date resolution
Text to Time is cabable of auto-resolving dates in different formats, if the date format is not explicitly set. The following dates will all be resolved to `22 August 2018`. If the year is omitted, Text to Time defaults to the current year.

* 2018-08-22 
* 22 August 2018
* 22 August
* 22.08.2018
* 22.08
* 08.22.2018
* 08.22
* 08/22/2018
* 08/22
* 22/08/2018
* 22/08


Text to Time implies the date and the month depending on their value.

### .dateFormat()
Use `.dateFormat()` to explicitly set the date format. The date format can be any text containing the date format placeholders.


| Placeholder   | Meaning                      | Example          |
| --------------|:----------------------------:| ----------------:|
| D             | 1 or 2 digit day             | 1, 3, 12, 23     |
| DD            | 2 digit day                  | 01, 03, 12, 23   |
| M             | 1 or 2 digit month           | 1, 3, 10, 12     |
| MM            | 2 digit month                | 01, 03, 10, 12   |
| MMM           | month name, case insensitive | January, march   |
| YYYY          | 4 digit year                 | 1986, 2018       |

For example


```javascript
t3().dateFormat('DD/MM/YYYY').evaluate('01/08/2018 at 16:00:00', callback);
// { timestamp: 1533139200000, now: 1533420000000, timeZone: 'UTC' }

t3().dateFormat('D MMM YYYY').evaluate('1 August 2018 at 16:00:00', callback);
// { timestamp: 1533139200000, now: 1533420000000, timeZone: 'UTC' }

t3().dateFormat('the day of DD and the month of MMM in the year YYYY')
    .evaluate('the day of 01 and the month of August in the year 2018 at 16:00:00', callback);
// { timestamp: 1533139200000, now: 1533420000000, timeZone: 'UTC' }
```

## Fuzzy matching
Text to Time is capable of evaluating incomplete words and mixed text-and-numbers expressions. For example, the all of the following are equivalent to `1 day and 2 hours before 19 February 2018 at 10:30 AM`
* one day and two hours before nineteen February two thousand eighteen at ten thirty AM 
* 1 day and 2 hours before 19 Feb 2018 at 10 30 AM
* 1 d and 2 h before nineteenth February 2018 at 10 thirty AM
