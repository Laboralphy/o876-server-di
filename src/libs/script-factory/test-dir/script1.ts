import { Context } from '../Context';

export async function main(context: Context, param1: string) {
    console.log(param1, context.getId());
}
