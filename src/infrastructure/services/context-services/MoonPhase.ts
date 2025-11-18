import * as mp from '../../../libs/moon-phase';
import { IClientContextService } from '../../../application/ports/classes/IClientContextService';

export class MoonPhase implements IClientContextService {
    getName(): string {
        return 'MoonPhase';
    }

    computeAge(year: number, month: number, day: number): number {
        return mp.computeMoonAge(year, month, day);
    }

    renderPhase(year: number, month: number, day: number): string {
        return mp.renderMoonPhase(year, month, day);
    }
}
