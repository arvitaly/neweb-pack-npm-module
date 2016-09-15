var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
module.exports = (patchInfo, config, callback) => {
    var destFile = path.resolve(path.join(config.dest, patchInfo.info.packageInfo.name + "@" + patchInfo.info.packageInfo.version + "/" + patchInfo.info.relativePath));
    mkdirp(path.dirname(destFile), (err) => {
        if (err) return callback(err);
        fs.writeFile(destFile, patchInfo.code, callback);
    })
}