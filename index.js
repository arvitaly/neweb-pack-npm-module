var co = require('co');
var write = require('./write');
var fs = require('fs');
var patch = require('module-require-patch');
var getModuleInfo = require('node-module-info');
//var getModuleInfo = require('node-module-info');
module.exports = (modulePath, config, callback) => {
    //var moduleInfo = getModuleInfo(modulePath);

    var dependencies = [];

    co(packFile.bind(this, modulePath)).then(() => {
        callback(null, dependencies);
    }).catch((err) => {
        callback(err);
    })

    function* packFile(modulePath) {
        var moduleInfo = getModuleInfo(modulePath).getFullInfo();
        if (dependencies.indexOf(moduleInfo.defineName) > -1) {
            return;
        }
        dependencies.push(moduleInfo.defineName);
        //Read current file
        var content = yield fs.readFile.bind(fs, modulePath);
        var patchInfo = patch("" + content, modulePath);
        //Pack every dependence
        yield Promise.all(patchInfo.dependencies.map((d) => {
            return co(packFile.bind(this, d.info.resolvedPath));
        }));
        yield write(patchInfo, config);
    }
}