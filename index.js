var fs = require('fs');
var write = require('./write');
var patch = require('module-require-patch');
var getModuleInfo = require('node-module-info');
//var getModuleInfo = require('node-module-info');
module.exports = (modulePath, config, callback) => {
    //var moduleInfo = getModuleInfo(modulePath);

    var dependencies = [];

    packFile(modulePath, (err) => {
        if (err) return callback(err);
        callback(null, dependencies);
    });

    function packFile(modulePath, callback) {
        var moduleInfo = getModuleInfo(modulePath).getFullInfo();
        if (dependencies.indexOf(moduleInfo.defineName) > -1) {
            return callback();
        }
        dependencies.push(moduleInfo.defineName);
        //Read current file
        fs.readFile(modulePath, (err, content) => {
            if (err) return callback(err);
            var patchInfo = patch("" + content, modulePath);
            write(patchInfo, config, (err) => {
                if (err) return callback(err);

                //Pack every dependence
                if (patchInfo.dependencies.length == 0) {
                    return callback();
                }
                var i = 0;
                patchInfo.dependencies.map((d) => {
                    packFile(d.info.resolvedPath, (err) => {
                        if (err) return callback(err);
                        i++;
                        if (i == patchInfo.dependencies.length) {
                            callback();
                        }
                    });
                })
            })
        })
    }
}
