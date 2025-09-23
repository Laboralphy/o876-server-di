// infrastructure/web/middlewares/validate.ts
import { Context, Next } from 'koa';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
    return async (ctx: Context, next: Next) => {
        try {
            ctx.request.body = schema.parse(ctx.request.body);
            await next();
        } catch (error) {
            if (error instanceof Error) {
                ctx.status = 400;
                ctx.body = { error: error.message };
            } else {
                throw error;
            }
        }
    };
}
