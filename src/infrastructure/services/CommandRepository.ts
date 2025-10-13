import { ScriptFactory } from '../../libs/script-factory';

export class CommandRepository {
    private readonly scriptFactory = new ScriptFactory();

    constructor() {}

    async runCommand(command: string, idUser: string, args: string[]) {
        const script = this.scriptFactory.getModule(command);
        if (script) {
            return script.main();
        }
    }
}
