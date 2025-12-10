import { Channel } from 'node:diagnostics_channel';
import { POWERS } from './powers';

/**
 * A user presence is the capacity of a user on a channel
 * A user maybe admin on a channel and a simple reader on another channel
 * @class
 */
export class UserPresence {
    private readonly powers = new Set<POWERS>();
    private _color: string = '';

    constructor(public readonly id: string) {}

    grant(power: POWERS) {
        this.powers.add(power);
    }

    revoke(power: POWERS) {
        this.powers.delete(power);
    }

    hasPower(power: POWERS) {
        return this.powers.has(power);
    }

    get color() {
        return this._color;
    }

    set color(color: string) {
        this._color = color;
    }
}
