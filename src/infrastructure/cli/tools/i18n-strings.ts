import { initI18n } from '../../../libs/i18n-string-loader';

export function initI18nStrings(lng: string) {
    return initI18n(lng, ['admin']);
}
