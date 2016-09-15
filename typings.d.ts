import * as ModuleRequirePatch from 'module-require-patch';
declare namespace PackNpmModule {
    interface Result {
        dependencies: Array<string>
    }
}
declare function PackNpmModule(modulePath): PackNpmModule.Result;
export = PackNpmModule;