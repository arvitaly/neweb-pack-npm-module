var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
module.exports = (patchInfo, config) => {
    return new Promise((resolve, reject) => {
        var destFile = path.resolve(path.join(config.dest, patchInfo.info.packageInfo.name + "@" + patchInfo.info.packageInfo.version + "/" + patchInfo.info.relativePath));
        mkdirp(path.dirname(destFile), (err) => {
            if (err) return reject(err);
            fs.writeFile(destFile, patchInfo.code, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    })
}