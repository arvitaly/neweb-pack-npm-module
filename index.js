var fs = require('fs');
var async = require('async');
var patch = require('module-require-patch');
var getPackageInfo = require('./package-info');
var writeModule = require('./write-module');
var genName = require('./gen-name');
function pack(isMain, filename, config, cache, callback) {
    console.log("pack", filename);
    if (isMain) {
        if (cache.main[filename]) {
            cache.main[filename].listeners.push(callback.bind(undefined, null));
            return;
        }
        var info = getPackageInfo(filename, config.dest);
        if (info.dest.stat) {
            //callback(null, info.dest.info.dependencies);
            ///return;
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
        console.log(internals);
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
module.exports = (filename, config, callback) => {
    pack(true, filename, config, {
        main: {},
        internal: {}
    }, callback ? callback : (err) => {
        if (err) console.error(err);
    });
}