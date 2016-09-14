var fs = require('fs');
var path = require('path');
var async = require('async');
var patch = require('module-require-patch');
var getPackageInfo = require('./package-info');
var writeModule = require('./write-module');
var genName = require('./gen-name');
function pack(isMain, filename, config, cache, callback) {
    if (isMain) {
        if (cache.main[filename]) {
            cache.main[filename].listeners.push(callback.bind(undefined, null));
            return;
        }

        var info = getPackageInfo(filename, config.dest);
        if (info.dest.stat) {
            callback(null, { info: { package: info.dest.info.package, request: info.dest.info.request }, externals: info.dest.info.dependencies, internals: [] });
            return;
        }
        cache.main[filename] = {
            listeners: []
        };
    } else {
        if (cache.internal[filename]) {
            callback(null, { res: res, externals: [], internals: [] });
            return;
        }
        cache.internal[filename] = true;
    }
    var res = patch("" + fs.readFileSync(filename), filename);
    //Filter for system or other not existing modules
    res.deps = res.deps.filter((dep) => !!dep.file);
    //Parallel proc internal dependencies and extern package
    async.parallel({
        externalsFiles: (cb) => async.parallel(res.deps.filter((dep) => dep.package).map((dep) => {
            return pack.bind(this, true, dep.file, config, cache);
        }), cb),
        internalsFiles: (cb) => async.parallel(res.deps.filter((dep) => !dep.package).map((dep) => {
            return pack.bind(this, false, dep.file, config, cache);
        }), cb)
    }, (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        var internals = [];
        results.internalsFiles.map((f) => {
            if (f.res) {
                internals.push(f.res);
            }
            f.internals.map((i) => {
                internals.push(i);
            })
        })
        var externals = results.externalsFiles.map((f) => { return genName(f.info) });
        externals = externals.concat([].concat.apply([], results.internalsFiles.map((internalsFile) => {
            return internalsFile.externals;
        })));
        //Write npm file, if called from foreign package
        if (isMain) {
            writeModule(info, res.code, internals, externals, (err) => {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, { info: info, externals: externals, internals: [] });
                if (cache.main[filename]) {
                    cache.main[filename].listeners.map((cb) => {
                        cb({ info: info, externals: externals, internals: [] })
                    })
                }
            });
        } else {
            callback(null, { res: res, externals: externals, internals: internals });
        }
    })
}
var factory = (filename, config, callback) => {
    pack(true, filename, config, {
        main: {},
        internal: {}
    }, callback ? callback : (err) => {
        if (err) console.error(err);
    });
}
factory.packAll = (packagePath, config, callback) => {
    var packageFile = path.join(packagePath, "package.json");
    var packageInfo = require(packageFile);
    var files = require('glob').sync("**/*.js", { cwd: packagePath });
    var cache = {
        main: {},
        internal: {}
    }
    async.parallel(files.map((file) => {
        file = require('path').join(packagePath, file);
        return pack.bind(this, true, file, config, cache);
    }), (err, results) => {
        if (err) {
            callback(err);
            return;
        }
        var dependencies = Array.from(new Set([].concat.apply([], results.map((result) => {
            return result.externals
        }))));
        fs.writeFileSync(path.join(config.dest, packageInfo.name + "@" + packageInfo.version, "neweb.json"), JSON.stringify({ name: packageInfo.name, version: packageInfo.version, dependencies: dependencies }));
        callback();
    })
}
module.exports = factory;