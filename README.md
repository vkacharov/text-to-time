# Text to Time
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
Start with the basics
```javascript
const t3 = require('text-to-time');
t3().evaluate('now');
```
`evaluate()` is the main function of Text to Time. It takes in the text as a parameter and returns an object as follows:

```json
{
    timestamp: the timestamp evaluated from the expression, 
    now: the current timestamp, for relative expressions,
    timeZone: the time zone used to evaluate the expression
}
```

## Relative expressions
Text to Time evaluates expressions relative to the current time. Let's assume the current moment is `2018-08-04 22:00:00 UTC`. 

```javascript
t3().evaluate('now');
// { timestamp: 1533335400000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('yesterday');
// { timestamp: 1533333600000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('tomorrow');
// { timestamp: 1533506400000, now: 1533420000000, timeZone: 'UTC' }
```

### .now()
Use `now()` to change the current time related to which the expression is evaluated.

```javascript
t3().evaluate('yesterday');
// { timestamp: 1533333600000, now: 1533420000000, timeZone: 'UTC' }

let someDifferentNow = 1533335400000; // 2017-08-09 12:15:00 UTC 
t3().now(someDifferentNow).evaluate('yesterday'); 
// { timestamp: 1502194500000, now: 1502280900000, timeZone: 'UTC' }
```

## Absolute time
Text to Time evaluates expressions describing precise point in time. It supports all kinds of expressions. 

```javascript
t3().evaluate('2018-08-01 at 13:22:10');
// { timestamp: 1533043330000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('3:25:00 AM on 08/22/2018');
// { timestamp: 1534821900000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('3:25:00 AM on 17 June 2018');
// { timestamp: 1529119500000, now: 1533420000000, timeZone: 'UTC' }

```

Because they define absolute point in time `now()` is not used in these expressions. 

### .timeZone()
Use `.timeZone()` to set the time zone of the expression.
```javascript
t3().evaluate('today at 4');
// { now: 1533420000000, timeZone: 'UTC', timestamp: 1533355200000 }

t3().timeZone('PT').evaluate('today at 4');
// { timestamp: 1533351600000, now: 1533420000000, timeZone: 'PT' }

```
### Date resolution
Text to Time is cabable of resolving the following dates in different formats. The following dates will all be resolved to `22 August 2018` 
* 2018-08-22 
* 22 August 2018
* 22.08.2018
* 08.22.2018
* 08/22/2018
* 22/08/2018
Text to Time implies which is the date and which the month depending on their value.

## Time operations
Text to Time calculates time operations like *ago*, *before*, *after*, *at*, *on*, *past*. 

```javascript
t3().evaluate('3 days ago');
// { timestamp: 1533160800000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('15 minutes before tomorrow at 1 PM');
// { timestamp: 1533473100000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('quarter to 11 PM on 04.08.2018');
// { timestamp: 1533336300000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('3 hours after now');
// { timestamp: 1533430800000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('half past 3 AM on 22.08.2018');
// { timestamp: 1534822200000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('5 days and 5 hours from yesterday');
// { timestamp: 1533783600000, now: 1533420000000, timeZone: 'UTC' }

t3().evaluate('3 hours before 01 August 2018 at 13:00');
// { timestamp: 1533031200000, now: 1533420000000, timeZone: 'UTC' }
```

## Fuzzy matching
Text to Time is capable of evaluating incomplete words and mixed text-and-numbers expressions. For example, the all of the following are equivalent to `1 day and 2 hours before 19 February 2018 at 10:30 AM`
* one day and two hours before nineteen February two thousand eighteen at ten thirty AM 
* 1 day and 2 hours before 19 Feb 2018 at 10 30 AM
* 1 d and 2 h before nineteenth February 2018 at 10 thirty AM