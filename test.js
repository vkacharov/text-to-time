const T = require('./index');

const text = 'now';

const test = async () => {
    try {
        const a = await T.toTime(text);
        console.log(a)
    } catch (err) {
        console.log(err)
    }
}

test()