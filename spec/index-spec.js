var mock = require('mock2');
var rimraf = require("rimraf");
var fixtures = require("fixture2"), f;
describe("Pack", () => {
    var pack;
    var destPath = __dirname + "/fixtures/dest";
    beforeEach(() => {
        mock.installSyncPromise();
        mock.installSyncFS();
        f = fixtures();
        pack = require('./../index');
        rimraf.sync(destPath);
    })
    it("pack", () => {
        pack(__dirname + "/fixtures/source/node_modules/module1/test.js", {
            dest: __dirname + "/fixtures/dest"
        }, f("callback", jasmine.createSpy()))
        expect(f("callback").calls.allArgs()).toEqual([[null, [
            'npm!module1@1.1.1#test',
            'npm!module1@1.1.1#inc1',
            'npm!module1@1.1.1#inc2',
            'npm!module2@2.1.1#file3',
            'npm!module2@2.1.1#file2']]]);
        require.resolve(destPath + "/module1@1.1.1/test");
        require.resolve(destPath + "/module1@1.1.1/inc1");
        require.resolve(destPath + "/module1@1.1.1/inc2");
        require.resolve(destPath + "/module2@2.1.1/file2");
        require.resolve(destPath + "/module2@2.1.1/file3");
    })
    afterEach(() => {
        mock.uninstallSyncFS();
        mock.uninstallSyncPromise();
    })
})