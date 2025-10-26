import { Cradle } from '../../../boot/container';
import { quoteSplit } from '../../../libs/quote-split';
import { ClientSession } from '../../../domain/types/ClientSession';
import { ScriptRunner } from '../../../infrastructure/services/ScriptRunner';

export class RunCommand {
    private readonly scriptRunner: ScriptRunner;
    constructor(cradle: Cradle) {
        // get some command script runner here
        this.scriptRunner = cradle.scriptRunner;
    }

    async execute(clientSession: ClientSession, command: string) {
        // parse command
        command = command.trim();
        if (command == '') {
            return;
        }
        const parameters = quoteSplit(command);
        const opcode = parameters.shift()?.toLowerCase() ?? '';
        try {
            return this.scriptRunner.run(opcode, {
                parameters,
                context: clientSession.clientContext,
            });
        } catch (error) {
            console.error(error);
            await clientSession.clientContext.sendMessage('command-runtime-error', {
                error: (error as Error).message,
                command: opcode,
            });
        }
    }
}
