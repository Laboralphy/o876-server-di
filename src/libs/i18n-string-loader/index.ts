import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'node:path';

export function initI18n(lng: string, ns: string[]) {
    return i18n.use(Backend).init({
        lng, // langue par défaut
        fallbackLng: 'en',
        debug: false,
        ns,
        backend: {
            loadPath: path.join(__dirname, '../../assets/locales/{{ lng }}/{{ ns }}.json'),
        },
    });
}
