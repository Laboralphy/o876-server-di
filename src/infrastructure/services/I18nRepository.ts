import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { loadFolder, init, setLang, render } from '../../libs/i18n-loader';
import { JsonObject } from '../../domain/types/JsonStruct';

export class I18nRepository implements IStringRepository {
    async init() {
        await init();
    }

    async setLanguage(language: string) {
        await setLang(language);
    }

    async loadFolder(path: string) {
        await loadFolder(path);
    }

    render(key: string, parameters?: JsonObject): string {
        return render(key, parameters);
    }
}
