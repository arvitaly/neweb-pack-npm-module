import * as ModuleRequirePatch from 'module-require-patch';
declare namespace PackNpmModule {
    interface Result {
        packages: [{
            name: string,
            version: string,
            modules: Array<{
                code: string,
                info: ModuleRequirePatch.Info
            }>
        }]
    }
}
declare function PackNpmModule(modulePath): PackNpmModule.Result;
export = PackNpmModule;