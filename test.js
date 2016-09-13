var async = require('async');

function a(b, d, e) {
    console.log(b, d)
    setTimeout(() => {
        e(null, "HUI")
    }, 100)
}

async.parallel({
    f1: (cb) => async.parallel([a.bind(this, 1, 2), a.bind(this, 3, 4)], cb),
    f2: (cb) => async.parallel([a.bind(this, 5, 6), a.bind(this, 7, 8)], cb)
}, (err, results) => {
    console.log(err, results);
})