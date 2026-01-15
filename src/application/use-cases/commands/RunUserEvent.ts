import { JsonObject } from '../../../domain/types/JsonStruct';
import { IScriptRunner } from '../../ports/services/IScriptRunner';
import { Cradle } from '../../../boot/container';
import { ClientSession } from '../../../domain/types/ClientSession';
import { SYS_EVENTS } from '../../../domain/enums/sys-events';

import { debug } from '../../../libs/o876-debug';
const debugEvent = debug('srv:event');

/**
 * Possible events
 *
 * user events
 * these events are sent to a specific user, the one at the event origin.
 *
 * sysUserAuthenticated
 * sysUserDisconnected
 *
 *
 *
 */

export class RunUserEvent {
    private readonly scriptRunner: IScriptRunner;
    constructor(cradle: Cradle) {
        // get some command script runner here
        this.scriptRunner = cradle.scriptRunner;
    }

    async execute(clientSession: ClientSession, sEvent: SYS_EVENTS, parameters: JsonObject) {
        // events handlers are located at {{ module }}/scripts/events
        debugEvent('client %s -> event %s', clientSession.id, sEvent);
        try {
            return this.scriptRunner.run('events/' + sEvent, {
                parameters,
                context: clientSession.clientContext,
            });
        } catch (error) {
            console.error(error);
            await clientSession.clientContext.print('command-runtime-error', {
                error: (error as Error).message,
                command: sEvent,
            });
        }
    }
}
