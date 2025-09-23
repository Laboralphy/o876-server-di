// infrastructure/web/middlewares/validate.ts
import { Context, Next } from 'koa';
import { ZodError, ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
    return async (ctx: Context, next: Next) => {
        try {
            ctx.request.body = schema.parse(ctx.request.body);
            await next();
        } catch (error) {
            if (error instanceof ZodError) {
                ctx.status = 422;
                const oErrorPayload = JSON.parse(error.message).shift();
                const sPath = oErrorPayload.path.join('.');
                const sMessage = oErrorPayload.message;
                ctx.body = {
                    error: {
                        property: sPath,
                        message: sMessage,
                    },
                };
            } else if (error instanceof Error) {
                ctx.status = 400;
                ctx.body = { error: error.message };
            } else {
                throw error;
            }
        }
    };
}
