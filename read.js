var fs = require('fs');
module.exports = function () {
    return new Promise((resolve, reject) => {
        var args = Array.prototype.slice.call(arguments);
        args.push((err, content) => {
            if (err) { reject(err); return }
            resolve("" + content)
        });
        fs.readFile.apply(fs, args);
    })
}