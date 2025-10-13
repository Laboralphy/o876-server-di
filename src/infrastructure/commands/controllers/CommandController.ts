import { Cradle } from '../../../config/container';

/**
 * This classe is a router to command scripts.
 */
export class CommandController {
    constructor(private readonly cradle: Cradle) {}

    runCommand(command: string, args: string[]) {}
}
