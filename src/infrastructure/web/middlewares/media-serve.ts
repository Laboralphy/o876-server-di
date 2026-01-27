import path from 'node:path';
import { send } from '@koa/send';
import { Context, Next } from 'koa';
import { AwilixContainer } from 'awilix';
import { Cradle } from '../../../boot/container';
import { debug } from '../../../libs/o876-debug';

const debugMedia = debug('srv:media');

export function mediaServe(container: AwilixContainer<Cradle>) {
    const REGEX_PATH = /^\/([^/]+)\/(images|sounds)\/(.*)$/;
    const mm = container.resolve('moduleManager');
    return async (ctx: Context, next: Next) => {
        try {
            const sPath = ctx.path;
            // should be something like "/{module_name}/images/items/dagger-1efd.jpg"
            // or "/{module_name}/sounds/mech/door-slam.mp3"
            const r = REGEX_PATH.exec(sPath);
            if (r) {
                const [, sModuleName, sAssetCategory, sAssetPath] = r;
                const sModulePath = mm.getModuleLocation(sModuleName);
                const sAssetResolvedPath = path.resolve(sModulePath, sAssetCategory, sAssetPath);
                await send(ctx, path.basename(sAssetResolvedPath), {
                    root: path.dirname(sAssetResolvedPath),
                });
                debugMedia('transmit media asset: %s', sPath);
            } else {
                debugMedia('request could not lead to valid asset: %s', sPath);
                ctx.status = 404;
            }
        } catch (err) {
            const error = err as Error;
            debugMedia('send error: %s', error.message);
            ctx.status = 404;
        } finally {
            await next();
        }
    };
}
