import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'node:path';

export async function initI18n(location: string, lng: string, ns: string[]) {
    await i18n.use(Backend).init({
        lng, // langue par défaut
        fallbackLng: 'en',
        debug: true,
        ns,
        backend: {
            loadPath: path.join(location, '{{ lng }}/{{ ns }}.json'),
        },
    });
    return i18n.t;
}
