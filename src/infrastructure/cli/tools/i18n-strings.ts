import { initI18n } from '../../../libs/i18n-string-loader';
import path from 'node:path';

export function initI18nStrings(lng: string) {
    return initI18n(path.join(__dirname, '../../../assets/locales/'), lng, ['admin']);
}
