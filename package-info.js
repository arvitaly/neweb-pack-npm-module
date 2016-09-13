var path = require('path');
var paths = require('module-require-patch/paths');
module.exports = (filename, dest) => {
    var packageRoot = paths(filename).packageRoot,
        packageInfo = require(path.join(packageRoot, "package.json")),
        moduleName = path.relative(packageRoot, filename).replace(/\.js$/, "").replace(/\\/gi, "/"),
        destPath = path.resolve(path.join(dest, packageInfo.name + "@" + packageInfo.version, moduleName)),
        destFile = destPath + path.extname(filename),
        destInfoFile = destPath + ".nwb.json",
        destInfoStat,
        destInfo;
    try {
        destInfoStat = require('fs').lstatSync(destInfoFile);
        destInfo = require(destInfoFile);
    } catch (e) {
        destInfoStat = null;
    }
    return {
        request: moduleName,
        package: {
            name: packageInfo.name,
            version: packageInfo.version
        },
        dest: {
            stat: destInfoStat,
            infoFile:destInfoFile,
            path: destPath,
            file: destFile,
            info: destInfo
        }
    }
}