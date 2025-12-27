import { AbstractContextService, ServerTimeResult } from './AbstractContextService';
import { getMoonPhase } from '../../../libs/moon-phase';
import { ClientCradle } from '../../../boot/container';

export class TimeContextService extends AbstractContextService {
    constructor(cradle: ClientCradle) {
        super(cradle);
    }

    /**
     * Gets information about server time.
     * now: The current timestamp
     * timezone: An iso string describing the timezone where the server is located at
     * moon: Various astronomic data about the moon phase and age
     * moon.age: lunar periodic age (in days)
     * moon.glyph: a unicode character matching the current moon phase
     * moon.label: an i18n string describing moon phase.
     */
    getServerTime(): ServerTimeResult {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const date = new Date();
        const now = date.getTime();
        const moon = getMoonPhase(date);
        return {
            now,
            timezone,
            moon,
        };
    }
}
