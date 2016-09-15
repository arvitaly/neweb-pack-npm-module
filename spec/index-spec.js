var mock = require('mock2');
var fixtures = require("fixture2"), f;
describe("Pack", () => {
    var pack;
    beforeEach(() => {
        mock.installSyncFS();
        f = fixtures();
        pack = require('./../index');
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
            'npm!module2@2.1.1#file2']]])
    })
    afterEach(() => {
        mock.uninstallSyncFS();
    })
})