import { IContextMethod, ExtensionContext, IExtension } from './index';

describe('ExtensionContext', () => {
    it('should build an empty context when adding no extension class', () => {
        const ec = new ExtensionContext();
        const c = ec.buildContext();
        expect(c).toEqual({});
    });
    it('should build a context with the "getId" method', () => {
        const ec = new ExtensionContext();
        const MyExt = class implements IExtension {
            public getId() {
                return 'alpha';
            }
            public publishedMethods(): Record<string, IContextMethod> {
                return {
                    getId: () => this.getId(),
                };
            }
        };
        const ex = new MyExt();
        ec.registerExtension('ext1', ex);

        const ctx = ec.buildContext();
        expect(ctx.getId()).toEqual('alpha');
    });
});
