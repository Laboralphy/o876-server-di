import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { init, setLang, render, defineStrings } from '../../libs/i18n-loader';
import { JsonObject } from '../../domain/types/JsonStruct';

export class I18nRepository implements IStringRepository {
    async init() {
        await init();
    }

    async setLanguage(language: string) {
        await setLang(language);
    }

    defineStrings(data: JsonObject, lng: string) {
        defineStrings(data, lng);
    }

    render(key: string, parameters?: JsonObject): string {
        return render(key, parameters);
    }
}
