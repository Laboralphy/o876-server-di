import { ClientContext } from '../domain/classes/ClientContext';
import { MoonPhase } from '../infrastructure/services/context-services/MoonPhase';

export function initContextServices() {
    ClientContext.addService(new MoonPhase());
}
