var mock = require('mock2');
var fixtures = require("fixture2");
describe("Pack", () => {
    var pack, f;
    beforeEach(() => {
        mock.installSyncFS();
        f = fixtures();
        pack = require('./../index');
    })
    it("pack", () => {
        pack(__dirname + "/fixtures/source/node_modules/module1/test.js", {
            dest: __dirname + "/fixtures/dest"
        }, f("callback", jasmine.createSpy()))
        console.log(f("callback").calls.allArgs()[0][1]);
    })
    afterEach(() => {
        mock.uninstallSyncFS();
    })
})