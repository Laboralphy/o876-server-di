import i18n from 'i18next';
import { IStringRepository } from '../../application/ports/services/IStringRepository';

export class I18nRepository implements IStringRepository {
    getString(key: string, parameters: Record<string, string> = {}): string {
        return i18n.t(key, parameters);
    }
}
