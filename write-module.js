var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
module.exports = (info, code, deps, externals, cb) => {
    var packageNameStart = `npm!${info.package.name}@${info.package.version}#`;
    mkdirp(path.dirname(info.dest.file), () => {
        var content = deps.map((dep) => {            
            return `define("${packageNameStart}${dep.name}",[], function(require,module,exports){${dep.code}})`;
        }).join("\n") + (deps.length > 0 ? "\n" : "") +
            `define("${packageNameStart}${info.request}", [], function(require,module,exports){ ${code} })`;
        fs.writeFile(info.dest.file, content, (err) => {
            if (err) {
                cb(err);
                return;
            }
            fs.writeFile(info.dest.infoFile, JSON.stringify({ dependencies: externals }), (err) => {
                if (err) {
                    cb(err);
                    return;
                }
                cb(null, { dependencies: externals });
            })
        })
    })
}