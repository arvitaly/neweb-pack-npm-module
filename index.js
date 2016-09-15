var fs = require('fs');
var _ = require('lodash');
var patch = require('module-require-patch');
//var getModuleInfo = require('node-module-info');
module.exports = (modulePath, config, callback) => {
    //var moduleInfo = getModuleInfo(modulePath);

    var packages = [];

    packFile(modulePath, (err) => {
        if (err) return callback(err);
        callback(null, packages);
    });

    function packFile(modulePath, callback) {
        //Read current file
        fs.readFile(modulePath, (err, content) => {
            if (err) return callback(err);
            var patchInfo = patch("" + content, modulePath);
            addPatchInfo(patchInfo);
            //Pack every dependence
            if (patchInfo.dependencies.length == 0){
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

    }
    function addPatchInfo(patchInfo) {
        var pack = _.find(packages, (pack_) => {
            return pack_.name === patchInfo.info.packageInfo.name && pack_.version === patchInfo.info.packageInfo.version;
        })
        if (!pack) {
            pack = { name: patchInfo.info.packageInfo.name, version: patchInfo.info.packageInfo.version, modules: [] };
            packages.push(pack);
        }
        var mod = _.find(pack.modules, (m) => {
            return m.defineName === patchInfo.info.defineName;
        })
        if (!mod) {
            mod = { code: patchInfo.code, defineName: patchInfo.info.defineName };
            pack.modules.push(mod);
        }
        //console.log(pack)
    }
}
