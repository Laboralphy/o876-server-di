import { Cradle } from '../../../boot/container';
import { ClientSession } from '../../../domain/types/ClientSession';
import { IScriptRunner } from '../../ports/services/IScriptRunner';
import { JsonArray, JsonObject } from '../../../domain/types/JsonStruct';

export class RunGMCPCommand {
    private readonly scriptRunner: IScriptRunner;
    constructor(cradle: Cradle) {
        // get some command script runner here
        this.scriptRunner = cradle.scriptRunner;
    }

    async execute(
        clientSession: ClientSession,
        opcode: string,
        data: JsonObject | string | null | JsonArray
    ) {
        try {
            const sScriptName = 'gmcp/' + opcode;
            // If script name does not exists, do not fire error
            // the gmcp opcode is simply not supported, this should not be considered as an error
            // We may log this in the future
            if (this.scriptRunner.scriptNames.includes(sScriptName)) {
                const result = this.scriptRunner.run('gmcp/' + opcode, {
                    parameters: data,
                    context: clientSession.clientContext,
                });
                if (result instanceof Promise) {
                    await result;
                }
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            await clientSession.clientContext.print('command-runtime-error', {
                error: (error as Error).message,
                command: opcode,
            });
            return false;
        }
    }
}
