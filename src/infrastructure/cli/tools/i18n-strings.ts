import { init, loadStrings, render, setLang } from '../../../libs/i18n-loader';
import path from 'node:path';

export async function initI18nStrings(lng: string) {
    await init();
    await loadStrings(path.join(__dirname, '../../../assets/locales/en/admin.json'), 'en');
    await loadStrings(path.join(__dirname, '../../../assets/locales/fr/admin.json'), 'fr');
    await setLang(lng);
    return render;
}
