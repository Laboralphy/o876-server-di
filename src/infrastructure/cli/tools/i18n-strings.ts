import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'node:path';

export function initI18n(sLang: string) {
    return i18n.use(Backend).init({
        lng: sLang, // langue par défaut
        fallbackLng: 'en',
        debug: false,
        backend: {
            loadPath: path.join(__dirname, '../../assets/locales/{{lng}}/admin.json'),
        },
    });
}
