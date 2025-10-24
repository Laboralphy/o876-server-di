import { Cradle } from '../../../config/container';
import { quoteSplit } from '../../../libs/quote-split';

export class RunCommand {
    constructor(cradle: Cradle) {
        // get some command script runner here
    }

    async execute(idClient: string, command: string) {
        // parse command
        command = command.trim();
        if (command == '') {
            return;
        }
        const parameters = quoteSplit(command);
        const opcode = parameters.shift()?.toLowerCase() ?? '';
        console.log('COMMAND %s > %s', idClient, command);
    }
}
